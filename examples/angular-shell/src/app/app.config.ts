import { ApplicationConfig } from '@angular/core'
import { provideRouter } from '@angular/router'

// initFederation() is called in main.ts before bootstrap
export const appConfig: ApplicationConfig = {
  providers: [provideRouter([])]
}
