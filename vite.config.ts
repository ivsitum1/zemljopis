import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { offlineSwPlugin } from './scripts/vite-plugin-offline-sw.ts'

// Manifest: public/manifest.webmanifest
// Offline SW: custom plugin (avoids vite-plugin-pwa / workbox es-abstract issues)
// GitHub Pages: set BASE_PATH=/zemljopis/ in CI (see .github/workflows/pages.yml)
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [react(), offlineSwPlugin()],
  server: {
    // Vite 8 blocks unknown Host headers; Cloudflare/ngrok tunnels need this.
    allowedHosts: true,
  },
})
