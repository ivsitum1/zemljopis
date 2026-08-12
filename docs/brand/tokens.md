# Tokeni

Izvor istine je [`src/styles/tokens.css`](../../src/styles/tokens.css). Ovdje
je što svaki token znači i gdje se koristi, da se ne mora čitati iz CSS-a.

## Pravilo

Dva sloja, namjerno:

- `--c-*` je **paleta**. Privatna. Nijedna komponenta je ne smije spominjati.
- Ostalo je **semantika**. To je jedino što komponenta smije vidjeti.

Zato promjena vizualnog smjera dira jednu datoteku. Ako u `App.css` upišeš
heks, prekršio si podjelu — dodaj token umjesto toga.

Iznimka su `--plate-eu-blue` i `--plate-eu-yellow`: to su boje prave EU
registracijske tablice, stvarne konstante koje se **ne** preslikavaju u tamnu
temu. Tablica je plavo-žuta u svijetu i cijela poanta značke je da izgleda kao
prava.

## Teme

Tri stanja, ne dva:

| Stanje | Selektor | Kada |
| --- | --- | --- |
| Svijetlo | goli `:root` | zadano, i kad je izbor izričito svijetli |
| Tamno (OS) | `@media (prefers-color-scheme: dark)` uz `:root:not([data-theme='light'])` | OS kaže tamno, korisnik nije izabrao |
| Tamno (izbor) | `:root[data-theme='dark']` | korisnik izričito izabrao tamno |

Zadnji blok ponavlja drugi namjerno. Token definiran **samo** unutar media
upita ne bi se primijenio kad OS kaže svijetlo a korisnik traži tamno — to je
klasičan bug „tekst jedne teme na podlozi druge".

Aplikacija zasad nema prekidač teme; `[data-theme]` je pripremljen da ga
dodavanje ne traži prepisivanje tokena.

## Boja

Omjeri su izmjereni po WCAG 2.1 relativnoj luminanciji.

### Površine i tekst

| Token | Svijetlo | Tamno | Uloga | Omjer |
| --- | --- | --- | --- | --- |
| `--surface` | `#ffffff` | `#0e242a` | kartice, polja | — |
| `--surface-sunken` | `#ecf2f2` | `#071619` | podloga stranice | — |
| `--ink` | `#0e2a32` | `#dbe9ea` | glavni tekst | 15.04 / 12.92 |
| `--ink-muted` | `#4a6970` | `#8daaaf` | sekundarni tekst | 5.92 / 6.52 |
| `--line` | `#cfdedf` | `#1b383f` | dekorativna crta | — |
| `--line-strong` | `#75908f` | `#4e7278` | obrub kontrole | 3.42 / 3.07 |

`--line-strong` je obavezan gdje je obrub jedini pokazatelj granice kontrole
(input, select, ghost gumb). `--line` je za crte koje ne nose značenje.

### Marka i stanja

| Token | Svijetlo | Tamno | Uloga | Omjer |
| --- | --- | --- | --- | --- |
| `--brand` | `#0b6875` | `#48bcc9` | ikone, poveznice, primarni gumb | 6.46 / 7.14 |
| `--brand-strong` | `#07444e` | `#7fd6df` | hover primarnog, naglasak | 10.79 / 9.65 |
| `--brand-soft` | `#dce8e7` | `#10333b` | hover podloga, citat | — |
| `--on-brand` | `#ffffff` | `#071619` | tekst na `--brand` ispuni | 6.46 / 11.06 |
| `--accent` | `#bc5527` | `#f0885a` | terakota, samo gdje treba pažnja | 4.70 / 6.42 |
| `--focus` | `#bc5527` | `#f0885a` | fokus prsten | 4.70 / 6.42 |
| `--success` | `#15704e` | `#4fc291` | točan odgovor | 6.07 / 7.25 |
| `--danger` | `#a93526` | `#ff8371` | netočan odgovor | 6.51 / 6.70 |

### Karta

Ispuna mora biti dovoljno svijetla da labela županije na njoj prođe 4.5:1.
Zato se stanja **ne** mogu odvojiti samo ispunom — nosi ih debljina obruba.

| Token | Svijetlo | Tamno | Labela na njoj | Obrub stanja |
| --- | --- | --- | --- | --- |
| `--map-sea` | `#c6dadc` | `#0a1d21` | — | — |
| `--map-idle` | `#dce8e7` | `#183239` | 11.99 / 10.85 | 1.5 px `--map-line` |
| `--map-hover` | `#c2d8d6` | `#20434c` | 10.09 / 8.56 | 1.5 px |
| `--map-target` | `#d9a21b` | `#7a6015` | 6.54 / 4.80 | 2.5 px `--map-line-strong` |
| `--map-correct` | `#3e9e77` | `#1b6349` | 4.56 / 5.76 | 4 px |
| `--map-wrong` | `#d08163` | `#7e3729` | 5.02 / 6.84 | 4 px, crtkano |

## Tipografija

`--font-display` (Bricolage Grotesque) za naslove, wordmark i kod tablice.
`--font-body` (Public Sans) za sve ostalo. `--font-mono` je sistemski i zasad
neiskorišten.

Ljestvica je na `clamp()`, pa ne treba media upite za veličinu teksta:
`--text-xs` `0.78rem` · `--text-sm` `0.88rem` · `--text-md` `1rem` ·
`--text-lg` · `--text-xl` · `--text-2xl` · `--text-3xl`.

Gdje se brojke slažu u stupac ili se mijenjaju u mjestu (bodovi, kilometri),
koristi `font-variant-numeric: tabular-nums` da rezultat ne poskakuje.

## Prostor, oblik, kretanje

`--space-1` … `--space-8` na bazi 4 px (4, 8, 12, 16, 24, 32, 48, 64).

`--radius-sm` 6 px · `--radius-md` 9 px · `--radius-lg` 14 px · `--radius-pill`.
`--shadow-1` je hairline, `--shadow-2` je podignuta ploha.

`--tap-min` je **44 px** i vrijedi za svaku kontrolu. Ne smanjuj ga za
„sekundarne" gumbe — to je bio razlog zašto je `.ghost.compact` prije padao na
36 px.

`--dur-fast` 120 ms · `--dur-base` 220 ms · `--ease-out`. Sve animacije moraju
biti iza `prefers-reduced-motion` zaštite.

## Kako promijeniti smjer

1. Prepiši `--c-*` paletu.
2. Prepiši semantičko preslikavanje u sva tri blok stanja teme.
3. Izmjeri kontraste ponovo. Svaki par tekst/podloga ≥ 4.5:1, akcenti i
   obrubi kontrola ≥ 3:1, labela županije ≥ 4.5:1 na **svakoj** ispuni stanja.
4. Uskladi `--brand` s `theme_color` u `index.html` i
   `public/manifest.webmanifest` — te dvije vrijednosti su ručne kopije.
5. Ako se mijenja boja znaka, uredi `public/icon-maskable.svg` i
   `public/favicon.svg`, pa pokreni `npm run icons`.
