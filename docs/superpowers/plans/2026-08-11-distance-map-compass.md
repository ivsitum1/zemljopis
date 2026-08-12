# Distance Map + Compass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the schematic MiniRoute in Udaljenost with a read-only Croatia SVG map and compass rose, always offer 8 compass directions, and leave a typed Europe stub for later.

**Architecture:** Reuse `counties.json` + `projectEquirectangular` / `computeBBox` / `ringToPath` from the map mode. New presentational components (`CroatiaDistanceMap`, `CompassRose`) sit beside answer buttons; `DistanceMode` always builds 8-way direction rounds. Europe is a non-rendered stub + `MapRegion` type only.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, i18next (hr/en), existing SVG GeoJSON (no Leaflet).

## Global Constraints

- No new map/tile dependencies (no Leaflet, Mapbox, OSM tiles).
- Answers stay on buttons; map and compass are visual only.
- Direction rounds always use 8 options (`N`…`NW`) whenever they appear (level ≥ 2 path unchanged except `use8` always true).
- Map always visible; compass emphasized only when `round.kind === 'direction'`.
- Phase 2 Europe: stub + type only — do not ship live Europe UI.
- Follow existing CSS variables / panel look; do not invent a new design system.
- AI commits (if user requests commits): `--author="Agent AI <agent.ai@assistant.local>"`; prefer `feat:` / `fix:`; never `BREAKING CHANGE`.
- Tests: `npm test` (vitest run). No React Testing Library in the project — unit-test pure helpers.

---

## File structure

| File | Responsibility |
|------|----------------|
| `src/modes/distance/mapTypes.ts` | `MapRegion`, shared point types for distance maps |
| `src/modes/distance/CroatiaDistanceMap.tsx` | Read-only HR counties + markers + route lines |
| `src/modes/distance/CompassRose.tsx` | Non-interactive 8-way rose with emphasize state |
| `src/modes/distance/EuropeDistanceMap.tsx` | Phase-2 stub (exported, not mounted) |
| `src/modes/distance/DistanceMode.tsx` | Wire panel; always 8 directions; remove `MiniRoute` |
| `src/geo/distance.ts` | Export `COMPASS8_ALL` constant used by quiz + rose |
| `src/geo/projectCity.test.ts` (or extend existing) | Assert Zagreb projects inside HR viewBox |
| `src/i18n/locales/hr.json`, `en.json` | `dirsShort` + map/compass aria strings |
| `src/App.css` | `.distance-viz`, map-readonly, compass rose states |

---

### Task 1: Always-8 compass constant + direction round logic

**Files:**
- Modify: `src/geo/distance.ts`
- Modify: `src/modes/distance/DistanceMode.tsx` (direction branch of `makeRound` only)
- Modify: `src/geo/distance.test.ts`
- Test: `src/geo/distance.test.ts`

**Interfaces:**
- Consumes: existing `Compass8`, `toCompass8`
- Produces: `export const COMPASS8_ALL: readonly Compass8[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']`

- [ ] **Step 1: Write the failing test**

Add to `src/geo/distance.test.ts`:

```ts
import { COMPASS8_ALL, toCompass8 } from '../geo/distance'

it('exposes all eight compass directions in order', () => {
  expect(COMPASS8_ALL).toEqual(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'])
})

it('maps Zagreb→Split to south on the 8-way compass', () => {
  const bearing = bearingDegrees(45.815, 15.982, 43.508, 16.44)
  expect(toCompass8(bearing)).toBe('S')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/geo/distance.test.ts`

Expected: FAIL — `COMPASS8_ALL` is not exported.

- [ ] **Step 3: Export `COMPASS8_ALL` and force 8-way in `makeRound`**

In `src/geo/distance.ts`, after the `Compass8` type:

```ts
export const COMPASS8_ALL: readonly Compass8[] = [
  'N',
  'NE',
  'E',
  'SE',
  'S',
  'SW',
  'W',
  'NW',
]
```

