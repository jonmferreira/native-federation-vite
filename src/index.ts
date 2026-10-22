// Native Federation Vite adapter — built on @softarc/native-federation core.
export { createViteAdapter } from './vite-adapter'
export type { ViteAdapterConfig } from './vite-adapter'
export { runViteBuilder } from './builder'
export type { ViteBuilderOptions, ViteBuilderResult } from './builder'
export { exposesFromGlob } from './exposes-from-glob'
export type { ExposesFromGlobOptions } from './exposes-from-glob'
export { renderHeaders, HEADERS_FILENAME } from './headers'
