import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// A normal Vite project config. native-federation-vite's CLI reuses these
// plugins automatically, so you don't declare vue() twice.
export default defineConfig({
  plugins: [vue()]
})
