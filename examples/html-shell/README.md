# HTML Shell — Native Federation Vite PoC (Minimal)

A **minimal HTML shell** (sem frameworks, sem build) que valida o plugin v0.1 chamando
`initFederation()` + `loadRemoteModule()` direto via browser.

## Por que HTML shell?

- ✅ Sem dependências (TypeScript, Angular, build complexo)
- ✅ Validação rápida do plugin (5 minutos setup)
- ✅ Sem build nem toolchain (nada de tsconfig/Angular pra configurar)
- ✅ Isolado — nenhuma alteração no portfolio-dev

## Running

### Terminal 1: Vue Remote

```bash
cd examples/vue-remote
npm run build    # Or: npx vite build (se quiser dev mode)
npx vite preview --port 5173 --host
```

Serve `http://localhost:5173/dist/remoteEntry.json`.

### Terminal 2: React Remote

```bash
cd examples/react-remote
npm run build
npx vite preview --port 5174 --host
```

Serve `http://localhost:5174/dist/remoteEntry.json`.

### Terminal 3: Open HTML Shell

```bash
# Opção A: Python HTTP server (macOS/Linux)
python3 -m http.server 8000 --directory examples/html-shell

# Opção B: Node http-server
npx http-server examples/html-shell -p 8000

# Opção C: VS Code Live Server
# Abrir examples/html-shell/index.html e "Open with Live Server"
```

Acesse `http://localhost:8000` no browser.

## O que validar

1. **Console (F12)**:
   - Deve ver `[shell] Initializing federation...`
   - Depois `[shell] Federation initialized ✓`
   - Depois `[shell] Loading Vue remote...`
   - Depois `[shell] Loading React remote...`
   - Se houver erro (vermelho), o problema tá na URL ou no remoteEntry.json

2. **Network (F12 → Network tab)**:
   - `remoteEntry.json` (2 requests — vue e react)
   - `shared-vue-*.js` (1 request, deve estar em 15KB+)
   - `shared-react-*.js` (1 request, deve estar em 1KB+)
   - Se `shared-vue` ou `shared-react` aparecerem **múltiplas vezes**, o singleton não tá funcionando

3. **Page**:
   - Dois boxes com status "Vue loaded" e "React loaded"
   - Se houver "❌", ver a mensagem de erro no page ou no console

## Troubleshooting

### remoteEntry.json 404

Verificar:
- Port das remotes está certo? (5173 para vue, 5174 para react)
- `examples/vue-remote/dist/` e `examples/react-remote/dist/` existem?
- Rodaram `npm run build` antes de `vite preview`?

### "Cannot find module"

Verificar em `http://localhost:5173/dist/remoteEntry.json`:
```json
{
  "name": "vue-remote",
  "exposes": [...],
  "shared": [...]
}
```

Se `exposes` ou `shared` estão vazios, o plugin não tá gerando corretamente.

### shared deps carregando 2x

Se `shared-vue-*.js` aparece **2 vezes** na Network tab:
- Singleton flag não tá sendo respeitado
- Verificar no plugin: `shared.ts` → `singleton: true` pra frameworks

## O que não há neste shell

- ❌ Renderização de verdade dos componentes (só mostra "loaded")
- ❌ Web Components (seria mais complexo)
- ❌ Integração Angular

Para renderização real, ver `examples/angular-shell/` (Angular 22 + TypeScript 6).

## Próximas etapas

Se este PoC validar que:
1. `remoteEntry.json` é gerado corretamente ✅
2. Shared deps (vue, react) carregam 1x ✅
3. `initFederation()` consegue resolver os remotes ✅

Então v0.1 está **completo e pronto para npm publish**.
