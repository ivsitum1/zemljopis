# Device test checklist — Zemljopis PWA

Use after `npm run build` + HTTPS preview (or a real HTTPS host).

## Prerequisites

- [ ] Same Wi‑Fi for phone and PC (LAN test), **or** deployed HTTPS URL
- [ ] Chrome / Edge on Android (installability)
- [ ] `npm run build` succeeded
- [ ] `npm run preview:https` running (LAN needs HTTPS for service worker)

## Install & offline (Android)

- [ ] Open the **https://** Network URL (accept the self-signed cert warning once)
- [ ] Chrome menu → **Install app** / **Add to Home screen**
- [ ] App opens fullscreen (standalone)
- [ ] Icon shows Zemljopis brand (green globe), not a generic browser icon
- [ ] Create profile, play one round in each mode (map, plates, places, distance)
- [ ] Enable airplane mode / turn off Wi‑Fi
- [ ] Reopen installed app — shell and Croatia content still load
- [ ] Progress panel still shows stats (localStorage)

## Functional smoke

- [ ] Map: tap correct/incorrect county; next round works
- [ ] Plates: code ↔ place
- [ ] Places: basic facts; advanced only at level 3+
- [ ] Distance: km / direction / closer-of-two by level
- [ ] Home progress: known / learning / hard / due update after answers
- [ ] Change profile keeps data for that name; other name starts empty progress

## Known limits (MVP)

- Service worker is for the **production build**, not `npm run dev`
- HTTP LAN (`http://192.168…`) will not register a SW in Chrome — use HTTPS preview
- Self-signed cert: phone must trust / proceed once; for family sharing prefer a real host later
- iOS “Add to Home Screen” is deferred until store / Capacitor stage
