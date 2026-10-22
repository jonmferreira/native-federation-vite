import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { loadRemoteModule } from '@angular-architects/native-federation'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Native Federation Vite PoC</h1>
    <p>Shell Angular carregando remotes Vite (Vue + React).</p>

    <section>
      <h2>Vue Remote (./Button)</h2>
      <div id="vue-button" style="padding: 1rem; border: 1px solid #42b883">
        <p *ngIf="!vueButtonComponent">Carregando...</p>
        <p *ngIf="vueLoadError" style="color: red">Erro: {{ vueLoadError }}</p>
        <ng-container *ngIf="vueButtonComponent">
          <ng-container *ngComponentOutlet="vueButtonComponent"></ng-container>
        </ng-container>
      </div>
    </section>

    <section>
      <h2>React Remote (./Button)</h2>
      <div id="react-button" style="padding: 1rem; border: 1px solid #61dafb">
        <p *ngIf="!reactButtonComponent">Carregando...</p>
        <p *ngIf="reactLoadError" style="color: red">Erro: {{ reactLoadError }}</p>
        <ng-container *ngIf="reactButtonComponent">
          <ng-container *ngComponentOutlet="reactButtonComponent"></ng-container>
        </ng-container>
      </div>
    </section>

    <section>
      <h2>Console</h2>
      <p>
        Abra o DevTools (F12) → Console para ver os logs de carregamento.
        <strong>Shared deps (vue, react) devem carregar 1x.</strong>
      </p>
    </section>
  `,
  styles: [
    `
      h1 {
        color: #333;
      }
      section {
        margin: 2rem 0;
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 4px;
      }
      h2 {
        font-size: 1.2rem;
        margin-top: 0;
      }
    `
  ]
})
export class AppComponent implements OnInit {
  vueButtonComponent: any
  reactButtonComponent: any
  vueLoadError: string | null = null
  reactLoadError: string | null = null

  async ngOnInit() {
    console.log('[shell] Carregando Vue remote...')
    await this.loadVueButton()

    console.log('[shell] Carregando React remote...')
    await this.loadReactButton()
  }

  private async loadVueButton() {
    try {
      const mod = await loadRemoteModule('vue-remote', './Button')
      this.vueButtonComponent = mod.default
      console.log('[shell] Vue Button carregado:', mod)
    } catch (err: any) {
      this.vueLoadError = err?.message || String(err)
      console.error('[shell] Erro ao carregar Vue:', err)
    }
  }

  private async loadReactButton() {
    try {
      const mod = await loadRemoteModule('react-remote', './Button')
      this.reactButtonComponent = mod.default
      console.log('[shell] React Button carregado:', mod)
    } catch (err: any) {
      this.reactLoadError = err?.message || String(err)
      console.error('[shell] Erro ao carregar React:', err)
    }
  }
}
