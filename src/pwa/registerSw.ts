/** Register the production service worker (generated into dist/sw.js). */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL
    const swUrl = `${base}sw.js`
    void navigator.serviceWorker.register(swUrl, { scope: base }).catch((error: unknown) => {
      console.warn('Service worker registration failed', error)
    })
  })
}
