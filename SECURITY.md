# Security Policy

## Supported versions

This project is pre-1.0 and built in public. Security fixes land on the latest
`0.x` release. Once `1.0.0` ships, this section will track supported ranges.

## Reporting a vulnerability

Please report security issues **privately**, not in a public issue or PR.

- Use GitHub's private reporting: the repository's **Security** tab,
  **"Report a vulnerability"**.
- Include steps to reproduce, affected version, and impact if you can.

You will get an acknowledgement, a fix or mitigation plan, and credit if you want it.

## Threat model

### Build time (this package)

`native-federation-vite` runs at **build time** in your dev or CI environment. Its
surface is small:

- **Zero runtime dependencies** (only `vite` and `@softarc/native-federation` as
  peers). Nothing is added to the browser bundle by this package.
- It executes your own `vite.config.ts` and `federation.config.js`, the same code
  your build already runs. It does not evaluate untrusted input, open the network,
  or handle secrets.

### Runtime (the federation model)

Loading a remote means the host **runs the remote's code in its own origin**. If a
remote is tampered with (a hijacked CDN, a MITM, a compromised build), that code
runs with the host's privileges. This is inherent to any micro frontend setup, not
specific to this adapter. The host and the deployment own these mitigations:

- **Serve every remote over HTTPS** and only trust remote URLs you control.
- **Enable integrity hashes** so the host can verify each bundle. Opt-in, one line,
  emitted by the core:

  ```js
  // federation.config.js
  features: { integrityHashes: true } // adds sha384 SRI to remoteEntry.json
  ```

- **Set a Content-Security-Policy** on the host that allows only the remote origins
  you expect.

We keep hardening **opt-in** and documented rather than forcing configuration. The
adapter stays zero-config first.

## Scope

- **In scope:** the adapter and CLI in this repository (build-time logic, the
  generated manifest shape).
- **Out of scope:** `@softarc/native-federation` core, Vite/Rolldown, the host
  application, and your deployment. Report issues in those to their own projects.
