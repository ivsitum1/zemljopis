# Task: PWA offline / service worker - 2026-08-16

## Objectives

- Riješiti prijavu „ne radi mi link” (lokalni dev URL)
- Phase 7: aplikacija mora raditi instalirana i bez mreže

## Prerequisites

- Node.js 20+ (ovdje 24)
- Postojeći `public/manifest.webmanifest` iz Phase 0

## Task Breakdown

- [x] Provjeriti dev server, build, render i konzolu (bez grešaka)
- [x] `scripts/gen-sw.mjs` — generira `dist/sw.js` s precache manifestom
- [x] `src/pwa.ts` — registracija u produkciji, odjava u devu
- [x] Manifest: `id`, `scope`, `orientation`
- [x] Verificirati offline reload u Chromiumu (network off)

## Process Notes

- [2026-08-16] `npm run dev` i `npm run build` prolaze bez greške; stranica se
  renderira bez ijedne poruke u konzoli, pa uzrok „linka koji ne radi” nije u
  kodu nego u lokalnom okruženju.
- [2026-08-16] vite-plugin-pwa i dalje nije uvučen (workbox-build →
  es-abstract). Ručni SW je manje pokretnih dijelova nego plugin.
- [2026-08-16] Precache putanje su relativne i razrješavaju se preko
  `self.registration.scope`, pa build radi i na poddirektoriju.

## Problems & Solutions

### Problem 1: worker s `preview` otima dev server

- `localhost` dijeli origin preko svih portova, pa SW registriran na :4173
  kontrolira i :5173 i servira stari cache. Rješenje: u devu `pwa.ts` odjavljuje
  sve registracije umjesto da registrira novu.

### Problem 2: sporo/nepouzdano mrežno navigiranje

- Network-first s 3 s timeoutom i padom na cachirani `index.html`, umjesto
  čekanja da zahtjev istekne.

## Decisions

- Ručni service worker (`scripts/gen-sw.mjs`), bez vite-plugin-pwa.
- `skipWaiting` + `clients.claim`: nova verzija preuzima kontrolu odmah, stari
  `obzor-*` cache se briše na activate.
- Navigacije network-first, hashirani aseti cache-first.

## Result

- Success: build generira `dist/sw.js` (15 datoteka u precacheu).
- Verificirano u Chromiumu: uz `setOffline(true)` i reload aplikacija se učita
  s primijenjenim CSS-om i bez grešaka.
- `npm run lint` i `npm run test` (10 testova) prolaze.

## Future Considerations

- UI za „dostupna je nova verzija, osvježi” ako build naraste na lazy chunkove.
- Kad stigne HTTPS hosting, provjeriti instalaciju na iOS-u (A2HS) i Androidu.