In `DistanceMode.tsx` `makeRound`, replace the direction branch:

```ts
  if (level >= 2 && roll > 0.45) {
    const correct = toCompass8(bearing)
    return {
      kind: 'direction',
      target,
      km,
      bearing,
      correct,
      options: shuffle([...COMPASS8_ALL]),
      use8: true,
    }
  }
```

Remove unused `toCompass4` import from `DistanceMode.tsx` if nothing else uses it. Keep `toCompass4` in `distance.ts` (still tested / available).

Simplify the `Round` direction variant if desired: keep `use8: boolean` as always `true` for now (minimal diff), or remove `use8` from the type and all reads — prefer **remove `use8`** from the Round type and UI if the only consumer was option building.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/geo/distance.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit** (only if user asked to commit)

```bash
git add src/geo/distance.ts src/geo/distance.test.ts src/modes/distance/DistanceMode.tsx
git commit --author="Agent AI <agent.ai@assistant.local>" -m "$(cat <<'EOF'
feat(distance): always use 8 compass directions

EOF
)"
```

---

### Task 2: `mapTypes` + city-in-bbox projection test helper

**Files:**
- Create: `src/modes/distance/mapTypes.ts`
- Create: `src/modes/distance/projectOnMap.ts`
- Create: `src/modes/distance/projectOnMap.test.ts`

**Interfaces:**
- Consumes: `BBox`, `projectEquirectangular` from `src/geo/project.ts`
- Produces:

```ts
// mapTypes.ts
export type MapRegion = 'hr' | 'eu'

export type MapPoint = {
  lat: number
  lon: number
  label?: string
  role: 'home' | 'target' | 'secondary'
}

// projectOnMap.ts
export function projectLonLat(
  lat: number,
  lon: number,
  bbox: BBox,
  width: number,
  height: number,
  padding?: number,
): { x: number; y: number }
```

`projectLonLat` is a thin wrapper calling `projectEquirectangular(lon, lat, bbox, width, height, padding)` so distance-map code does not invert lon/lat by mistake.

- [ ] **Step 1: Write the failing test**

Create `src/modes/distance/projectOnMap.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import countiesGeo from '../../data/geo/counties.json'
import { computeBBox, type LonLat } from '../../geo/project'
import { projectLonLat } from './projectOnMap'

const features = (
  countiesGeo as unknown as {
    features: Array<{ geometry: { coordinates: LonLat[][] } }>
  }
).features

describe('projectLonLat', () => {
  it('places Zagreb inside the Croatia viewBox', () => {
    const width = 640
    const height = 420
    const bbox = computeBBox(features)
    const { x, y } = projectLonLat(45.815, 15.982, bbox, width, height)
    expect(x).toBeGreaterThan(0)
    expect(x).toBeLessThan(width)
    expect(y).toBeGreaterThan(0)
    expect(y).toBeLessThan(height)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/modes/distance/projectOnMap.test.ts`

Expected: FAIL — module `./projectOnMap` not found.

- [ ] **Step 3: Implement types + helper**

`src/modes/distance/mapTypes.ts`:

```ts
export type MapRegion = 'hr' | 'eu'

export type MapPoint = {
  lat: number
  lon: number
  label?: string
  role: 'home' | 'target' | 'secondary'
}
```

`src/modes/distance/projectOnMap.ts`:

```ts
import { projectEquirectangular, type BBox } from '../../geo/project'

export function projectLonLat(
  lat: number,
  lon: number,
  bbox: BBox,
  width: number,
  height: number,
  padding = 12,
): { x: number; y: number } {
  return projectEquirectangular(lon, lat, bbox, width, height, padding)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/modes/distance/projectOnMap.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit** (only if user asked)

```bash
git add src/modes/distance/mapTypes.ts src/modes/distance/projectOnMap.ts src/modes/distance/projectOnMap.test.ts
git commit --author="Agent AI <agent.ai@assistant.local>" -m "$(cat <<'EOF'
feat(distance): add map region types and lon/lat projection helper

