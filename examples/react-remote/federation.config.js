import { withNativeFederation, shareAll } from '@softarc/native-federation/config'

export default withNativeFederation({
  name: 'react-remote',
  exposes: {
    './Button': './src/components/Button.tsx'
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' })
  }
})
