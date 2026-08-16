# Obzor

Edukativna PWA za vježbanje zemljopisa (karte, tablice, mjesta, udaljenosti).
Prvo Hrvatska (offline), zatim Europa i svijet. Kod je proprietary — vidi `LICENSE`.

Aplikacija se do kolovoza 2026. zvala **Zemljopis**. Vizualni identitet i
smjernice: `docs/brand/`.

## Zahtjevi

- [Node.js](https://nodejs.org/) 20+ (preporučeno 22/24)
- npm

## Pokretanje (razvoj)

```bash
npm install
npm run dev
```

Otvori adresu koju Vite ispiše:

- na računalu: `http://localhost:5173/`
- na telefonu/tabletu (isti Wi‑Fi): `http://<tvoja-LAN-IP>:5173/`  
  (Vite ispisuje i **Network** URL kad je `npm run dev` s `--host`)

Ako se na mobitelu ne učitava, Windows firewall možda blokira port 5173 — dopusti Node.js privatnu mrežu.

## Korisne naredbe

```bash
npm run build      # produkcijski build (+ generira dist/sw.js)
npm run preview    # pregled builda
npm run licenses   # pregled licenci ovisnosti
npm run lint       # oxlint
npm run test       # vitest
npm run icons      # regeneriraj PWA ikone iz public/icon-maskable.svg
npm run sw         # regeneriraj samo service worker nad postojećim dist/
```

## Offline (PWA)

`npm run build` uz Vite build generira i `dist/sw.js` (`scripts/gen-sw.mjs`).
Service worker precachea cijeli build, pa se instalirana aplikacija otvara i
bez mreže. Navigacije idu network-first s 3 s timeouta i padom na spremljeni
`index.html`; hashirani aseti idu cache-first.

Offline se testira samo nad buildom:

```bash
npm run build && npm run preview
```

Zatim u DevTools → Application → Service Workers, ili Network → Offline pa
reload. U `npm run dev` service worker se namjerno **ne** registrira — štoviše,
postojeći se odjavljuje (`src/pwa.ts`), jer worker s `npm run preview` inače
preuzme cijeli `localhost` (sve portove) i servira stari cache preko dev
servera.

### Ako `http://localhost:5173/` ne radi

1. Provjeri ispisuje li `npm run dev` uopće URL i je li port zauzet
   (`netstat -ano | findstr 5173`).
2. Otvori DevTools → Application → Service Workers → **Unregister**, pa hard
   reload (Ctrl+Shift+R). Stari worker je najčešći uzrok „stranica se ne
   učitava / stara je”.
3. Windows firewall blokira Node.js na privatnoj mreži → to ruši samo Network
   URL na telefonu, ne i `localhost`.

## Licenca i aseti

- Aplikacijski kod: `LICENSE` (All rights reserved)
- Podaci i treće strane: `ATTRIBUTION.md`

## Napomena

Ovaj projekt namjerno **nije** open-source. Ne dodavaj MIT/Apache `LICENSE`
bez eksplicitne odluke autora.