EOF
)"
```

---

### Task 3: `CroatiaDistanceMap` (read-only) + CSS

**Files:**
- Create: `src/modes/distance/CroatiaDistanceMap.tsx`
- Modify: `src/App.css`
- Test: reuse Task 2 projection test; manual smoke after Task 5

**Interfaces:**
- Consumes: `MapPoint`, `projectLonLat`, `counties.json`, `computeBBox`, `ringToPath`
- Produces:

```tsx
export type CroatiaDistanceMapProps = {
  width?: number
  height?: number
  home: MapPoint
  target: MapPoint
  secondary?: MapPoint
  ariaLabel: string
}

export function CroatiaDistanceMap(props: CroatiaDistanceMapProps): JSX.Element
```

- [ ] **Step 1: Implement `CroatiaDistanceMap`**

Create `src/modes/distance/CroatiaDistanceMap.tsx`:

```tsx
import { useMemo } from 'react'
import countiesGeo from '../../data/geo/counties.json'
import { computeBBox, ringToPath, type LonLat } from '../../geo/project'
import type { MapPoint } from './mapTypes'
import { projectLonLat } from './projectOnMap'

type CountyFeature = {
  type: 'Feature'
  properties: { id: string }
  geometry: { type: 'Polygon'; coordinates: LonLat[][] }
}

const featureCollection = countiesGeo as unknown as {
  type: 'FeatureCollection'
  features: CountyFeature[]
}

export type CroatiaDistanceMapProps = {
  width?: number
  height?: number
  home: MapPoint
  target: MapPoint
  secondary?: MapPoint
  ariaLabel: string
}

export function CroatiaDistanceMap({
  width = 640,
  height = 420,
  home,
  target,
  secondary,
  ariaLabel,
}: CroatiaDistanceMapProps) {
  const bbox = useMemo(() => computeBBox(featureCollection.features), [])
  const paths = useMemo(
    () =>
      featureCollection.features.map((feature) => ({
        id: feature.properties.id,
        d: ringToPath(feature.geometry.coordinates[0], bbox, width, height),
      })),
    [bbox, height, width],
  )

  const homePt = projectLonLat(home.lat, home.lon, bbox, width, height)
  const targetPt = projectLonLat(target.lat, target.lon, bbox, width, height)
  const secondaryPt = secondary
    ? projectLonLat(secondary.lat, secondary.lon, bbox, width, height)
    : null

  return (
    <svg
      className="croatia-distance-map"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
    >
      {paths.map((path) => (
        <path key={path.id} d={path.d} className="county readonly" />
      ))}
      <line
        x1={homePt.x}
        y1={homePt.y}
        x2={targetPt.x}
        y2={targetPt.y}
        className="route-line"
      />
      {secondaryPt ? (
        <line
          x1={homePt.x}
          y1={homePt.y}
          x2={secondaryPt.x}
          y2={secondaryPt.y}
          className="route-line secondary"
        />
      ) : null}
      <circle cx={homePt.x} cy={homePt.y} r={7} className="route-home" />
      <circle cx={targetPt.x} cy={targetPt.y} r={7} className="route-target" />
      {secondaryPt ? (
        <circle
          cx={secondaryPt.x}
          cy={secondaryPt.y}
          r={7}
          className="route-target secondary"
        />
      ) : null}
    </svg>
  )
}
```

Do **not** attach `onClick` to counties. Do **not** use `cursor: pointer` on readonly counties.

- [ ] **Step 2: Add CSS**

Append to `src/App.css` (keep existing `.route-line` / `.route-home` styles; add map-specific rules):

```css
.distance-viz {
  display: grid;
  gap: 0.75rem;
  align-items: center;
}

