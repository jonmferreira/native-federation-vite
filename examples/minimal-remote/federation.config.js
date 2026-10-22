import { withNativeFederation, shareAll } from '@softarc/native-federation/config'

export default withNativeFederation({
  name: 'minimal-remote',
  exposes: {
    './greeting': './src/greeting.ts',
    './counter': './src/counter.ts'
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' })
  }
})
