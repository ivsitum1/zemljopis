# Zemljopis

Edukativna PWA za vježbanje zemljopisa (karte, tablice, mjesta, udaljenosti).
Prvo Hrvatska (offline), zatim Europa i svijet. Kod je proprietary — vidi `LICENSE`.

## Zahtjevi

- [Node.js](https://nodejs.org/) 20+ (preporučeno 22/24)
- npm

## Pokretanje (razvoj)

```bash
npm install
npm run icons      # PNG ikone za instalaciju (jednom)
npm run dev        # HTTPS (za telefon / service worker)
```

Otvori adresu koju Vite ispiše:

- na računalu: `https://localhost:5173/` (prihvati self-signed cert)
- na telefonu/tabletu (isti Wi‑Fi): `https://<tvoja-LAN-IP>:5173/`  
  Chrome na Androidu treba **HTTPS** da bi se SW i „Instaliraj app“ uključili.
- samo HTTP na PC-u: `npm run dev:http`

Ako se na mobitelu ne učitava, Windows firewall možda blokira port 5173 — dopusti Node.js privatnu mrežu.

## Offline / instalacija (Android)

```bash
npm run build
npm run preview:https
```

Zatim na telefonu otvori HTTPS Network URL → Chrome → **Install app**.  
Checklist: `docs/device-test-checklist.md`.

Service worker se generira u `dist/sw.js` pri buildu (Croatia pack + app shell u cacheu).

## Korisne naredbe

```bash
npm run build         # produkcijski build (+ sw.js)
npm run preview       # pregled builda (HTTPS zbog basic-ssl)
npm run icons         # regeneriraj PWA PNG ikone
npm run licenses      # pregled licenci ovisnosti
npm run lint          # oxlint
npm test              # vitest
```

## Licenca i aseti

- Aplikacijski kod: `LICENSE` (All rights reserved)
- Podaci i treće strane: `ATTRIBUTION.md`

## Napomena

Ovaj projekt namjerno **nije** open-source. Ne dodavaj MIT/Apache `LICENSE`
bez eksplicitne odluke autora.
