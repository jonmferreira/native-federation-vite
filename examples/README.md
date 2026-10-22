# Examples

Minimal Vite remotes that use `native-federation-vite` to emit a
`remoteEntry.json`. Each depends on the plugin via `file:../..`, so build the
plugin once at the repo root first:

```bash
npm install && npm run build   # at the repo root
```

Then build an example:

```bash
cd examples/vue-remote    # or examples/react-remote
npm install
npm run build
cat dist/remoteEntry.json
```

## What to look for

`dist/remoteEntry.json` lists each exposed module mapped to its real hashed
output file, plus the shared framework runtime split into its own chunk:

```jsonc
{
  "$version": "v4",
  "name": "vue-remote",
  "exposes": [
    { "key": "./Button", "outFileName": "Button-<hash>.js" },
    { "key": "./Card",   "outFileName": "Card-<hash>.js" }
  ],
  "shared": [
    {
      "packageName": "vue",
      "outFileName": "shared-vue-<hash>.js",
      "version": "3.5.44",
      "requiredVersion": "^3.5.44",
      "singleton": true,
      "strictVersion": false
    }
  ]
}
```
