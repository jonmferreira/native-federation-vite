#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'

import { loadConfigFromFile } from 'vite'
import type { Plugin as VitePlugin } from 'vite'

import { runViteBuilder } from './builder'

const VITE_CONFIG_CANDIDATES = ['vite.config.ts', 'vite.config.js', 'vite.config.mjs']

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
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      config: { type: 'string', default: 'federation.config.js' },
      out: { type: 'string', default: 'dist' },
      watch: { type: 'boolean', default: false },
      dev: { type: 'boolean', default: false },
      'vite-config': { type: 'string' },
      'no-vite-config': { type: 'boolean', default: false }
    }
  })

  const command = positionals[0] ?? 'build'
  if (command !== 'build') {
    console.error(`Unknown command "${command}". Usage: native-federation-vite build [options]`)
    process.exit(1)
  }

  const root = process.cwd()
  const plugins = values['no-vite-config']
    ? []
    : await loadVitePlugins(root, values['vite-config'])

  const result = await runViteBuilder(values.config, {
    workspaceRoot: root,
    outputPath: resolve(root, values.out),
    dev: values.dev,
    watch: values.watch,
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
