# Angular Shell — Native Federation Vite PoC

Minimal Angular shell that uses `@angular-architects/native-federation` to load
and share Vite remotes (Vue Button + React Button).

## Setup

```bash
# At the repo root, build the plugin first
cd ../..
npm install && npm run build

# Install shell deps
cd examples/angular-shell
npm install
```

## Running the PoC

You need **3 terminals** to validate shared dependencies:

### Terminal 1: Vue Remote Dev Server

```bash
cd examples/vue-remote
npm run build    # Or: npx vite serve (if you want HMR during dev)
npx vite preview --port 5173 --host
```

The Vue remote's `dist/remoteEntry.json` will be served at
`http://localhost:5173/dist/remoteEntry.json`.

### Terminal 2: React Remote Dev Server

```bash
cd examples/react-remote
npx vite preview --port 5174 --host
```

The React remote's `dist/remoteEntry.json` will be served at
`http://localhost:5174/dist/remoteEntry.json`.

### Terminal 3: Angular Shell

```bash
cd examples/angular-shell
ng serve --port 4200 --open
```

The shell will open in the browser at `http://localhost:4200`.

## What to Look For

1. **Browser console (F12)** — should log:
   - `[shell] Carregando Vue remote...`
   - `[shell] Vue Button carregado: ...`
   - `[shell] Carregando React remote...`
   - `[shell] React Button carregado: ...`

2. **Network tab** — you should see:
   - `remoteEntry.json` from both remotes (2 requests)
   - `shared-vue-*.js` — the Vue runtime (1 request, singleton shared)
   - `shared-react-*.js` — the React runtime (1 request, singleton shared)
   - `Button-*.js` from each remote (2 requests)

3. **The page** — two green/cyan buttons rendering alongside each other, proving
   both frameworks are working inside the Angular host.

## Testing Shared Deps

Open DevTools → Network → Preserve log, then hard-reload (Ctrl+Shift+R).

- The `shared-vue-*.js` chunk should load **once**, not per remote.
- The `shared-react-*.js` chunk should load **once**, not per remote.
- If Vue/React loaded multiple times, the singleton flag or shared detection
  in the plugin isn't working.

## Troubleshooting

### CORS errors

The remotes run on different ports. Ensure your dev server allows cross-origin
requests. Vite's preview mode should handle this by default; if using webpack
dev server, add `devServer: { headers: { 'Access-Control-Allow-Origin': '*' } }`.

### remoteEntry.json 404

Double-check the URLs in `src/app/app.config.ts` match your dev server ports.

### Module loading fails

Ensure the `remoteEntry.json` is valid JSON. Check `examples/vue-remote/dist/remoteEntry.json`
and `examples/react-remote/dist/remoteEntry.json` manually.

## Next Steps

Once this PoC loads both remotes without errors:
- v0.2 is validated ✅
- Move to Svelte + Solid support (v0.3)
- Publish on npm + open the repo for GitHub Sponsors
