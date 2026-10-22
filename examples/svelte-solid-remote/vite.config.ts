import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import solid from 'vite-plugin-solid'

// Two frameworks in one remote. The CLI reuses these plugins; Svelte handles
// `.svelte`, Solid handles `.tsx`. Each framework is shared independently.
export default defineConfig({
  plugins: [svelte(), solid({ include: /\.tsx$/ })]
})
