import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { offlineSwPlugin } from './scripts/vite-plugin-offline-sw.ts'

/** HTTP-only config for local PC testing without TLS cert prompts. */
export default defineConfig({
  plugins: [react(), offlineSwPlugin()],
})
