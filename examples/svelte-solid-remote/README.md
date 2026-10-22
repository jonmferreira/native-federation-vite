# svelte-solid-remote

One remote exposing **two frameworks** at once: a Svelte component and a Solid
component. It shows the adapter is framework-agnostic (the CLI reuses both Vite
plugins from `vite.config.ts`).

```bash
npm install
npm run build   # native-federation-vite build --emit-headers
```

Exposes:
- `./SvelteButton` (`src/SvelteButton.svelte`)
- `./SolidButton` (`src/SolidButton.tsx`)

## What to expect

- **Solid** shares out of the box: `solid-js` is externalized and deduped (the
  component imports bare `solid-js`, resolved by the import map).
- **Svelte 5** builds and federates correctly, but its runtime currently
  **inlines** into the component instead of being shared. Svelte 5 compiles to
  subpath imports (`svelte/internal/*`), and Native Federation's default
  usage-based pruning treats `svelte` as unused. Disabling the pruning
  (`features.ignoreUnusedDeps: false`) does dedupe it, but then shares the whole
  package surface (including `svelte/compiler`, a build-time tool), so it is not
  recommended. A cleaner "share only the used Svelte subpaths" is a Native
  Federation core nuance, tracked for a follow-up with the maintainer.

For a single Svelte remote, inlining is harmless (it works, just a bit larger).
It only matters when several Svelte remotes could share one runtime.
