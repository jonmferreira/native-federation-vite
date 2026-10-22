import { join, parse } from 'node:path'

import { build as viteBuild } from 'vite'
import type { InlineConfig, Plugin as VitePlugin, Rollup } from 'vite'

import type { NFBuildAdapter, NFBuildAdapterOptions } from '@softarc/native-federation'
import { AbortedError } from '@softarc/native-federation/internal'

/** Opt-in configuration for the Vite adapter. Framework presets plug in here. */
export interface ViteAdapterConfig {
  /** Extra Vite plugins (e.g. a framework preset like Vue or React). Opt-in. */
  plugins?: VitePlugin[]
  /** Build target passed to Vite/Rolldown. Default: `'esnext'`. */
  target?: string | string[]
}

/**
 * Map one group of Native Federation entry points to a Vite build config.
 *
 * Pure: no I/O, no Vite invocation. The output file is named after each entry's
 * `outName` base so the core can correlate output files back to exposed keys,
 * matching the esbuild adapter's `entryNames: [name]` behavior.
 */
export function createInlineConfig(
  options: NFBuildAdapterOptions,
  adapterConfig: ViteAdapterConfig
): InlineConfig {
  const { entryPoints, external, outdir, hash, dev = false } = options

  const input: Record<string, string> = {}
  for (const ep of entryPoints) {
    input[parse(ep.outName).name] = ep.fileName
  }

  const fileNames = hash ? '[name]-[hash].js' : '[name].js'

  return {
    configFile: false,
    logLevel: 'warn',
    plugins: adapterConfig.plugins ?? [],
    build: {
      outDir: outdir,
      emptyOutDir: false,
      write: true,
      minify: !dev,
      sourcemap: dev,
      target: adapterConfig.target ?? 'esnext',
      rollupOptions: {
        input,
        external,
        preserveEntrySignatures: 'strict',
        output: {
          format: 'es',
          entryFileNames: fileNames,
          chunkFileNames: fileNames,
          // The core correlates output files to exposed keys by stripping the
          // last "-<hash>" segment. Rolldown's default base64 hash can contain
          // "-", which breaks that. Force hex so hashes never contain a hyphen.
          hashCharacters: 'hex'
        }
      }
    }
  }
}

/** Flatten Vite's build result into the `{ fileName }[]` the core expects. */
function collectWrittenFiles(
  result: Rollup.RollupOutput | Rollup.RollupOutput[],
  outdir: string
): Array<{ fileName: string }> {
  const outputs = Array.isArray(result) ? result : [result]
  const files: Array<{ fileName: string }> = []
  for (const out of outputs) {
    for (const item of out.output) {
      files.push({ fileName: join(outdir, item.fileName) })
    }
  }
  return files
}

/**
 * Record the real source files that went into a build so the core's watcher
 * (which reads the bundler cache's keys) knows what to watch. Virtual modules
 * and query-suffixed variants are collapsed to their on-disk path.
 */
function recordWatchedModules(
  result: Rollup.RollupOutput | Rollup.RollupOutput[],
  bundlerCache: Map<string, unknown>
): void {
  const outputs = Array.isArray(result) ? result : [result]
  for (const out of outputs) {
    for (const item of out.output) {
      if (item.type !== 'chunk') continue
      for (const id of item.moduleIds) {
        if (id.startsWith('\0')) continue
        const file = id.split('?')[0]!
        bundlerCache.set(file, null)
      }
    }
  }
}

/**
 * Native Federation build adapter backed by Vite's programmatic `build()`.
 *
 * The core (`@softarc/native-federation`) drives this: for each group of entry
 * points (exposed modules, shared mappings, node_modules externals) it calls
 * `setup()` then `build()`. We bundle with Vite and return the written files;
 * the core owns `remoteEntry.json`, the import map, and `@nf-internal/` chunk
 * rewriting. Mirrors the esbuild adapter.
 */
export function createViteAdapter(config: ViteAdapterConfig = {}): NFBuildAdapter {
  const cache = new Map<
    string,
    { inline: InlineConfig; outdir: string; bundlerCache?: Map<string, unknown> }
  >()

  const setup = async (name: string, options: NFBuildAdapterOptions): Promise<void> => {
    if (cache.has(name)) return
    cache.set(name, {
      inline: createInlineConfig(options, config),
      outdir: options.outdir,
      bundlerCache: options.cache?.bundlerCache as Map<string, unknown> | undefined
    })
  }

  const build = async (
    name: string,
    opts: { modifiedFiles?: string[]; signal?: AbortSignal } = {}
  ): Promise<Array<{ fileName: string }>> => {
    const entry = cache.get(name)
    if (!entry) {
      throw new Error(`No context found for build "${name}". Call setup() first.`)
    }
    // Vite's build() is one-shot and has no mid-flight cancel; honour the signal
    // by bailing before we start a now-stale rebuild (watch mode queues these).
    if (opts.signal?.aborted) {
      throw new AbortedError(`[vite-adapter] Aborted before building "${name}"`)
    }
    const result = (await viteBuild(entry.inline)) as
      | Rollup.RollupOutput
      | Rollup.RollupOutput[]
    if (entry.bundlerCache) recordWatchedModules(result, entry.bundlerCache)
    return collectWrittenFiles(result, entry.outdir)
  }

  const dispose = async (name?: string): Promise<void> => {
    if (name) cache.delete(name)
    else cache.clear()
  }

  return { setup, build, dispose }
}
