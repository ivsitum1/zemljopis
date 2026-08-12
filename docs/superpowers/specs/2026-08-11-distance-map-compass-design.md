# Design: Distance mode — Croatia map, compass, 8-way directions

**Date:** 2026-08-11  
**Status:** Approved for planning (pending user review of this file)  
**Mode:** Udaljenost (`DistanceMode`)

## Goal

Improve the distance/direction learning mode so learners see Croatia’s outline with home and target points, a compass rose, and always use eight compass directions (including intercardinals such as jugoistok / sjeverozapad). Europe with city dots is designed as phase 2 and is not built in phase 1 beyond a typed stub.

## Decisions (from brainstorming)

| Topic | Choice |
|-------|--------|
| Map role | Visual aid only; answers stay on buttons |
| Regions | Phase 1 = Croatia; phase 2 = Europe (stub only now) |
| Approach | Reuse existing SVG/GeoJSON stack (no Leaflet/tiles) |
| Intercardinals | Always 8 directions whenever a direction round runs |
| Map + compass visibility | Map always; compass emphasized on direction rounds, subdued otherwise |

## Architecture

### Phase 1 — UI layout

Replace `MiniRoute` in `DistanceMode` with a panel:

```
[ CroatiaDistanceMap ]  [ CompassRose ]
  county outlines (read-only)
  home + target markers (+ second target for “closer”)
  straight-line route segment(s)
```

- **CroatiaDistanceMap:** Read-only SVG using the same projection helpers and `counties.json` as `CroatiaMap`. No county click handlers.
- **CompassRose:** Non-interactive SVG rose with short or full Croatian/English labels (choose for mobile readability). Always visible; CSS/state `emphasized` when `round.kind === 'direction'`, otherwise subdued.
- **Answers:** Unchanged choice grids (distance bands, 8 direction buttons, closer A/B).
- **Optional after correct direction:** Emphasize bearing on the rose and/or route line (nice-to-have in implementation, not blocking).

### Phase 2 — Europe (deferred)

- Introduce `MapRegion = 'hr' | 'eu'`; UI fixed to `'hr'` in phase 1.
- Stub component `EuropeDistanceMap` (not rendered, or gated behind false) documenting the future contract: Europe outline + city point markers from lat/lon.
- No Europe GeoJSON or city dataset work in phase 1.

## Game logic and data

### Direction rounds

- Whenever `kind === 'direction'`, options are always the eight compass values: `N, NE, E, SE, S, SW, W, NW`.
- Correct answer from `toCompass8(bearing)`.
- Remove the quiz path that uses `toCompass4` / `use8 = level >= 4`. Keep `toCompass4` in `distance.ts` only if tests or other callers still need it; otherwise leave unused or drop in a later cleanup if unused.
- Existing i18n keys `distance.dirs.*` already cover HR/EN full names. Add `dirsShort` only if the rose needs abbreviations (e.g. S, SI, I, JI…).

### Other rounds

- `distance` and `closer` keep current rules and prompts.
- Map still shows for all round kinds; compass is subdued on non-direction rounds.
- Home city never selected as target (existing exclusion).
- Closer rounds: two route lines and two target markers with distinguishable styling.

### Data sources

- Home: `getCityById(homeCityId)` (`cities.ts`).
- Targets: `curatedPlaces()` (`places.ts`).
- Geometry: `src/data/geo/counties.json` + `computeBBox` / projection from `src/geo/project.ts`.

## Components and files

| Path | Change |
|------|--------|
| `src/modes/distance/DistanceMode.tsx` | Wire map+compass; always 8-way direction options; remove MiniRoute usage |
| `src/modes/distance/CroatiaDistanceMap.tsx` | New — read-only HR outline + markers |
| `src/modes/distance/CompassRose.tsx` | New — visual compass |
| `src/modes/distance/EuropeDistanceMap.tsx` | New stub for phase 2 |
| `src/modes/distance/types.ts` (or inline) | `MapRegion` type |
| `src/App.css` | Panel layout; compass normal/emphasized; marker/line styles |
| `src/i18n/locales/hr.json`, `en.json` | Optional short compass labels + a11y strings |
| `src/geo/distance.ts` / `distance.test.ts` | Quiz uses 8-way; keep tests green |
| Remove or keep local `MiniRoute` | Delete once replaced |

Do not add map tile libraries. Preserve PWA/offline friendliness.

## Error handling and edge cases

- Missing home city: keep existing early return / guard behavior.
- Degenerate projection (coincident points): still render markers; line may be zero-length.
- Language switch: map labels (if any) and compass/dir buttons follow `i18n` language.
- Accessibility: map `role="img"` with descriptive `aria-label`; compass decorative or labeled; answers remain focusable buttons.

## Testing

- Unit: existing `toCompass8` / bearing cases remain; extend if direction-round construction is extracted and testable.
- Optional: helper that projects a known city into the HR bbox stays inside viewBox.
- Manual: all three round kinds; levels 1–5; HR and EN; narrow mobile layout; correct/wrong feedback still readable with the larger map.

## Out of scope (phase 1)

- Interactive compass or map clicks for answers
- Europe outline dataset and European city pins in the live UI
- Road distance / routing
- Device orientation / magnetometer

## Success criteria

1. Every distance-mode round shows Croatia’s county outline with home and relevant target point(s).
2. A compass rose is always present; visually stronger on direction questions.
3. Direction questions always offer eight labeled directions (including intercardinals).
4. No new map dependencies; existing map-mode GeoJSON/projection reused.
5. Phase 2 Europe is represented only by types/stub, clearly deferred.
