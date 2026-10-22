import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { exposesFromGlob } from '../src/exposes-from-glob'

const here = dirname(fileURLToPath(import.meta.url))
const fixtures = join(here, 'fixtures', 'glob')

describe('exposesFromGlob', () => {
  it('maps matched files to ./Key => ./path (posix)', () => {
    const exposes = exposesFromGlob('pages/*.vue', { cwd: fixtures })
    expect(exposes).toEqual({
      './Checkout': './pages/Checkout.vue',
      './Product': './pages/Product.vue'
    })
  })

  it('uses the folder name for index files', () => {
    const exposes = exposesFromGlob('widgets/**/index.ts', { cwd: fixtures })
    expect(exposes).toEqual({ './Button': './widgets/Button/index.ts' })
  })

  it('throws on a key collision instead of overwriting', () => {
    expect(() => exposesFromGlob('**/Checkout.vue', { cwd: fixtures })).toThrow(/maps to more than one file/)
  })

  it('accepts a custom key function', () => {
    const exposes = exposesFromGlob('pages/*.vue', {
      cwd: fixtures,
      key: (p) => './' + p.replace(/\.\w+$/, '')
    })
    expect(exposes).toEqual({
      './pages/Checkout': './pages/Checkout.vue',
      './pages/Product': './pages/Product.vue'
    })
  })
})
