import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// PWA manifest is served from public/manifest.webmanifest.
// Full service-worker offline caching lands in Phase 7 (avoids current
// vite-plugin-pwa + workbox-build / es-abstract install issues on this machine).
export default defineConfig({
  plugins: [react()],
})
