# Releasing

This project versions with [Semantic Versioning](https://semver.org) and derives
each release from [Conventional Commits](https://www.conventionalcommits.org).
You do not hand-pick version numbers: the commit history decides the bump.

## Commit types and the bump they cause

| Commit prefix | Example | Release effect |
|---|---|---|
| `fix:` | `fix(adapter): share CJS runtimes` | patch (`0.2.0` -> `0.2.1`) |
| `feat:` | `feat(cli): add --ts-config` | minor (`0.2.0` -> `0.3.0`) |
| `feat!:` or a `BREAKING CHANGE:` footer | `feat(cli)!: drop --legacy` | major (`0.2.0` -> `1.0.0`)¹ |
| `docs:`, `test:`, `chore:`, `ci:`, `refactor:`, `perf:`, `build:`, `style:` | `docs: fix typo` | no release on its own |

¹ While the version is `0.x`, a breaking change bumps the minor, not the major
(SemVer treats `0.x` as unstable). Once `1.0.0` ships, `feat!` bumps the major.

Scopes we use: `adapter`, `builder`, `cli`, `headers`, `examples`, `docs`, `ci`.
Scope is optional but preferred; it becomes the CHANGELOG grouping.

Only changes to the published files (`dist`, `README.md`, `LICENSE`) affect the
npm package. A commit that touches only `examples/` or `.github/` still lands in
git history and can appear in release notes, but it does not force a new npm
version by itself. Mark such commits `docs:`/`chore:`/`test:` so they do not
trigger a release.

## Automated flow (release-please)

A GitHub Action ([`release-please`](.github/workflows/release-please.yml)) watches
`main`. On every push it reads the Conventional Commits since the last release and
keeps an open **Release PR** that:

- bumps `package.json` to the computed version,
- updates `CHANGELOG.md` with the changes grouped by type,
- sets the git tag and GitHub Release once merged.

Nothing is released until you **merge the Release PR**. That merge is the single
"ship it" switch, which keeps control of when each version goes out.

> One repo setting is required for the bot to open PRs: Settings -> Actions ->
> General -> "Allow GitHub Actions to create and approve pull requests".

## Publishing to npm

`npm publish` is kept manual on purpose (publishing is irreversible and we want a
human on it). After the Release PR is merged and the `vX.Y.Z` tag exists:

```bash
git checkout main && git pull
npm run guard && npm run typecheck && npm test && npm run build
npm publish            # prepublishOnly re-runs guard/typecheck/test/build
```

To automate this later, add an `NPM_TOKEN` secret and a workflow that runs on the
`release` event. Not enabled today, so no token is stored.

## Cutting a release by hand (fallback)

If you are not using the Release PR for a given release:

```bash
npm version minor      # or patch / major; updates package.json + creates a tag
# edit CHANGELOG.md: move Unreleased items under the new version with today's date
git push --follow-tags
npm publish
```