@media (min-width: 720px) {
  .distance-viz {
    grid-template-columns: minmax(0, 1fr) auto;
  }
}

.croatia-distance-map {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 0.75rem;
  border: 1px solid var(--line);
  background: #d9e8ef;
}

.croatia-distance-map .county.readonly {
  fill: #f4faf7;
  stroke: #3d5c52;
  stroke-width: 1.1;
  cursor: default;
  pointer-events: none;
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc -b --pretty false`

Expected: no errors related to the new file (full project may already be clean).

- [ ] **Step 4: Commit** (only if user asked)

```bash
git add src/modes/distance/CroatiaDistanceMap.tsx src/App.css
git commit --author="Agent AI <agent.ai@assistant.local>" -m "$(cat <<'EOF'
feat(distance): add read-only Croatia distance map

EOF
)"
```

---

### Task 4: `CompassRose` + i18n short labels

**Files:**
- Create: `src/modes/distance/CompassRose.tsx`
- Modify: `src/i18n/locales/hr.json`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: `COMPASS8_ALL`, `Compass8`, `t('distance.dirsShort.*')`
- Produces:

```tsx
export type CompassRoseProps = {
  emphasized: boolean
  highlight?: Compass8 | null
  bearingDegrees?: number | null
  ariaLabel: string
}

export function CompassRose(props: CompassRoseProps): JSX.Element
```

When `emphasized` is false, root class is `compass-rose subdued`. When true, `compass-rose emphasized`. If `highlight` is set (after correct answer), mark that spoke. Optional needle: rotate a line by `bearingDegrees` when provided (after correct direction).

- [ ] **Step 1: Add i18n keys**

In `hr.json` under `distance`:

```json
"mapAria": "Karta Hrvatske s domom i ciljem",
"compassAria": "Kompas",
"dirsShort": {
  "N": "S",
  "NE": "SI",
  "E": "I",
  "SE": "JI",
  "S": "J",
  "SW": "JZ",
  "W": "Z",
  "NW": "SZ"
}
```

In `en.json` under `distance`:

```json
"mapAria": "Map of Croatia with home and target",
"compassAria": "Compass",
"dirsShort": {
  "N": "N",
  "NE": "NE",
  "E": "E",
  "SE": "SE",
  "S": "S",
  "SW": "SW",
  "W": "W",
  "NW": "NW"
}
```

Keep existing full `dirs` for answer buttons.

- [ ] **Step 2: Implement `CompassRose`**

Create `src/modes/distance/CompassRose.tsx`:

```tsx
import { useTranslation } from 'react-i18next'
import { COMPASS8_ALL, type Compass8 } from '../../geo/distance'

export type CompassRoseProps = {
  emphasized: boolean
  highlight?: Compass8 | null
  bearingDegrees?: number | null
  ariaLabel: string
}

const SIZE = 160
const CX = SIZE / 2
const CY = SIZE / 2
const LABEL_R = 58
const RING_R = 48

function labelPosition(dir: Compass8): { x: number; y: number } {
  const index = COMPASS8_ALL.indexOf(dir)
  const angle = ((index * 45 - 90) * Math.PI) / 180
  return {
    x: CX + Math.cos(angle) * LABEL_R,
    y: CY + Math.sin(angle) * LABEL_R,
  }
}

