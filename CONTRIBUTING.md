# Contributing

Thanks for your interest in `native-federation-vite`. It is a Vite adapter built
on the `@softarc/native-federation` core, so most contributions are small and
focused.

## Prerequisites

- Node `^20.19.0 || >=22.12.0` (the `exposesFromGlob` helper needs Node 22+).
- npm.

## Setup

```bash
npm install
```

## Development loop

```bash
npm run build      # bundle with tsup (ESM + CJS + d.ts)
npm test           # unit tests (vitest)
npm run typecheck  # tsc --noEmit
npm run guard      # block leaked secrets / sensitive files / unsafe publish set
```

Run an example end to end:

```bash
cd examples/minimal-remote
npm install
npm run build
cat dist/remoteEntry.json
```

## Before you open a PR

- `npm run typecheck && npm test && npm run build && npm run guard` all pass.
- Add or update tests for behavior changes (pure logic lives in small, testable
  functions, e.g. `src/manifest`-style helpers).
- Keep the change focused; avoid unrelated refactors in the same PR.
- Update the README when you change the public API or CLI.
- No new runtime dependencies without discussion (the package ships with zero).

## Commits and PRs

- Conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `ci:`,
  `refactor:`, `perf:`, `build:`. The prefix drives the next version:
  `fix:` is a patch, `feat:` a minor, and `feat!:` (or a `BREAKING CHANGE:`
  footer) a major once past `1.0`. Other types do not trigger a release.
  See [RELEASING.md](RELEASING.md) for the full flow.
- PRs target `main`. CI (guard, typecheck, test, build) runs on every PR.
- For a new feature or an architectural change, open an issue first so we can
  agree on the approach before you write code.

## Scope

This repository owns the Vite adapter and CLI. Issues about the federation
runtime, the manifest contract, or shared-dependency resolution usually belong
to [`@softarc/native-federation`](https://github.com/native-federation). When in
doubt, open an issue here and we will point you the right way.

## Security

Do not open public issues for vulnerabilities. See [SECURITY.md](SECURITY.md)
and use GitHub's private "Report a vulnerability".
