/*
 * Service worker wiring. The worker itself is generated at build time by
 * scripts/gen-sw.mjs; there is nothing to register in dev.
 */

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return

  if (import.meta.env.DEV) {
    // A worker left over from `npm run preview` (or an installed build) owns
    // localhost for every port, and would serve its precached app on top of
    // `npm run dev` — the module graph then never reloads and the dev URL looks
    // dead or stale. Clear it out instead.
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) void registration.unregister()
    })
    return
  }

  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch((error: unknown) => {
        console.error('Service worker registration failed', error)
      })
  })
}
