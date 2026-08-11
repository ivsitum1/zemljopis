# Zemljopis

Edukativna PWA za vježbanje zemljopisa (karte, tablice, mjesta, udaljenosti).
Prvo Hrvatska (offline), zatim Europa i svijet. Kod je proprietary — vidi `LICENSE`.

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
npm run build      # produkcijski build
npm run preview    # pregled builda
npm run licenses   # pregled licenci ovisnosti
npm run lint       # oxlint
```

## Licenca i aseti

- Aplikacijski kod: `LICENSE` (All rights reserved)
- Podaci i treće strane: `ATTRIBUTION.md`

## Napomena

Ovaj projekt namjerno **nije** open-source. Ne dodavaj MIT/Apache `LICENSE`
bez eksplicitne odluke autora.
