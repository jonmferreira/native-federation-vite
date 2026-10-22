import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  buildForFederation,
  createFederationCache,
  getExternals,
  normalizeFederationOptions,
  rebuildForFederation,
  setBuildAdapter
} from '@softarc/native-federation'
import type { FederationInfo } from '@softarc/native-federation'
import {
  AbortedError,
  createNfWatcher,
  linkedSharedDirs,
  logger,
  RebuildQueue,
  sharedMappingDirs,
  syncNfFileWatcher
} from '@softarc/native-federation/internal'

import { createViteAdapter, type ViteAdapterConfig } from './vite-adapter'
import { renderHeaders, HEADERS_FILENAME } from './headers'

export interface ViteBuilderOptions {
  /** Where the federated artifacts (remoteEntry.json + bundles) are written. */
  outputPath: string
  /** Workspace root. Default: `process.cwd()`. */
  workspaceRoot?: string
  /** Path to the project's `tsconfig.json` (optional). */
  tsConfig?: string
  /** Name reported for the project (optional). */
  projectName?: string
  /** Path to the project's `package.json` (optional, for version inference). */
  packageJson?: string
  /** Dev build (no minify, sourcemaps). Default: `false`. */
  dev?: boolean
  /** Cache directory. Default: `<outputPath>/.nf-cache`. */
  cachePath?: string
  /** Rebuild on file changes. Default: `false`. */
  watch?: boolean
  /** Debounce before a watch-triggered rebuild, in ms. Default: `50`. */
  rebuildDelay?: number
  /**
   * Emit a `_headers` file (Cloudflare Pages / Netlify) so a refresh reliably
   * picks up redeployed remotes: manifests revalidate, hashed bundles cache
   * forever. Default: `false`.
   */
  emitHeaders?: boolean
  /** Opt-in adapter config (framework plugins, target). */
  adapterConfig?: ViteAdapterConfig
}

export interface ViteBuilderResult {
  /** Latest federation manifest (updates across rebuilds in watch mode). */
  readonly federationInfo: FederationInfo
  readonly externals: string[]
  /** Stop watching (if any) and dispose the adapter. */
  close(): Promise<void>
}

/**
 * Drive a Native Federation build using Vite as the bundler.
 *
 * Reads a `federation.config.js` (via `withNativeFederation`), registers the
 * Vite adapter, and lets the core bundle everything and emit `remoteEntry.json`
 * plus the import map. With `watch: true`, the core's file watcher drives
 * incremental rebuilds; the shared-dependency cache is reused across rebuilds so
 * only changed bundles are rebuilt. Mirrors `runEsBuildBuilder`.
 */
export async function runViteBuilder(
  federationConfigPath: string,
  options: ViteBuilderOptions
): Promise<ViteBuilderResult> {
  const workspaceRoot = options.workspaceRoot ?? process.cwd()
  const cachePath = options.cachePath ?? join(options.outputPath, '.nf-cache')

  const adapter = createViteAdapter(options.adapterConfig)
  setBuildAdapter(adapter)

  // One cache instance for the builder's whole lifetime — reused across rebuilds.
  const bundlerCache = new Map<string, unknown>()
  const { config, options: fedOptions } = await normalizeFederationOptions(
    {
      projectName: options.projectName,
      workspaceRoot,
      outputPath: options.outputPath,
      federationConfig: federationConfigPath,
      tsConfig: options.tsConfig,
      dev: options.dev ?? false,
      watch: options.watch ?? false,
      packageJson: options.packageJson
    },
    createFederationCache(cachePath, bundlerCache)
  )

  const externals = getExternals(config)

  let federationInfo: FederationInfo
  try {
    federationInfo = await buildForFederation(config, fedOptions, externals)
  } catch (error) {
    await adapter.dispose()
    throw error
  }

  if (options.emitHeaders) {
    writeFileSync(join(options.outputPath, HEADERS_FILENAME), renderHeaders())
  }

  if (!options.watch) {
    return {
      get federationInfo() {
        return federationInfo
      },
      externals,
      close: () => adapter.dispose()
    }
  }

  const stopWatching = startWatch({
    config,
    fedOptions,
    externals,
    bundlerCache,
    rebuildDelay: options.rebuildDelay ?? 50,
    onRebuilt: (info) => {
      federationInfo = info
    }
  })

  return {
    get federationInfo() {
      return federationInfo
    },
    externals,
    async close() {
      await stopWatching()
      await adapter.dispose()
    }
  }
}

interface WatchDeps {
  config: Parameters<typeof rebuildForFederation>[0]
  fedOptions: Parameters<typeof rebuildForFederation>[1]
  externals: string[]
  bundlerCache: Map<string, unknown>
  rebuildDelay: number
  onRebuilt: (info: FederationInfo) => void
}

/** Wire the core's file watcher to debounced, cancellable federation rebuilds. */
function startWatch(deps: WatchDeps): () => Promise<void> {
  const { config, fedOptions, externals, bundlerCache, rebuildDelay, onRebuilt } = deps

  const queue = new RebuildQueue()
  const pending = new Set<string>()
  let closed = false

  const watcher = createNfWatcher({
    onChange: (changedPath: string) => {
      if (closed) return
      pending.add(changedPath)
      void triggerRebuild()
    }
  })

  const linkedDirs = linkedSharedDirs(config, fedOptions)
  watcher.addPaths(sharedMappingDirs(config))
  syncNfFileWatcher(watcher, bundlerCache, linkedDirs)

  async function triggerRebuild(): Promise<void> {
    await queue.track(async (signal: AbortSignal) => {
      try {
        await delay(rebuildDelay, signal)
        const files = [...pending]
        pending.clear()
        const info = await rebuildForFederation(config, fedOptions, externals, files, signal)
        syncNfFileWatcher(watcher, bundlerCache, linkedDirs)
        onRebuilt(info)
        logger.info('Federation rebuild done.')
        return { success: true }
      } catch (error) {
        if (error instanceof AbortedError) return { success: false, cancelled: true }
        logger.error('Federation rebuild failed!')
        return { success: false }
      }
    })
  }

  return async () => {
    closed = true
    queue.dispose()
    await watcher.close()
  }
}

/** Promise delay that rejects (AbortedError) if the rebuild is superseded. */
function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(new AbortedError('[vite-builder] Debounce canceled'))
      },
      { once: true }
    )
  })
}
