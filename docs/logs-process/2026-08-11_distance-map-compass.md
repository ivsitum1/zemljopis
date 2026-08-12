# Task: Distance mode — Croatia map, compass, 8-way directions - 2026-08-11

## Objectives

- Replace the distance-mode schematic with a read-only Croatia county map, home/target markers, and route lines.
- Add a compass rose that is always visible; emphasize it on direction rounds, keep it subdued otherwise.
- Always offer eight compass directions (including intercardinals) on direction questions at every level ≥ 2.
- Reuse the existing SVG/GeoJSON projection stack (no Leaflet or tile layers).
- Defer Europe map (outline + city pins) to phase 2; represent only via types and a stub component.

## Prerequisites

- Approved design: `docs/superpowers/specs/2026-08-11-distance-map-compass-design.md`
- Implementation plan: `docs/superpowers/plans/2026-08-11-distance-map-compass.md`
- Existing geo helpers (`src/geo/distance.ts`, `src/geo/project.ts`) and `counties.json`
- Branch: `feat/distance-map-compass`

## Task Breakdown

- [x] Task 1: Export `COMPASS8_ALL`; direction rounds always 8-way; remove `use8` / `toCompass4` from quiz path
- [x] Task 2: `mapTypes` (`MapRegion`, `MapPoint`) + `projectLonLat` wrapper + Zagreb-in-bbox test
- [x] Task 3: `CroatiaDistanceMap` read-only SVG + distance-viz CSS (counties readonly, route lines)
- [x] Task 4: `CompassRose` SVG + `dirsShort` i18n + emphasized/subdued CSS
- [x] Task 5: Wire `DistanceMode` — replace `MiniRoute` with map + compass panel; needle on correct direction
- [x] Task 6: `EuropeDistanceMap` stub (returns `null`; not mounted from `DistanceMode`)
- [x] Task 7: Process log (this file)

## Process Notes

- [2026-08-11] Design approved: map is visual aid only; answers stay on choice buttons.
- [2026-08-12] Tasks 1–6 implemented in working tree; no commits (user override).
- [2026-08-12] Test count grew 8 → 11 as projection and compass-related tests landed.

## Problems & Solutions

No blocking issues during implementation. `toCompass8` retains a local directions array parallel to `COMPASS8_ALL`; duplication is harmless and out of scope.

## Decisions

| Topic | Choice | Rationale |
|-------|--------|-----------|
| Map stack | Reuse existing SVG/GeoJSON + `projectEquirectangular` | PWA/offline friendly; consistent with map mode |
| Answers | Visual-only map/compass; buttons unchanged | Design spec; avoids interactive map complexity |
| Direction count | Always 8 (`COMPASS8_ALL`) at level ≥ 2 | Intercardinals required at all levels |
| Compass visibility | Always present; `emphasized` on direction rounds | Learners see context without clutter on distance/closer rounds |
| Europe | `MapRegion = 'hr' \| 'eu'` + `EuropeDistanceMap` stub only | Phase 2; no GeoJSON or city dataset in phase 1 |
| MiniRoute | Removed after Task 5 wiring | Superseded by `CroatiaDistanceMap` |

## Result

- **Success** — Phase 1 distance-map-compass feature complete in working tree.
- All three round kinds (`distance`, `direction`, `closer`) render the Croatia map panel.
- Direction rounds show 8 full-name buttons and an emphasized compass rose.
- Correct direction answers rotate the needle and highlight the spoke.
- Europe deferred: stub typed but not rendered.

### Verification

```bash
npm test                    # 11/11 PASS (4 files)
npm run lint                # exit 0 (oxlint)
npx tsc -b --pretty false   # exit 0
```

Manual browser smoke (HR/EN, all round kinds, mobile layout) **deferred** — recommended before merge.

## Future Considerations

- Phase 2: Europe GeoJSON, city dataset, wire `EuropeDistanceMap` behind `MapRegion 'eu'`.
- Browser visual QA and optional component-level tests for map/compass rendering.
- Consider deduplicating `toCompass8` directions array with `COMPASS8_ALL` if desired.
