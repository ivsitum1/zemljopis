# Obzor — vizualni identitet

Ovaj dokument postoji da sljedeća osoba ne mora rekonstruirati odluke iz CSS-a.
Vrijednosti su u [`tokens.md`](./tokens.md); ovdje je zašto.

Aplikacija se do kolovoza 2026. zvala **Zemljopis**.

## Ime

**Obzor** je horizont. Dva sloga, bez dijakritike, čita se jednako hrvatskom
govorniku i strancu. Ne veže se uz Hrvatsku, pa preživljava planirano širenje
na Europu i svijet bez ponovnog preimenovanja.

Odbačeni kandidati i razlog:

| Ime | Zašto ne |
| --- | --- |
| Busola | Trgovine aplikacija pune su poljskih i rumunjskih „Busola / Busolă" kompas-aplikacija. `busola.hr` i `.com` zauzeti. |
| Putokaz | `putokaz.hr` i `.com` zauzeti, česta hrvatska marka. |
| Zavičaj | Snažna kurikularna veza, ali veže identitet uz Hrvatsku. |
| Sjeverko | Zadržan — kao maskota, ne kao ime marke. |
| Bura, Tramuntana, Sidro | O vjetru i moru, ne o zemljopisu. Loše skaliraju izvan Jadrana. |

Provjereno u kolovozu 2026: `obzor.hr` i `obzor.app` nisu razrješavali DNS.
**Prije registracije provjeri kod registrara** — odsutnost A zapisa ne znači
da domena nije registrirana.

## Znak

Zvijezda sjevernjača iznad crte obzora, s drugom, tanjom crtom ispod nje.
Izvor je `src/components/Logo.tsx`; `public/favicon.svg` i
`public/icon-maskable.svg` su iste geometrije kao samostalne datoteke.

**Pravila**

- Najmanja veličina znaka je **16 px**. Zato ima najviše dvije boje, bez
  gradijenata i bez filtera — sve što se gubi na 16 px ne ulazi u znak.
- Zaštitni prostor oko lockupa je visina zvijezde sa svake strane.
- Wordmark je **Bricolage Grotesque Bold**, uvijek pisan „Obzor" — nikad
  verzalom, nikad razmaknuto, nikad prevedeno. Ime marke nije tekst za
  prijevod, zato je u komponenti, a ne u `hr.json`.
- Favicon je puna pločica, ne goli znak. Traka kartica preglednika može biti
  bilo koje boje i sama crta obzora bi na tamnoj nestala.
- PWA ikone se **ne crtaju ručno**. Uredi `public/icon-maskable.svg` pa
  pokreni `npm run icons`. Znak stoji unutar centriranih 80 % promjera zbog
  Androidova kružnog izreza.

## Maskota

**Sjeverko** je igla kompasa koja vodi kroz kvize
(`src/components/Sjeverko.tsx`, raspoloženja `idle` / `happy` / `thinking`).

Nikad se ne pojavljuje u wordmarku. To je cijela poanta: marka ostaje dovoljno
zrela za osmaša, a aplikacija dovoljno topla za drugašicu. Kad učenik odraste
iz Sjeverka, Obzor i dalje stoji.

## Vizualni smjer — „Jadran"

Karta je glavni sadržaj, pa sve ostalo uzmiče. Petrolej i vapnenac nose
sučelje, terakota se pojavljuje samo tamo gdje treba pažnja. Naslovi su
grotesk s karakterom, ne serif — zemljopis, ne enciklopedija.

Razmatrani su i odbačeni: **Vedro** (zasićen kobalt i koralj, zaobljena
tipografija — prerašta se za dvije-tri godine) i **Školski atlas** (oker i
tekstura papira — papir nema pošten tamni ekvivalent i najskuplji je za
crtati).

## Ton

- Obraćanje na **ti**. „Pronađi županiju", ne „Molimo odaberite županiju".
- Kratke rečenice. Bez žargona i bez umanjenica.
- Povratna informacija kaže što se dogodilo, pa što dalje: „Točno je: Zadar."
  a ne „Netočno!".
- Brojke su konkretne: „oko 260 km", ne „prilično daleko".

## Pristupačnost — nepregovorljivo

Ovo nisu preporuke, nego uvjeti koje svaka promjena mora zadržati.

- **Tekst 4.5:1**, krupan tekst i akcenti 3:1. Izmjereno, ne procijenjeno.
- **Stanje nikad samo bojom.** Na karti se točno i netočno razlikuju debljinom
  obruba (1.5 → 2.5 → 4 px) i crtkanjem, u kvizu debljinom obruba, u povratnoj
  informaciji znakom ✓ / ✕. Boja je uvijek treći signal, nikad jedini.
  - Razlog je matematički, ne stilski: ispuna županije mora biti dovoljno
    svijetla da labela na njoj prođe 4.5:1, što znači da ne može istovremeno
    biti dovoljno tamna da se odvoji od mirnog stanja. Signal mora nositi
    nešto drugo.
- **Obrub input polja** koristi `--line-strong` (≥ 3:1), ne `--line`. Taj obrub
  je jedini pokazatelj granice kontrole (WCAG 1.4.11).
- **Dodirni cilj ≥ 44 px** na 390 px širine, za svaku kontrolu.
- **Fokus je vidljiv** svugdje, uključujući županije na karti, koje su
  dohvatljive tipkovnicom.
- **`prefers-reduced-motion`** gasi svaku animaciju.

Poznato ograničenje: manje županije na telefonu su ispod 44 px i to se ne može
riješiti bojom ni razmakom — treba zumiranje karte. Vidi „Otvoreno" niže.

## Tipografija

| Uloga | Font | Gdje |
| --- | --- | --- |
| Naslovi, wordmark, oznake tablica | Bricolage Grotesque Variable | `--font-display` |
| Tekst, sučelje | Public Sans Variable | `--font-body` |

Oba su **u repozitoriju**, ne s Google Fontsa. Aplikacija obećava rad offline,
a `@import` s mreže to obećanje razbija na prvom posjetu bez veze. Uvozi se
samo `wght` os; preglednik sam bira `latin` ili `latin-ext` subset preko
`unicode-range`, pa hrvatski dijakritici dolaze bez dodatnog troška.

Licence su OFL 1.1 i zapisane su u `ATTRIBUTION.md`.

## Otvoreno

- **Karta se rasteže.** `src/geo/project.ts` mapira geografsku dužinu i širinu
  neovisno u zadanu širinu i visinu i ne uzima u obzir `cos(lat)`, pa je
  Hrvatska horizontalno razvučena. Rebranding to namjerno nije dirao — to je
  geo logika, ne identitet — ali treba popraviti.
- **Zumiranje karte**, bez kojeg male županije ostaju ispod praga dodira.
- **Service worker.** Fontovi su sada lokalni, ali pravi offline rad još
  nedostaje.
