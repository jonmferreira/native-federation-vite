import { describe, expect, it } from 'vitest'

import { renderHeaders, HEADERS_FILENAME } from '../src/headers'

describe('renderHeaders', () => {
  const out = renderHeaders()

  it('writes to the _headers file name', () => {
    expect(HEADERS_FILENAME).toBe('_headers')
  })

  it('revalidates the manifests on every load', () => {
    expect(out).toContain('/remoteEntry.json\n  Cache-Control: no-cache')
    expect(out).toContain('/importmap.json\n  Cache-Control: no-cache')
  })

  it('caches content-hashed bundles immutably', () => {
    expect(out).toContain('/*.js\n  Cache-Control: public, max-age=31536000, immutable')
    expect(out).toContain('/assets/*\n  Cache-Control: public, max-age=31536000, immutable')
  })
})