export function CompassRose({
  emphasized,
  highlight = null,
  bearingDegrees = null,
  ariaLabel,
}: CompassRoseProps) {
  const { t } = useTranslation()
  const className = `compass-rose ${emphasized ? 'emphasized' : 'subdued'}`

  return (
    <svg
      className={className}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={ariaLabel}
      width={SIZE}
      height={SIZE}
    >
      <circle cx={CX} cy={CY} r={RING_R} className="compass-ring" />
      {COMPASS8_ALL.map((dir) => {
        const { x, y } = labelPosition(dir)
        const isHi = highlight === dir
        return (
          <text
            key={dir}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className={isHi ? 'compass-label highlight' : 'compass-label'}
          >
            {t(`distance.dirsShort.${dir}`)}
          </text>
        )
      })}
      {bearingDegrees != null ? (
        <line
          x1={CX}
          y1={CY}
          x2={CX}
          y2={CY - RING_R + 6}
          className="compass-needle"
          transform={`rotate(${bearingDegrees} ${CX} ${CY})`}
        />
      ) : (
        <circle cx={CX} cy={CY} r={3} className="compass-hub" />
      )}
    </svg>
  )
}
```

- [ ] **Step 3: Add compass CSS**

```css
.compass-rose {
  display: block;
  margin-inline: auto;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: #f7faf8;
}

.compass-rose.subdued {
  opacity: 0.55;
  transform: scale(0.85);
}

.compass-rose.emphasized {
  opacity: 1;
  transform: scale(1);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-deep) 35%, transparent);
}

.compass-ring {
  fill: #eef5f1;
  stroke: #3d5c52;
  stroke-width: 1.5;
}

.compass-label {
  fill: #1d2a24;
  font-size: 11px;
  font-weight: 700;
}

.compass-label.highlight {
  fill: var(--accent-deep);
  font-size: 13px;
}

.compass-needle {
  stroke: var(--accent-deep);
  stroke-width: 3;
  stroke-linecap: round;
}

.compass-hub {
  fill: #3d5c52;
}
```

- [ ] **Step 4: Commit** (only if user asked)

```bash
git add src/modes/distance/CompassRose.tsx src/i18n/locales/hr.json src/i18n/locales/en.json src/App.css
git commit --author="Agent AI <agent.ai@assistant.local>" -m "$(cat <<'EOF'
feat(distance): add compass rose with short direction labels

EOF
)"
```

---

### Task 5: Wire `DistanceMode` — replace `MiniRoute`

**Files:**
- Modify: `src/modes/distance/DistanceMode.tsx`
- Modify: `src/App.css` (remove unused `.mini-route*` only if nothing else references them — after deletion of `MiniRoute`, delete those rules)

**Interfaces:**
- Consumes: `CroatiaDistanceMap`, `CompassRose`, `MapPoint`
- Produces: updated UI; no public API change to `DistanceModeProps`

- [ ] **Step 1: Replace MiniRoute block with distance-viz panel**

At top of `DistanceMode.tsx`, add imports:

```ts
import { CroatiaDistanceMap } from './CroatiaDistanceMap'
import { CompassRose } from './CompassRose'
import { COMPASS8_ALL } from '../../geo/distance'
```

(Adjust if `COMPASS8_ALL` already imported in Task 1.)

Build map points from the current round:

```tsx
  const mapHome = { lat: home.lat, lon: home.lon, role: 'home' as const }
  const mapTarget =
    round.kind === 'closer'
      ? { lat: round.a.lat, lon: round.a.lon, role: 'target' as const }
      : { lat: round.target.lat, lon: round.target.lon, role: 'target' as const }
  const mapSecondary =
    round.kind === 'closer'
      ? { lat: round.b.lat, lon: round.b.lon, role: 'secondary' as const }
      : undefined

  const directionHighlight =
    round.kind === 'direction' && status === 'correct' ? round.correct : null
  const directionBearing =
    round.kind === 'direction' && status === 'correct' ? round.bearing : null
```

Replace the `{round.kind !== 'closer' ? <MiniRoute…/> : <MiniRoute…/>}` block with:

```tsx
      <div className="distance-viz">
        <CroatiaDistanceMap
          home={mapHome}
          target={mapTarget}
          secondary={mapSecondary}
          ariaLabel={t('distance.mapAria')}
        />
        <CompassRose
          emphasized={round.kind === 'direction'}
          highlight={directionHighlight}
          bearingDegrees={directionBearing}
          ariaLabel={t('distance.compassAria')}
        />
      </div>
