import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { offlineSwPlugin } from './scripts/vite-plugin-offline-sw.ts'

// Manifest: public/manifest.webmanifest
// Offline SW: custom plugin (avoids vite-plugin-pwa / workbox es-abstract issues)
export default defineConfig({
  plugins: [react(), basicSsl(), offlineSwPlugin()],
})
