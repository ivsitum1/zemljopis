# Learning shell (Learn-the-flags UX) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Learn-the-flags-style Kartice / Kviz / Enciklopedija (plus pass & play) on top of Obzor’s four modes, backed by a full Croatia places catalogue (official cities + all plate-code seats), crow-fly distances, and city facts.

**Architecture:** Shared `LearningShell` + per-mode content adapters. Unify places into `PlaceRecord` catalogue JSON; plates and home-city lists derive from it. Keep React/Vite/PWA, Haversine, and the existing `RegistrationPlate` UI.

**Tech Stack:** React 19, TypeScript, Vitest, i18next (HR/EN), existing `App.css` tokens

**Spec:** `docs/superpowers/specs/2026-08-21-learning-shell-flags-ux-design.md`

## Global Constraints

- Keep four modes: `map` | `plates` | `places` | `distance` (do not collapse into a single topics menu)
- Distances: crow-fly (Haversine) only — no road routing APIs
- Places coverage: official RH cities **and** every civil plate-code locality (A+C); one row per place
- Plates: civil area codes only (no HV/police/diplomatic); score by `plateCode`
- Progress: solo quiz + flashcards call `recordAnswer`; multiplayer is session-only
- Languages this plan: HR/EN only
- Do not git commit unless the user explicitly asks
- Prefer TDD for pure helpers; run `npm test` after each task

**Shippable milestones:** after Task 3 (data usable), Task 7 (shell + one mode), Task 11 (all modes), Task 13 (multiplayer complete).

---

## File map

| File | Responsibility |
|------|----------------|
| `content/hr/plate-codes.json` | Canonical list of civil HR area codes → place id / names / countyId |
| `content/hr/places-catalogue.json` | Full `PlaceRecord[]` (coords, flags, facts) |
| `src/data/placeTypes.ts` | `PlaceRecord`, `LocalizedText`, loaders’ public types |
| `src/data/catalogue.ts` | Import JSON, indexes, `getPlaceById`, `placesWithPlateCode`, `officialCities` |
| `src/data/catalogue.test.ts` | Uniqueness, coords, every plate code has a place |
| `src/data/plates.ts` | Thin re-export from catalogue (compat for existing imports) |
| `src/data/cities.ts` | Home-city list from catalogue (`isOfficialCity`) |
| `src/data/places.ts` | Compat adapter: `PlaceCard` view over catalogue **or** delete after call-site migration |
| `src/learning/deck.ts` | Shuffle, no-repeat deck cursor, round limits |
| `src/learning/deck.test.ts` | Deck behaviour tests |
| `src/learning/types.ts` | `DeckItem`, `Choice`, `ModeContext`, `ModeContentAdapter`, session types |
| `src/learning/LearningShell.tsx` | Mode style picker + flashcard/quiz/encyclopedia host |
| `src/learning/FlashcardView.tsx` | Flip + knew / didn’t know |
| `src/learning/QuizView.tsx` | Solo multiple choice + rounds + hint |
| `src/learning/EncyclopediaView.tsx` | Search / filter / detail |
| `src/learning/MultiplayerQuizView.tsx` | Pass & play up to 6 |
| `src/learning/stylePreference.ts` | Remember last Kartice/Kviz/Enciklopedija per mode |
| `src/modes/*/adapter.ts` | One adapter per mode |
| `src/modes/*/…Mode.tsx` | Thin wrappers: build adapter + render `LearningShell` |
| `src/i18n/locales/{hr,en}.json` | Shell + multiplayer strings |
| `src/App.css` | Shell / flashcard / multiplayer layout |
| `docs/logs-process/2026-08-21_learning-shell-flags-ux.md` | Process log |

---

### Task 1: Place types + catalogue loader + validation tests

**Files:**
- Create: `src/data/placeTypes.ts`
- Create: `content/hr/places-catalogue.json` (seed: migrate all current curated `PLACES` + plate seats from `PLATES`)
- Create: `src/data/catalogue.ts`
- Create: `src/data/catalogue.test.ts`

