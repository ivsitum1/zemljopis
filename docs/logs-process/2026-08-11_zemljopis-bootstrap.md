# Task: Zemljopis bootstrap - 2026-08-11

## Objectives

- Bootstrap proprietary PWA project (Vite + React + TypeScript)
- Establish license, attribution, and i18n (HR/EN) foundations
- Prepare for Phase 1 product shell

## Prerequisites

- Node.js 24+
- GitHub repo `ivsitum1/zemljopis` (to be set private)

## Task Breakdown

- [x] Scaffold Vite React TS in workspace
- [x] Install i18next, license-checker
- [x] Add proprietary LICENSE + ATTRIBUTION.md
- [x] Wire i18n HR/EN and basic app shell (profile + modes placeholders)
- [x] Init git, push, privatize remote
- [x] Verify `npm run build` (manifest PWA; SW deferred to Phase 7)

## Process Notes

- [2026-08-11] Workspace was empty; remote GitHub repo was empty/public.
- [2026-08-11] `create-vite` completed with React + TypeScript template.
- [2026-08-11] OneDrive caused `EBUSY` / slow `npm install` under `node_modules`.
- [2026-08-11] `vite-plugin-pwa` failed at closeBundle (`es-abstract/2024/Call`). Switched to static `public/manifest.webmanifest`; full SW in Phase 7.

## Problems & Solutions

### Problem 1: `gh auth status` hung in shell

- Solution: proceed with local bootstrap; privatize/push when `gh` is responsive.

### Problem 2: npm EBUSY on OneDrive path

- Solution: remove `node_modules` and reinstall; prefer fewer concurrent npm ops.

### Problem 3: vite-plugin-pwa / workbox-build module resolution

- Solution: drop plugin for bootstrap; keep installable manifest; Phase 7 reintroduces SW.

## Decisions

- Proprietary LICENSE (All rights reserved), not MIT/Apache.
- Stack: Vite + React + TS + PWA → Capacitor later.
- Age bands 1–5 in product model from Phase 1.
- Phase 0 includes Phase 1 shell (profile, home city, levels, mode hub).

## Result

- Success: bootstrap on `main` (`0af111c`), build OK, licenses mostly MIT/ISC/Apache.
- Service worker deferred to Phase 7; static web manifest present.

## Future Considerations

- Source and license Croatian županija GeoJSON before map mode.
- Capacitor Android wrap after MVP offline polish.

---

## Phase 6 follow-up (2026-08-11)

### Objectives

- Local progress store (per profile) with known / learning / hard
- Curriculum topic tags on answers; filter hard list on home
- Weighted quiz picking (due → hard → unseen)

### Result

- `src/storage/progress.ts` + tests; `ProgressPanel` on home
- Modes record answers with GEO-OS tags
- Build + vitest green after `ProgressStatus` import fix

---

## Phase 7 follow-up (2026-08-11)

### Objectives

- Offline Croatia pack via production service worker
- Installable Android PWA (manifest PNG icons + HTTPS preview)
- Device test checklist; offline status banner
- Self-host fonts (no Google Fonts network dependency)

### Task Breakdown

- [x] Custom `offlineSwPlugin` → `dist/sw.js` precache (no vite-plugin-pwa)
- [x] `@vitejs/plugin-basic-ssl` for LAN HTTPS
- [x] Brand favicon + PNG 192/512 icons
- [x] `@fontsource/*` latin fonts bundled
- [x] `docs/device-test-checklist.md`
- [x] README install / offline instructions

### Decisions

- Avoid `vite-plugin-pwa` (previous es-abstract/workbox failure); generate SW in Vite `closeBundle`
- SW registers only in production builds
- HTTP config kept as `vite.config.http.ts` / `npm run dev:http` for PC-only work

### Result

- Production build emits `dist/sw.js` with app shell + hashed assets + icons + fonts
- Manual device verification left to Ivan (checklist)
