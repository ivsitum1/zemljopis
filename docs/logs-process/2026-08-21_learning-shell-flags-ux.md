# Task: Learning shell (Kartice / Kviz / Enciklopedija) - 2026-08-21

## Objectives

- Add Learn-the-flags-style learning UX on top of Obzor’s four modes (map, plates, places, distance).
- Unify Croatia places into one catalogue (official cities + plate-code seats).
- Expand civil registration codes to the full HAK set; keep crow-fly distances only.
- Ship shared `LearningShell` with flashcards, solo quiz, encyclopedia, and pass & play multiplayer.

## Prerequisites

- Spec: `docs/superpowers/specs/2026-08-21-learning-shell-flags-ux-design.md`
- Plan: `docs/superpowers/plans/2026-08-21-learning-shell-flags-ux.md`
- Existing React/Vite PWA, i18next HR/EN, Haversine distance helpers, `RegistrationPlate` UI

## Task Breakdown

- [x] Place types + catalogue loader + validation tests
- [x] Full HAK civil plate-code list (34 codes)
- [x] Official cities expansion (128)
- [x] Thin data adapters (`plates` / `cities` / `places` from catalogue)
- [x] Deck helpers + learning types
- [x] `LearningShell` + flashcards / quiz / encyclopedia
- [x] Per-mode content adapters
- [x] Fact enrichment for catalogue places
- [x] Multiplayer pass & play (session-only scoring)
- [x] Polish: process log, README note, i18n/offline check, full verify

## Process Notes

- [2026-08-21] Distance quiz hints: kid-friendly explanation of compass directions (N/S/E/W on the map) via Pomoć; tip under direction prompts; educational hints for distance/closer too.

- Catalogue is the single source of truth; mode UIs consume adapters, not parallel lists.
- Plates stay civil area codes only (no HV / police / diplomatic).
- Distances remain Haversine crow-fly; no road routing APIs.
- Solo quiz + flashcards write progress via `recordAnswer`; multiplayer does not.
- Style preference (Kartice / Kviz / Enciklopedija) remembered per mode in `localStorage`.
- Offline banner re-wired in Task 14 (component existed; shell mount + styles had been lost).

## Decisions

- **Architecture:** Shared `LearningShell` over four modes (not a single topics menu).
  Rationale: preserves existing mode identity while unifying UX.
- **Coverage:** Official RH cities **and** all civil plate-code localities (A+C).
  Rationale: plates and places stay consistent; one row per place.
- **Plate codes:** 34 HAK civil codes (not county seats only).
  Rationale: matches official civil registration practice for the quiz.
- **Progress:** multiplayer is session score only.
  Rationale: pass & play on one device should not pollute long-term progress.
- **Languages:** HR/EN only for this workstream.
  Rationale: matches current app; DE/IT/ES deferred.

## Verification

- Data: **34** civil plate codes (`content/hr/plate-codes.json`); **128** catalogue places / official cities (`content/hr/places-catalogue.json`).
- i18n: HR/EN key parity checked (151 keys each); `learning.*` and `pwa.offline` present; no missing keys between locales.
- Offline: `OfflineBanner` remounted in `App.tsx` with token-based `.offline-banner` styles; shell uses flex so the optional banner does not break layout.
- Commands (Task 14, 2026-08-21):
  - `npm test` → **PASS** (14 files, 63 tests)
  - `npm run build` → **PASS** (`tsc -b` + Vite production build)
  - `npm run lint` → **PASS** (exit 0; existing oxlint warning in `distanceAdapter.tsx` about Fast Refresh exports)

## Result

- Success. Process log, README note on Kartice/Kviz/Enciklopedija, offline banner restore, and full verify completed. No git commit (per brief).

## Future Considerations

- DE/IT/ES locale parity with Learn-the-flags
- Road distances (out of scope by design)
- Photorealistic plate photos (illustration remains)
- Europe / world packs beyond the Croatia offline pack
- Optionally silence or refactor the `distanceAdapter` Fast Refresh lint warning