**Interfaces:**
- Produces:
  - `type LocalizedText = { hr: string; en: string }`
  - `type PlaceRecord = { id: string; name: LocalizedText; isOfficialCity: boolean; plateCode?: string; countyId: string; lat: number; lon: number; facts: LocalizedText[]; neighborIds?: string[]; region?: LocalizedText; curriculumTags?: string[] }`
  - `export const PLACE_CATALOGUE: PlaceRecord[]`
  - `getPlaceById(id: string): PlaceRecord | undefined`
  - `listOfficialCities(): PlaceRecord[]`
  - `listPlateSeats(): PlaceRecord[]` (every row with `plateCode`)
  - `getPlaceByPlateCode(code: string): PlaceRecord | undefined`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from 'vitest'
import {
  PLACE_CATALOGUE,
  getPlaceById,
  getPlaceByPlateCode,
  listPlateSeats,
} from './catalogue'

describe('place catalogue', () => {
  it('has unique ids', () => {
    const ids = PLACE_CATALOGUE.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every row has finite coordinates', () => {
    for (const p of PLACE_CATALOGUE) {
      expect(Number.isFinite(p.lat)).toBe(true)
      expect(Number.isFinite(p.lon)).toBe(true)
    }
  })

  it('plate codes are unique when present', () => {
    const codes = listPlateSeats().map((p) => p.plateCode!)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('resolves Zagreb by id and ZG by plate code', () => {
    expect(getPlaceById('zagreb')?.plateCode).toBe('ZG')
    expect(getPlaceByPlateCode('ZG')?.id).toBe('zagreb')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npm test -- src/data/catalogue.test.ts`  
Expected: FAIL (module missing)

- [ ] **Step 3: Add types + seed JSON + loader**

`placeTypes.ts` — types as in Interfaces.

`places-catalogue.json` — array of `PlaceRecord`. Seed by converting every entry currently in `src/data/places.ts` (`PLACES`) and ensuring every code in `src/data/plates.ts` maps to a row with `plateCode`. Flatten `facts.basic` (+ `facts.advanced` appended) into `facts: LocalizedText[]`. Set `isOfficialCity: true` for known cities in the seed.

`catalogue.ts`:

```ts
import raw from '../../content/hr/places-catalogue.json'
import type { PlaceRecord } from './placeTypes'

export const PLACE_CATALOGUE = raw as PlaceRecord[]

const byId = new Map(PLACE_CATALOGUE.map((p) => [p.id, p]))
const byPlate = new Map(
  PLACE_CATALOGUE.filter((p) => p.plateCode).map((p) => [p.plateCode!, p]),
)

export function getPlaceById(id: string): PlaceRecord | undefined {
  return byId.get(id)
}

export function listOfficialCities(): PlaceRecord[] {
  return PLACE_CATALOGUE.filter((p) => p.isOfficialCity)
}

export function listPlateSeats(): PlaceRecord[] {
  return PLACE_CATALOGUE.filter((p) => Boolean(p.plateCode))
}

export function getPlaceByPlateCode(code: string): PlaceRecord | undefined {
  return byPlate.get(code)
}
```

Ensure `tsconfig` / Vite resolve JSON modules (already used for `counties.json`).

- [ ] **Step 4: Run tests — expect PASS**

Run: `npm test -- src/data/catalogue.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit only if user asked**

---

### Task 2: Canonical full HR plate-code list

**Files:**
- Create: `content/hr/plate-codes.json`
- Create: `src/data/plateCodes.test.ts`
- Modify: `content/hr/places-catalogue.json` (add any missing plate-seat rows with coords + at least empty `facts: []`)
- Modify: `src/data/plates.ts` to derive from catalogue
- Modify: `src/data/catalogue.test.ts` — assert every plate-codes.json code exists on a place

**Interfaces:**
- Produces: `plate-codes.json` as `{ code: string; placeId: string; name: LocalizedText; countyId: string }[]`
- Consumes: `PLACE_CATALOGUE`, `getPlaceByPlateCode`
- `plates.ts` keeps `PlateEntry` and `PLATES` / `getPlateByCode` for call-site compatibility:

```ts
export type PlateEntry = {
  code: string
  countyId: string
  city: { hr: string; en: string }
}
```

**Source of truth for codes:** HAK “Popis registarskih oznaka za RH” (linked from [Vehicle registration plates of Croatia](https://en.wikipedia.org/wiki/Vehicle_registration_plates_of_Croatia)) — civil city codes only. Cross-check Wikipedia city-code table. Do not invent codes.

- [ ] **Step 1: Write failing completeness test**

```ts
import { describe, expect, it } from 'vitest'
import plateCodes from '../../content/hr/plate-codes.json'
import { getPlaceByPlateCode } from './catalogue'

describe('HR plate codes', () => {
  it('lists the full civil set (34 HAK codes, not county seats only)', () => {
    // Official civil area codes per HAK / Pravilnik — do not invent extras.
    expect(plateCodes.length).toBe(34)
  })

  it('every code has a catalogue place with matching plateCode', () => {
    for (const row of plateCodes) {
      const place = getPlaceByPlateCode(row.code)
      expect(place, row.code).toBeTruthy()
      expect(place!.id).toBe(row.placeId)
    }
  })
})
```

- [ ] **Step 2: Run — expect FAIL** (file missing or length ≠ 34)

- [ ] **Step 3: Author `plate-codes.json` + extend catalogue**

For each civil code: ensure a `PlaceRecord` with `plateCode`, `lat`/`lon` (city centroid), `countyId`, `name`, `isOfficialCity` if applicable, `facts` (may be `[]` for new rows; prefer 1–2 short facts when known).

Rewrite `plates.ts`:

```ts
import { listPlateSeats } from './catalogue'
import type { PlateEntry } from './plates' // or define PlateEntry here

export type PlateEntry = {
  code: string
  countyId: string
  city: { hr: string; en: string }
}

export const PLATES: PlateEntry[] = listPlateSeats().map((p) => ({
  code: p.plateCode!,
  countyId: p.countyId,
  city: p.name,
}))

export function getPlateByCode(code: string): PlateEntry | undefined {
  return PLATES.find((plate) => plate.code === code)
}
```

- [ ] **Step 4: Run `npm test -- src/data/plateCodes.test.ts src/data/catalogue.test.ts` — PASS**

- [ ] **Step 5: Commit only if user asked**

---

### Task 3: Official cities (A) + home-city picker from catalogue

**Files:**
- Modify: `content/hr/places-catalogue.json` — mark/add all official RH cities (`isOfficialCity: true`) with coords
- Modify: `src/data/cities.ts` — `HOME_CITIES` / `getCityById` from `listOfficialCities()`
- Modify: `src/components/SetupScreen.tsx` if it assumes a short list (add search if list &gt; ~40)
- Create: `src/data/officialCities.test.ts`
- Update call sites still importing `PlaceCard` from `places.ts`: either keep a compat mapper or switch to `PlaceRecord`

**Interfaces:**
- Consumes: `listOfficialCities()`, `getPlaceById`
- Produces: `getCityById(id)` returns `{ id, name, lat, lon, countyId }` compatible with profile

```ts
// cities.ts
import { getPlaceById, listOfficialCities } from './catalogue'

export type City = {
  id: string
  name: { hr: string; en: string }
  lat: number
  lon: number
  countyId: string
}

export const HOME_CITIES: City[] = listOfficialCities().map((p) => ({
  id: p.id,
  name: p.name,
  lat: p.lat,
  lon: p.lon,
  countyId: p.countyId,
}))

export function getCityById(id: string): City | undefined {
  const p = getPlaceById(id)
  if (!p?.isOfficialCity) return undefined
  return { id: p.id, name: p.name, lat: p.lat, lon: p.lon, countyId: p.countyId }
}
```

Official city list: use RH Zakon / Wikipedia “List of cities in Croatia” (~128). Every official city must appear in the catalogue; plate-only seats that are not cities keep `isOfficialCity: false`.

- [ ] **Step 1: Failing test — official city count and Zagreb**

```ts
import { describe, expect, it } from 'vitest'
import { HOME_CITIES, getCityById } from './cities'
import { listOfficialCities } from './catalogue'

describe('official cities', () => {
  it('exposes at least 120 official cities', () => {
    expect(listOfficialCities().length).toBeGreaterThanOrEqual(120)
  })

  it('HOME_CITIES matches official cities', () => {
    expect(HOME_CITIES.length).toBe(listOfficialCities().length)
    expect(getCityById('zagreb')?.name.hr).toBe('Zagreb')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Expand catalogue + wire cities.ts + SetupScreen search**

If `SetupScreen` uses a `<select>`, switch to filterable list (`input` + filtered `HOME_CITIES`) so 120+ cities remain usable.

Migrate `places.ts` consumers (`PlacesMode`, `DistanceMode`) to `PlaceRecord` **or** provide:

```ts
export function asPlaceCard(p: PlaceRecord): PlaceCard { /* map facts into basic/advanced split: first 3 → basic, rest → advanced */ }
export function curatedPlaces(): PlaceCard[] {
  return listOfficialCities().map(asPlaceCard) // or all curated flags
}
```

Prefer migrating modes in Tasks 8–11; for Task 3 keep a thin compat layer so `npm test` and `npm run build` stay green.

- [ ] **Step 4: `npm test` and `npm run build` — PASS**

- [ ] **Step 5: Commit only if user asked**

---

### Task 4: Deck helpers (TDD)

**Files:**
- Create: `src/learning/types.ts`
- Create: `src/learning/deck.ts`
- Create: `src/learning/deck.test.ts`

**Interfaces:**
- Produces:

```ts
export type RoundLimit = 5 | 10 | 15 | 'endless'

export function shuffle<T>(items: T[], rng?: () => number): T[]

export function createDeckCursor<T>(items: T[], rng?: () => number): {
  remaining: () => number
  draw(): T | undefined  // undefined when exhausted
  reset(): void
}

export function shouldEndSession(answered: number, limit: RoundLimit): boolean
```

- [ ] **Step 1: Write tests**

```ts
import { describe, expect, it } from 'vitest'
import { createDeckCursor, shouldEndSession, shuffle } from './deck'

describe('shuffle', () => {
  it('preserves elements', () => {
    const input = [1, 2, 3, 4]
    expect(shuffle(input, () => 0).sort()).toEqual(input)
  })
})

describe('createDeckCursor', () => {
  it('does not repeat until exhausted', () => {
    const cursor = createDeckCursor(['a', 'b', 'c'], () => 0)
    const seen = [cursor.draw(), cursor.draw(), cursor.draw()]
    expect(seen.sort()).toEqual(['a', 'b', 'c'])
    expect(cursor.draw()).toBeUndefined()
  })
})

describe('shouldEndSession', () => {
  it('ends at fixed limits and never for endless', () => {
    expect(shouldEndSession(5, 5)).toBe(true)
    expect(shouldEndSession(4, 5)).toBe(false)
    expect(shouldEndSession(100, 'endless')).toBe(false)
  })
})
```

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement `deck.ts`** (Fisher–Yates with injectable rng; cursor copies shuffled order; `reset` reshuffles)

- [ ] **Step 4: Run — PASS**

---

### Task 5: Learning types + style preference

**Files:**
- Create: `src/learning/types.ts` (if not fully done in Task 4)
- Create: `src/learning/stylePreference.ts`
- Create: `src/learning/stylePreference.test.ts`

**Interfaces:**

```ts
export type LearningStyle = 'flashcards' | 'quiz' | 'encyclopedia'

export type ModeContext = {
  profileName: string
  homeCityId: string
  level: 1 | 2 | 3 | 4 | 5
  language: 'hr' | 'en'
}

export type Choice = { id: string; label: string; correct: boolean }

export type DeckItem = {
  entityId: string
  promptKind: string
  tags?: string[]
  // opaque payload for adapters (county id, place id, distance round, …)
  payload: unknown
}

export type EncyclopediaEntry = {
  id: string
  title: string
  subtitle?: string
  searchText: string
}

export type ModeContentAdapter = {
  modeId: 'map' | 'plates' | 'places' | 'distance'
  buildDeck: (ctx: ModeContext) => DeckItem[]
  renderPrompt: (item: DeckItem, ctx: ModeContext) => React.ReactNode
  renderChoices?: (item: DeckItem, choices: Choice[], ctx: ModeContext) => React.ReactNode
  buildChoices: (item: DeckItem, deck: DeckItem[], ctx: ModeContext) => Choice[]
  renderDetail: (item: DeckItem, ctx: ModeContext) => React.ReactNode
  encyclopediaIndex: (ctx: ModeContext) => EncyclopediaEntry[]
  renderEncyclopediaDetail: (id: string, ctx: ModeContext) => React.ReactNode
}

export function loadLearningStyle(modeId: string): LearningStyle | null
export function saveLearningStyle(modeId: string, style: LearningStyle): void
```

Storage key: `obzor:learningStyle:v1` → `Record<modeId, LearningStyle>`.

- [ ] **Step 1–4:** TDD load/save round-trip with a mock `localStorage` or happy-dom (Vitest already uses happy-dom).

---

### Task 6: FlashcardView + QuizView (solo)

**Files:**
- Create: `src/learning/FlashcardView.tsx`
- Create: `src/learning/QuizView.tsx`
- Modify: `src/App.css`
- Modify: `src/i18n/locales/hr.json`, `en.json` — keys under `learning.*`

**Interfaces:**
- Consumes: adapter methods, `createDeckCursor`, `recordAnswer`, `shouldEndSession`
- Props sketch:

```ts
type FlashcardViewProps = {
  adapter: ModeContentAdapter
  ctx: ModeContext
  onBack: () => void
}

type QuizViewProps = FlashcardViewProps & {
  roundLimit: RoundLimit
  onRoundLimitChange?: (n: RoundLimit) => void
}
```

Flashcards: show `renderPrompt` → button flip → `renderDetail` + “Znao” / “Nisam znao” → `recordAnswer({ correct: knew })` → next card; on deck empty show summary + reshuffle.

Quiz solo: draw item, `buildChoices`, show choices (or `renderChoices` if provided), hint button revealing a short string from detail/fact, scoreline, end when `shouldEndSession`.

- [ ] **Step 1:** Add i18n keys (`learning.flashcards`, `learning.quiz`, `learning.knew`, `learning.didNotKnow`, `learning.hint`, `learning.rounds`, …).

- [ ] **Step 2:** Implement both views; keep styling consistent with existing `.panel` / mode cards (no new design system).

- [ ] **Step 3:** Manual smoke later with Task 7; for now `npm run build` must pass.

---

### Task 7: LearningShell + wire Plates mode first

**Files:**
- Create: `src/learning/LearningShell.tsx`
- Create: `src/modes/plates/platesAdapter.tsx`
- Modify: `src/modes/plates/PlatesMode.tsx` — become shell host
- Modify: i18n + CSS as needed

**Interfaces:**
- `LearningShell({ adapter, ctx, onBack })` shows style picker (Kartice / Kviz / Enciklopedija placeholder for Task 12) using `loadLearningStyle` / `saveLearningStyle`.
- `platesAdapter`: port current `PlatesMode` pool-by-level + `codeToPlace` / `placeToCode` into `buildDeck` / `buildChoices` / `renderPrompt` (use `RegistrationPlate` + `simulateHrSerial`).

Level pools (preserve behaviour, expand codes):

- level ≤ 1: major codes `ZG ST RI OS ZD PU`
- level 2: previous `PLATES` county-seat set
- level ≥ 3: all `listPlateSeats()`

- [ ] **Step 1:** Implement adapter + shell; PlatesMode renders `<LearningShell adapter={platesAdapter} … />`.

- [ ] **Step 2:** `npm test` + `npm run build` PASS.

- [ ] **Step 3:** Manual: open Tablice → Kartice flip works; Kviz answers update score and progress.

---

### Task 8: Places adapter

**Files:**
- Create: `src/modes/places/placesAdapter.tsx`
- Modify: `src/modes/places/PlacesMode.tsx`
- Keep `PlaceLocationMap` for detail / encyclopedia

Deck: guess place from a basic fact; choices = other places. Encyclopedia: all catalogue places (or official + plate seats). Detail shows facts + mini-map.

- [ ] Implement adapter; wire shell; tests/build green; smoke Kartice/Kviz.

---

### Task 9: Map adapter

**Files:**
- Create: `src/modes/map/mapAdapter.tsx`
- Modify: `src/modes/map/MapMode.tsx`
- Reuse `CroatiaMap` inside `renderPrompt` / choices as today (tap county)

Flashcards: show county name → flip to map highlight. Quiz: keep tap-to-answer as primary (`renderChoices` can be the map). Encyclopedia: county list from `COUNTIES`.

- [ ] Implement; build green; smoke.

---

### Task 10: Distance adapter

**Files:**
- Create: `src/modes/distance/distanceAdapter.tsx`
- Modify: `src/modes/distance/DistanceMode.tsx`
- Reuse Haversine, bands, compass, `CroatiaDistanceMap`, `CompassRose`

Deck kinds in `payload`: `{ kind: 'distance' | 'direction' | 'closer', … }` matching current `Round` union. Home = `ctx.homeCityId`. Pool = catalogue places with coords excluding home.

Encyclopedia: pick a place → show km + compass8 from home; optional second place → km between them (Haversine only).

- [ ] Implement; `npm test` (geo tests unchanged); build green; smoke.

---

### Task 11: EncyclopediaView for all modes

**Files:**
- Create: `src/learning/EncyclopediaView.tsx`
- Modify: `LearningShell.tsx` — enable Enciklopedija
- Modify: CSS + i18n

Behaviour: search box filters `encyclopediaIndex` by `searchText`; click → `renderEncyclopediaDetail`. For places/plates show facts; empty facts → omit section.

- [ ] Implement; smoke all four modes’ encyclopedia.

---

### Task 12: Enrich facts for major places

**Files:**
- Modify: `content/hr/places-catalogue.json`

Target: every official city and plate seat has **at least one** fact (hr+en); county seats / large cities keep 2–5. Educational tone; approximate OK; note in `ATTRIBUTION.md` if new sources used.

- [ ] Add facts in batches; re-run catalogue tests; spot-check Enciklopedija.

---

### Task 13: Multiplayer pass & play

**Files:**
- Create: `src/learning/MultiplayerQuizView.tsx`
- Modify: `QuizView.tsx` or shell — entry “Sam” vs “Više igrača”
- Modify: i18n (`learning.passDevice`, `learning.addPlayer`, medals copy)

**Rules (match flags app):**
- 2–6 players; each name + colour
- Same deck cursor shared; on answer advance turn
- Do **not** call `recordAnswer`
- Round limits 5 / 10 / 15 / endless
- End screen: sorted scores + 🥇🥈🥉

- [ ] Implement; manual smoke with 2 players; `npm test` + build PASS.

---

### Task 14: Polish + process log

**Files:**
- Create/update: `docs/logs-process/2026-08-21_learning-shell-flags-ux.md`
- Modify: README short note on Kartice/Kviz/Enciklopedija
- Fix any i18n gaps; offline banner still works

- [ ] Run full `npm test` && `npm run build` && `npm run lint`
- [ ] Fill process log (objectives, decisions, verification)
- [ ] Commit only if user asked

---

## Self-review (plan vs spec)

| Spec requirement | Task |
|------------------|------|
| LearningShell + adapters | 5–7 |
| Kartice / Kviz solo | 6–7 |
| Enciklopedija | 11 |
| Multiplayer session-only | 13 |
| Full HR plate codes | 2 |
| Official cities + plate seats (A+C) | 2–3 |
| Crow-fly distances | 10 (existing geo) |
| City facts | 1 seed + 12 enrich |
| Keep four modes | 7–10 |
| Progress solo only | 6, 13 |
| HR/EN only | global + i18n steps |

No TBD placeholders. Types aligned across Tasks 1 / 5 / adapters (`PlaceRecord`, `ModeContentAdapter`, `DeckItem`).
