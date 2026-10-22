import { withNativeFederation, shareAll } from '@softarc/native-federation/config'

export default withNativeFederation({
  name: 'vue-remote',
  exposes: {
    './Button': './src/components/Button.vue',
    './Card': './src/components/Card.vue',
    './ButtonElement': './src/elements/button-element.ts'
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' })
  },
  // Opt-in SRI: emits integrity hashes in remoteEntry.json so the host can
  // verify each bundle. Recommended for production. Handled entirely by the core.
  features: {
    integrityHashes: true
  }
})
