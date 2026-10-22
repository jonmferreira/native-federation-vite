import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, signal } from '@angular/core'

// es-module-shims resolver set up by initFederation (import map from the remotes).
declare global {
  interface Window {
    importShim: (specifier: string) => Promise<{ default: CustomElementConstructor }>
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <h1>native-federation-vite — Angular shell</h1>
    <p>Angular consuming Vite remotes as Web Components (no mount glue).</p>

    <section class="vue">
      <h2>vue-remote → &lt;vue-fed-button&gt;</h2>
      @if (vueReady()) {
        <vue-fed-button label="Vue in Angular"></vue-fed-button>
      } @else if (vueError()) {
        <p class="err">{{ vueError() }}</p>
      } @else {
        <p>loading…</p>
      }
    </section>

    <section class="react">
      <h2>react-remote → &lt;react-fed-button&gt;</h2>
      @if (reactReady()) {
        <react-fed-button label="React in Angular"></react-fed-button>
      } @else if (reactError()) {
        <p class="err">{{ reactError() }}</p>
      } @else {
        <p>loading…</p>
      }
    </section>
  `,
  styles: [
    `
      h1 { font-size: 1.3rem; }
      section { margin: 1.5rem 0; padding: 1rem; border-radius: 8px; background: #f5f5f7; }
      section.vue { border-top: 3px solid #42b883; }
      section.react { border-top: 3px solid #61dafb; }
      h2 { font-size: 1rem; margin: 0 0 0.75rem; }
      .err { color: #c0392b; font-family: monospace; }
    `
  ]
})
export class AppComponent implements OnInit {
  readonly vueReady = signal(false)
  readonly vueError = signal<string | null>(null)
  readonly reactReady = signal(false)
  readonly reactError = signal<string | null>(null)

  async ngOnInit(): Promise<void> {
    await this.defineElement('vue-remote', 'vue-fed-button', this.vueReady, this.vueError)
    await this.defineElement('react-remote', 'react-fed-button', this.reactReady, this.reactError)
  }

  private async defineElement(
    remote: string,
    tag: string,
    ready: ReturnType<typeof signal<boolean>>,
    error: ReturnType<typeof signal<string | null>>
  ): Promise<void> {
    try {
      // es-module-shims loads async; wait until its resolver is ready.
      while (typeof window.importShim !== 'function') {
        await new Promise((r) => setTimeout(r, 20))
      }
      // The import map (built by initFederation from each remote's remoteEntry.json)
      // maps "<remote>/./ButtonElement" to the remote's bundle; shared deps load once.
      const mod = await window.importShim(`${remote}/./ButtonElement`)
      if (!customElements.get(tag)) customElements.define(tag, mod.default)
      ready.set(true)
      console.log(`[shell] ${tag} defined from ${remote}`)
    } catch (e: unknown) {
      error.set(e instanceof Error ? e.message : String(e))
      console.error(`[shell] ${remote} error`, e)
    }
  }
}
