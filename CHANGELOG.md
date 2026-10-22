# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). While the version
is `0.x`, the public API may change between minor versions.

## [0.3.0](https://github.com/jonmferreira/native-federation-vite/compare/native-federation-vite-v0.2.0...native-federation-vite-v0.3.0) (2026-10-22)


### Features

* --emit-headers — write _headers (Cloudflare/Netlify) for reliable MFE updates ([0a3f1b6](https://github.com/jonmferreira/native-federation-vite/commit/0a3f1b6c5263bef27b1d06ea2db1f8d6b54a77cd))
* **examples:** React Web Component expose via r2wc (parity with Vue) ([805650b](https://github.com/jonmferreira/native-federation-vite/commit/805650bff2da77d5b947bb2f1b0d270494aff8da))
* **examples:** svelte-solid-remote — Svelte 5 + Solid in one remote ([3d75e9c](https://github.com/jonmferreira/native-federation-vite/commit/3d75e9c86c2a74a29a87bfc45e967c6eddfee4d4))
* **examples:** validate Angular shell loading Vite remotes as Web Components ([1e346c7](https://github.com/jonmferreira/native-federation-vite/commit/1e346c7184a9a105d79667f8b8e1894c3b484c2e))


### Bug Fixes

* **adapter:** share CJS runtimes (React) via esm-external-require ([fbcd570](https://github.com/jonmferreira/native-federation-vite/commit/fbcd57096599fc224d78f69d81beeddc3b656657))
* **cli:** work for config-less remotes; add --help/--version/--ts-config ([1b45708](https://github.com/jonmferreira/native-federation-vite/commit/1b457084088aef1f973c00155e8de4496140d23d))

## [0.2.0] - 2026-10-22

### Changed

- Require Vite 8 (Rolldown). The adapter now uses Rolldown's
  `esmExternalRequirePlugin` (available only in Vite 8) for CJS sharing, so the
  peer range is corrected from `^5 || ^6 || ^7 || ^8` to `^8.0.0`. This matches
  the bundler the adapter has always targeted.

### Added

- `--emit-headers`: write a `_headers` file (Cloudflare Pages / Netlify) so a
  browser refresh reliably picks up redeployed remotes (manifests revalidate,
  hashed bundles cache forever).
- CLI flags `--help`, `--version` and `--ts-config`, plus a usage message on
  invalid input instead of a raw stack trace.
- Builds for remotes that have no `tsconfig.json`: a minimal default is generated
  at the workspace root for the build and removed afterward (the Native
  Federation core reads path mappings from a tsconfig).

### Fixed

- Shared CommonJS runtimes (React, `react-dom`) now work. `react-dom` calls
  `require('react')` internally; when `react` is externalized for singleton
  sharing, Rolldown left that `require` in place and it threw in the browser.
  The adapter now applies Rolldown's `esmExternalRequirePlugin`, so the require
  resolves through the Native Federation import map and `react` stays a single
  shared instance.

### Validated

- An Angular shell renders both a Vue and a React remote as Web Components, both
  interactive, with `react` fetched once. See `examples/angular-shell`.
- The published tarball was exercised as a real consumer (`npm pack` + install),
  not only through the local `file:` link the examples use.

## [0.1.0] - 2026-10

### Added

- Initial release. Vite adapter built on the `@softarc/native-federation` core:
  emits `remoteEntry.json` and the import map via the core.
- Shared dependencies, singletons and `@nf-internal/` chunking (handled by the
  core; the adapter produces the chunks).
- CLI that reuses the project's `vite.config` plugins automatically.
- Watch mode with a shared-dependency cache reused across rebuilds.
- `exposesFromGlob` helper, opt-in Web Component expose, opt-in integrity (SRI).
- Examples for Vue, React, Solid and vanilla remotes.

[0.2.0]: https://github.com/jonmferreira/native-federation-vite/releases/tag/v0.2.0
[0.1.0]: https://github.com/jonmferreira/native-federation-vite/releases/tag/v0.1.0
