import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { runViteBuilder } from 'native-federation-vite'

const root = dirname(fileURLToPath(import.meta.url))

const result = await runViteBuilder('federation.config.js', {
  workspaceRoot: root,
  outputPath: join(root, 'dist'),
  packageJson: join(root, 'package.json')
})

console.log('\n=== Federation build done ===')
console.log('name:', result.federationInfo.name)
console.log('exposes:', result.federationInfo.exposes)
console.log('shared:', result.federationInfo.shared.map((s) => s.packageName))

const { readdirSync } = await import('node:fs')
console.log('\ndist files:', readdirSync(join(root, 'dist')).filter((f) => !f.startsWith('.')))
