import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// A normal Vite project config. native-federation-vite's CLI reuses these
// plugins automatically, so you don't declare react() twice.
export default defineConfig({
  plugins: [react()]
})
