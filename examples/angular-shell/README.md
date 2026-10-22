# Angular shell consuming Vite remotes

A minimal Angular 22 shell that loads Vite-built remotes through
`@angular-architects/native-federation`. The remotes expose **Web Components**
(a custom element per feature), so the shell does not need any
framework-specific mount glue: it defines the element and drops the tag in a
template.

This proves the end goal of `native-federation-vite`: an Angular host and a Vite
remote sharing one Native Federation runtime and one import map, with shared
deps loaded a single time.

## How it wires together

1. Each remote is built with `native-federation-vite build`, producing
   `dist/remoteEntry.json` plus content-hashed bundles.
2. The shell calls `initFederation(manifest, { hostRemoteEntry: false })` in
   `main.ts`. That reads every remote's `remoteEntry.json` and builds a single
   import map. `hostRemoteEntry: false` marks the shell as consume-only so it
   does not look for its own `./remoteEntry.json` (see note below).
3. `app.component.ts` resolves the exposed element through the import map with
   `window.importShim('<remote>/./ButtonElement')` and registers it via
   `customElements.define`.

## Two manual steps a plain `ng build` host needs

The official native-federation Angular *builder* injects these for you. This
example uses a plain `ng build`/`ng serve` host on purpose, to show the moving
parts, so it adds them by hand:

- **es-module-shims** in `src/index.html`. Native Federation runs in shim mode
  by default; the import map it injects is an `importmap-shim` that
  es-module-shims resolves. Without the shim script, `window.importShim` never
  exists.
- **`hostRemoteEntry: false`** in `main.ts`. Without the NF builder there is no
  host `remoteEntry.json`, so leaving the default on produces a 404. Setting it
  to `false` is the core's supported way to say "this host only consumes".

## Running it

Build and serve each remote (one terminal each), then serve the shell.

```bash
# Vue remote on 4310
cd examples/vue-remote
npm install
npm run build
npx vite preview --port 4310

# React remote on 4311
cd examples/react-remote
npm install
npm run build
npx vite preview --port 4311

# Angular shell on 4200
cd examples/angular-shell
npm install
npm start
```

Open http://localhost:4200.

## What you should see

- **Vue section**: a `<vue-fed-button>` renders and increments its counter on
  click. This is a Vite-built Vue component running inside Angular, resolved
  through the Native Federation import map.
- **Network tab**: two `remoteEntry.json` requests, and the shared Vue runtime
  chunk fetched once (singleton), not per expose.

## Known gotcha: React remote + Rolldown CJS interop

The React remote currently fails to instantiate in the shell with:

```
Calling require for "react" in an environment that doesn't expose the require function
```

React and `react-dom` still ship CommonJS entry points. When Rolldown (Vite 8)
externalizes them for sharing, the generated bundle reaches for `require` at
runtime, which does not exist in the browser ES module context. This is a
bundler-interop issue, not a flaw in the remoteEntry the plugin emits: the same
remote renders fine in an import-map host that provides a CJS shim. Tracking a
clean fix (CJS-to-ESM interop shim or pre-bundling React as ESM) before the
React path is marked validated. Vue, Solid and vanilla remotes do not hit this
because their runtimes are already ESM.

## Troubleshooting

- **`window.importShim is not a function`**: es-module-shims has not loaded yet.
  It is an `async` script; `app.component.ts` waits for it before resolving.
- **404 on `./remoteEntry.json`**: the shell is trying to load a host entry.
  Confirm `hostRemoteEntry: false` is set in `main.ts`.
- **remoteEntry 404 from a remote**: confirm the ports in `main.ts` match the
  `vite preview` ports above, and that each remote was built first.
