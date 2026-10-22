# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). While the version
is `0.x`, the public API may change between minor versions.

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
