import { globSync } from 'node:fs'
import { posix } from 'node:path'

export interface ExposesFromGlobOptions {
  /** Directory the glob is resolved against. Default: `process.cwd()`. */
  cwd?: string
  /**
   * Derive the exposed key (e.g. `./Button`) from a matched path (posix,
   * relative to `cwd`). Default: the file's base name without its extension,
   * or the parent folder's name for `index.*` files.
   */
  key?: (relativePath: string) => string
}

function defaultKey(relativePath: string): string {
  const name = posix.basename(relativePath, posix.extname(relativePath))
  if (name === 'index') return './' + posix.basename(posix.dirname(relativePath))
  return './' + name
}

/**
 * Build a Native Federation `exposes` map from a glob, so you don't list files
 * by hand. Each match becomes `{ './Key': './path/to/file' }`. Keys must be
 * unique: a collision throws rather than silently overwriting.
 *
 * ```js
 * exposes: exposesFromGlob('src/pages/*.vue')
 * // → { './Checkout': './src/pages/Checkout.vue', './Product': './src/pages/Product.vue' }
 * ```
 */
export function exposesFromGlob(
  patterns: string | string[],
  options: ExposesFromGlobOptions = {}
): Record<string, string> {
  if (typeof globSync !== 'function') {
    throw new Error('exposesFromGlob requires Node 22+ (fs.globSync). List `exposes` manually on older Node.')
  }

  const cwd = options.cwd ?? process.cwd()
  const toKey = options.key ?? defaultKey

  const matches = globSync(patterns, { cwd })
    .map((m) => m.replace(/\\/g, '/'))
    .sort()

  const exposes: Record<string, string> = {}
  for (const rel of matches) {
    const key = toKey(rel)
    const value = './' + rel.replace(/^\.\//, '')
    if (exposes[key] && exposes[key] !== value) {
      throw new Error(
        `exposesFromGlob: key "${key}" maps to more than one file ` +
          `("${exposes[key]}" and "${value}"). Rename a file or pass a custom \`key\`.`
      )
    }
    exposes[key] = value
  }
  return exposes
}
