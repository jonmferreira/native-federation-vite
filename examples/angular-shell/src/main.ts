import { bootstrapApplication } from '@angular/platform-browser'
import { initFederation } from '@angular-architects/native-federation'
import { AppComponent } from './app/app.component'
import { appConfig } from './app/app.config'

initFederation(
  {
    'vue-remote': 'http://localhost:4310/remoteEntry.json',
    'react-remote': 'http://localhost:4311/remoteEntry.json'
  },
  // Consume-only host: this shell only loads remotes, it does not publish its own
  // remoteEntry.json. `hostRemoteEntry: false` is the core's built-in way to say so
  // (avoids the 404 on ./remoteEntry.json without the full native-federation builder).
  { hostRemoteEntry: false }
)
  .then(() => bootstrapApplication(AppComponent, appConfig))
  .catch((err) => console.error(err))
