# Design: Learning shell (Learn-the-flags UX) for Obzor

**Date:** 2026-08-21  
**Status:** Approved in brainstorming (pending user review of this file)  
**Scope:** Product UX shell + data expansion across all four modes  
**Reference:** [Learn-the-flags](https://github.com/ivsitum1/Learn-the-flags) (kartice, kviz, enciklopedija, multiplayer)

## Goal

Keep Obzor’s four modes (karta, tablice, mjesta, udaljenost) and give each the same learning UX as Learn-the-flags: **flashcards**, **quiz** (solo + pass & play), and **encyclopedia**. Expand Croatia data to official cities **plus** all registration-plate localities, with full HR plate codes, crow-fly distances, and city facts.

## Decisions (from brainstorming)

| Topic | Choice |
|-------|--------|
| Relation to flags app | Same UX patterns; geography theme; keep existing modes (**B**) |
| Feature set (MVP) | Kartice + kviz + multiplayer + enciklopedija (**3**) |
| Places coverage | Official RH cities **and** all places with plate codes (**A+C**) |
| Distances | Crow-fly (Haversine) only (**A**); no road routing |
| Architecture approach | Shared **LearningShell** over existing modes (**1**), not a vanilla rewrite |
| Languages | Keep HR/EN for this work; 5-language parity with flags deferred |
| Progress writes | Solo quiz + flashcards update long-term progress; multiplayer is session score only |
| Plates UI | Keep realistic HR plate renderer; expand code list to full official set |

## Non-goals (this design)

- Rewriting the app as static HTML/vanilla JS
- Road / OSRM distances
- Replacing the four modes with a single “topics” menu (approach 2)
- DE/IT/ES locale parity with Learn-the-flags
- Photorealistic plate photos (CSS/SVG illustration remains)

## Architecture

### Navigation

```
Home (profile + 4 mode cards)
  └─ Mode (map | plates | places | distance)
       ├─ Kartice
       ├─ Kviz (solo | pass & play)
       └─ Enciklopedija
```

Profile setup, level (1–5), and home city stay as today. Opening a mode first offers the three learning styles (or remembers last choice per mode in `localStorage`).

### LearningShell

Shared React layer used by all modes:

| Concern | Behaviour |
|---------|-----------|
| Flashcards | Prompt face → flip → detail + knew / didn’t know |
| Quiz solo | Multiple choice; hint; no repeat until deck exhausted; rounds 5 / 10 / 15 / endless |
| Quiz multiplayer | Pass & play up to 6; colours; “hand device → …”; live scores; medals |
| Encyclopedia chrome | Search, filter, detail sheet layout |
| Scoring UI | Correct/total for solo; per-player board for multiplayer |

Modes supply a **content adapter**:

```ts
type ModeContentAdapter = {
  modeId: 'map' | 'plates' | 'places' | 'distance'
  buildDeck(level: DifficultyLevel, ctx: ModeContext): DeckItem[]
  renderPrompt(item: DeckItem): ReactNode
  renderChoices?(item: DeckItem, choices: Choice[]): ReactNode
  renderDetail(item: DeckItem): ReactNode  // flip face + encyclopedia
  encyclopediaIndex(ctx: ModeContext): EncyclopediaEntry[]
}
```

`ModeContext` includes `profileName`, `homeCityId`, `level`, and language.

Existing mode logic (map click targets, plate scoring by code, distance bands/compass, place quizzes) moves behind these adapters; visual maps/plates stay as presentational components.

### Data model

Unify places into one catalogue (replace the split between thin `HOME_CITIES`, partial `PLATES`, and curated `PLACES` over time):

```ts
type PlaceRecord = {
  id: string
  name: { hr: string; en: string }
  /** Official city under RH law */
  isOfficialCity: boolean
  /** Has a vehicle registration area code */
  plateCode?: string
  countyId: string
  /** Required in the shipped catalogue; rows without coords are not published */
  lat: number
  lon: number
  facts: { hr: string; en: string }[]
  neighborIds?: string[]
}
```

Rules:

- **A+C:** include every official city and every plate-code locality; one row per place (a city with a code has both flags/fields set).
- **Shipped completeness:** every published row has `lat`/`lon`. Draft/incomplete rows stay out of the bundle (data validation fails the build or a dedicated data test).
- **Plates:** quiz/encyclopedia for plates iterate distinct `plateCode` values from this catalogue (full HR set, not only ~20 county seats).
- **Distances:** compute with existing Haversine helpers from `lat`/`lon`; no precomputed matrix.
- **Facts:** 2–5 short educational blurbs per place where available; missing facts allowed (UI omits empty section).
- **Home city picker:** catalogue places (prefer official cities in the default list, still searchable).

Counties remain a separate dataset for **map** mode (GeoJSON + `COUNTIES`); places reference `countyId`.

### Mode content mapping

| Mode | Flashcard / quiz prompt | Encyclopedia |
|------|-------------------------|--------------|
| **Map** | Identify county (map tap and/or name) | County list + short description |
| **Plates** | Code ↔ place; realistic `RegistrationPlate`; score by code | All codes → place + county |
| **Places** | Name / type / location; harder levels may use a fact as hint | Full place cards: facts, neighbors, mini-map |
| **Distance** | Crow-fly band, 8-way compass from home, “which is closer” | Distance from home or between two selected places |

Level 1–5 continues to shrink/grow pools and tighten question difficulty (e.g. plates: major codes first → all codes; distance: wider bands → narrower).

## Error handling

- Incomplete place rows (missing coords) → never ship; caught by data tests.
- Plate code not on the official list → excluded from plates deck.
- Empty deck → clear empty state, no crash.
- Multiplayer with &lt; 2 named players → block start with a short message.
- Offline: all learning data ships in the app bundle; no network required for distances.

## Testing

- Unit: Haversine, plate serial simulator, level pools, deck no-repeat until exhausted.
- Progress: existing `recordAnswer` / weighted pick tests stay green; flashcards and solo quiz call into the same store.
- Component/smoke: each mode opens Kartice, Kviz (solo), Enciklopedija without runtime errors.
- Data checks: every `plateCode` unique; every official city present; every plate seat has coordinates.

## Delivery phases

1. **Data** — full HR plate codes; A+C places + coordinates; facts (hr/en); retire/merge thin lists.
2. **LearningShell** — flashcards, solo quiz, rounds, hints, no-repeat deck.
3. **Mode adapters** — map, plates, places, distance wired to the shell (preserve map/plate visuals).
4. **Encyclopedia** — search, filter, detail with facts.
5. **Multiplayer** — pass & play up to 6; session scores only.
6. **Polish** — i18n strings, offline smoke, process log update.

## Open points (resolved in this spec)

| Question | Resolution |
|----------|------------|
| Crow-fly vs road | Crow-fly only |
| Progress in multiplayer | Session only; no `recordAnswer` |
| Stack | Keep React + Vite + PWA |
| Plate visual | Keep current realistic renderer |

## Future (out of scope)

- Five UI languages like Learn-the-flags
- Road distances as optional encyclopedia field
- Europe/world packs beyond Croatia
- Capacitor native wrap
