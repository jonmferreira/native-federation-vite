import { bootstrapApplication } from '@angular/platform-browser'
import { initFederation } from '@angular-architects/native-federation'
import { AppComponent } from './app/app.component'
import { appConfig } from './app/app.config'

initFederation({
  'vue-remote': 'http://localhost:5173/dist/remoteEntry.json',
  'react-remote': 'http://localhost:5174/dist/remoteEntry.json'
})
  .then(() => bootstrapApplication(AppComponent, appConfig))
  .catch((err) => console.error(err))
