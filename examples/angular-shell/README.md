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
  click. A Vite-built Vue component running inside Angular, resolved through the
  Native Federation import map.
- **React section**: a `<react-fed-button>` renders and increments its own
  counter on click, proving React hooks and state are live inside the same host.
- **Network tab**: two `remoteEntry.json` requests, and each shared runtime chunk
  (`react.<hash>.js`, `vue.<hash>.js`) fetched once (singleton), not per expose.
- **Console**: no errors. (Angular's dev server logs two benign "Critical
  dependency" warnings from the native-federation orchestrator; those are
  expected.)

## Note: how React (a CJS runtime) is shared

React and `react-dom` still ship CommonJS entry points, and `react-dom`
internally calls `require('react')`. When `react` is externalized to be shared
as a singleton, Rolldown (Vite 8) leaves that `require` in place, and it throws
in the browser (`Calling require ... doesn't expose the require function`),
because there is no `require` in an ES module context.

`native-federation-vite` handles this for you: it applies Rolldown's builtin
`esmExternalRequirePlugin`, which rewrites `require(<external>)` into a real
`import`. That import resolves through the same Native Federation import map, so
`react-dom` and the exposed component share one `react` instance (loaded once).
You do not need to configure anything in this example. Vue, Solid and vanilla
remotes never trigger it, since their runtimes are already ESM.

## Troubleshooting

- **`window.importShim is not a function`**: es-module-shims has not loaded yet.
  It is an `async` script; `app.component.ts` waits for it before resolving.
- **404 on `./remoteEntry.json`**: the shell is trying to load a host entry.
  Confirm `hostRemoteEntry: false` is set in `main.ts`.
- **remoteEntry 404 from a remote**: confirm the ports in `main.ts` match the
  `vite preview` ports above, and that each remote was built first.
