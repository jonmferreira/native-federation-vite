#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'

import { loadConfigFromFile } from 'vite'
import type { Plugin as VitePlugin } from 'vite'

import { runViteBuilder } from './builder'

const VITE_CONFIG_CANDIDATES = ['vite.config.ts', 'vite.config.js', 'vite.config.mjs']

const USAGE = `native-federation-vite - build Native Federation remotes with Vite

Usage:
  native-federation-vite build [options]

Options:
  --config <path>        Federation config file (default: federation.config.js)
  --out <dir>            Output directory (default: dist)
  --ts-config <path>     tsconfig to use (auto-detected; a minimal default is
                         generated when the project has none)
  --vite-config <path>   Vite config to reuse plugins from (default: autodetect)
  --no-vite-config       Do not reuse any Vite config plugins
  --emit-headers         Write a _headers file (Cloudflare Pages / Netlify)
  --dev                  Dev build (no minify, sourcemaps)
  --watch                Rebuild on file changes
  -h, --help             Show this help
  -v, --version          Show the installed version`

function readVersion(): string {
  try {
    const require = createRequire(import.meta.url)
    const pkg = JSON.parse(readFileSync(require.resolve('../package.json'), 'utf8')) as {
      version?: string
    }
    return pkg.version ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

/**
 * Reuse the project's existing Vite plugins (e.g. vue()/react()) so the user
 * doesn't declare them twice. We take only `plugins` from the resolved config;
 * the federation build owns everything else.
 */
async function loadVitePlugins(root: string, explicit?: string): Promise<VitePlugin[]> {
  const candidates = explicit ? [explicit] : VITE_CONFIG_CANDIDATES
  for (const candidate of candidates) {
    const path = resolve(root, candidate)
    if (!existsSync(path)) continue
    const loaded = await loadConfigFromFile({ command: 'build', mode: 'production' }, path, root)
    const raw = loaded?.config.plugins ?? []
    const flat = await Promise.all((raw as unknown[]).flat(Infinity))
    return flat.filter(Boolean) as VitePlugin[]
  }
  return []
}

async function main(): Promise<void> {
  let parsed
  try {
    parsed = parseArgs({
      allowPositionals: true,
      options: {
        config: { type: 'string', default: 'federation.config.js' },
        out: { type: 'string', default: 'dist' },
        'ts-config': { type: 'string' },
        watch: { type: 'boolean', default: false },
        dev: { type: 'boolean', default: false },
        'vite-config': { type: 'string' },
        'no-vite-config': { type: 'boolean', default: false },
        'emit-headers': { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
        version: { type: 'boolean', short: 'v', default: false }
      }
    })
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    console.error(`\n${USAGE}`)
    process.exit(1)
  }
  const { values, positionals } = parsed

  if (values.help) {
    console.log(USAGE)
    return
  }
  if (values.version) {
    console.log(readVersion())
    return
  }

  const command = positionals[0] ?? 'build'
  if (command !== 'build') {
    console.error(`Unknown command "${command}".\n\n${USAGE}`)
    process.exit(1)
  }

  const root = process.cwd()
  const plugins = values['no-vite-config']
    ? []
    : await loadVitePlugins(root, values['vite-config'])

  const result = await runViteBuilder(values.config, {
    workspaceRoot: root,
    outputPath: resolve(root, values.out),
    tsConfig: values['ts-config'],
    dev: values.dev,
    watch: values.watch,
    emitHeaders: values['emit-headers'],
    adapterConfig: { plugins }
  })

  const { name, exposes, shared } = result.federationInfo
  console.log(`\n✓ ${name}: ${exposes.length} exposed, ${shared.length} shared → ${values.out}`)

  if (values.watch) {
    console.log('Watching for changes… (Ctrl+C to stop)')
    const stop = async () => {
      await result.close()
      process.exit(0)
    }
    process.on('SIGINT', stop)
    process.on('SIGTERM', stop)
  } else {
    await result.close()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
