import { describe, expect, it } from 'vitest'

import { createInlineConfig } from '../src/vite-adapter'
import type { NFBuildAdapterOptions } from '@softarc/native-federation'

function options(overrides: Partial<NFBuildAdapterOptions> = {}): NFBuildAdapterOptions {
  return {
    entryPoints: [{ fileName: '/abs/src/Button.ts', outName: './Button.js', key: './Button' }],
    external: ['vue'],
    outdir: '/abs/dist',
    mappedPaths: {},
    isMappingOrExposed: true,
    hash: true,
    cache: {} as NFBuildAdapterOptions['cache'],
    ...overrides
  }
}

describe('createInlineConfig', () => {
  it('maps entry points to inputs keyed by the outName base', () => {
    const cfg = createInlineConfig(options(), {})
    expect(cfg.build?.rollupOptions?.input).toEqual({ Button: '/abs/src/Button.ts' })
  })

  it('hashes output file names when hash is true', () => {
    const cfg = createInlineConfig(options({ hash: true }), {})
    const output = cfg.build?.rollupOptions?.output as { entryFileNames?: string }
    expect(output.entryFileNames).toBe('[name]-[hash].js')
  })

  it('omits the hash when hash is false', () => {
    const cfg = createInlineConfig(options({ hash: false }), {})
    const output = cfg.build?.rollupOptions?.output as { entryFileNames?: string }
    expect(output.entryFileNames).toBe('[name].js')
  })

  it('passes externals through and emits ES modules', () => {
    const cfg = createInlineConfig(options({ external: ['vue', 'react'] }), {})
    const rollup = cfg.build?.rollupOptions
    expect(rollup?.external).toEqual(['vue', 'react'])
    expect((rollup?.output as { format?: string }).format).toBe('es')
  })

  it('never reads a stray vite.config and does not empty the shared outdir', () => {
    const cfg = createInlineConfig(options(), {})
    expect(cfg.configFile).toBe(false)
    expect(cfg.build?.emptyOutDir).toBe(false)
  })

  it('forwards opt-in plugins and target', () => {
    const plugin = { name: 'x' }
    const cfg = createInlineConfig(options(), { plugins: [plugin], target: 'es2020' })
    expect(cfg.plugins).toEqual([plugin])
    expect(cfg.build?.target).toBe('es2020')
  })
})