```

Delete the entire local `MiniRoute` function at the bottom of the file.

Ensure direction choice buttons still use `t(\`distance.dirs.${dir}\`)` (full names), not `dirsShort`.

- [ ] **Step 2: Remove obsolete MiniRoute CSS**

Delete `.mini-route`, `.mini-route-svg` rules from `App.css` if unused. Keep `.route-line`, `.route-home`, `.route-target` (still used by the new map).

- [ ] **Step 3: Run full test suite + lint**

Run:

```bash
npm test
npm run lint
npx tsc -b --pretty false
```

Expected: all green.

- [ ] **Step 4: Manual smoke (dev server)**

Run: `npm run dev`

Check:

1. Distance round — map + subdued compass, band buttons work.
2. Direction round — map + emphasized compass, **8** full-name buttons including jugoistok / sjeverozapad.
3. Closer round (level ≥ 4) — two lines / two targets.
4. Correct direction — needle + highlight appear.
5. Toggle HR/EN — short rose labels and full button labels update.

- [ ] **Step 5: Commit** (only if user asked)

```bash
git add src/modes/distance/DistanceMode.tsx src/App.css
git commit --author="Agent AI <agent.ai@assistant.local>" -m "$(cat <<'EOF'
feat(distance): show Croatia map and compass in distance mode

EOF
)"
```

---

### Task 6: Europe stub (phase 2 placeholder)

**Files:**
- Create: `src/modes/distance/EuropeDistanceMap.tsx`

**Interfaces:**
- Consumes: `MapPoint`, `MapRegion` (document `'eu'`)
- Produces: exported stub component **not** imported by `DistanceMode`

```tsx
import type { MapPoint } from './mapTypes'

/**
 * Phase 2 placeholder: Europe outline + city dots.
 * Do not mount until Europe GeoJSON and city dataset exist.
 */
export type EuropeDistanceMapProps = {
  home: MapPoint
  target: MapPoint
  secondary?: MapPoint
  ariaLabel: string
}

export function EuropeDistanceMap(_props: EuropeDistanceMapProps) {
  return null
}
```

- [ ] **Step 1: Add the stub file exactly as above**

- [ ] **Step 2: Confirm DistanceMode does not import it**

Grep: `EuropeDistanceMap` should appear only in its own file (and this plan/spec).

- [ ] **Step 3: Run `npm test` once more**

Expected: PASS.

- [ ] **Step 4: Commit** (only if user asked)

```bash
git add src/modes/distance/EuropeDistanceMap.tsx
git commit --author="Agent AI <agent.ai@assistant.local>" -m "$(cat <<'EOF'
chore(distance): add Europe distance map stub for phase 2

EOF
)"
```

---

### Task 7: Process log update

**Files:**
- Create or merge: `docs/logs-process/2026-08-11_distance-map-compass.md`

- [ ] **Step 1: Write process log** summarizing objectives, tasks completed, decisions (SVG reuse, always-8, Europe deferred), and verification commands.

- [ ] **Step 2: Commit** (only if user asked) with `docs:` prefix.

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Croatia outline + home/target points | 3, 5 |
| Compass always visible; emphasized on direction | 4, 5 |
| Always 8 directions | 1, 5 |
| Visual-only (buttons for answers) | 3–5 |
| Reuse counties GeoJSON / projection | 2, 3 |
| No new map libs | Global + all tasks |
| Europe stub / MapRegion | 2, 6 |
| i18n HR/EN | 4 |
| Tests for compass + projection | 1, 2 |
| Closer: two lines/markers | 3, 5 |
| Optional bearing highlight after correct | 4, 5 |

## Self-review notes

- No TBD placeholders in task steps.
- `COMPASS8_ALL` and `MapPoint` / `projectLonLat` names are consistent across tasks.
- Commits are gated on user request (project rule overrides default plan “frequent commits” automation).
