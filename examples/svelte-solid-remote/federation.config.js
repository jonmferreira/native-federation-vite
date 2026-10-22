import { withNativeFederation, shareAll } from '@softarc/native-federation/config'

export default withNativeFederation({
  name: 'svelte-solid-remote',
  exposes: {
    './SvelteButton': './src/SvelteButton.svelte',
    './SolidButton': './src/SolidButton.tsx'
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' })
  }
  // Note: Solid dedupes out of the box (solid-js shared). Svelte 5 compiles to
  // subpath imports (svelte/internal/*); with the default pruning the core treats
  // `svelte` as unused and inlines the runtime. Setting features.ignoreUnusedDeps
  // = false does dedupe it, but then shares the whole package surface (including
  // svelte/compiler), so it is not recommended. Tracking a cleaner fix upstream.
})
