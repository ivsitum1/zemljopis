# Design: Realistic Croatian registration plate UI (Plates mode)

**Date:** 2026-08-12  
**Status:** Approved for planning (pending user review of this file)  
**Mode:** Tablice (`PlatesMode`)

## Goal

Replace the plain `plate-badge` / bare plate codes with a recognizably realistic Croatian civil registration plate illustration (EU blue band, `HR`, city code, chequered arms, simulated serial). Use the plate in both the question prompt and the answer choices. Keep scoring based only on the regional code. Leave room for future country-specific renderers (SI, RS, DE, AT, …) without building them now.

## Decisions (from brainstorming)

| Topic | Choice |
|-------|--------|
| Where plates appear | Both prompt (`lg`) and answer choices (`sm`) |
| Visual fidelity | Close to real (CSS/SVG), not photorealistic metal |
| Serial simulation | Mixed HR formats: `NNN-L`, `NNN-LL`, `NNNN-L`, `NNNN-LL` |
| Scoring | Unchanged — only `PlateEntry.code` |
| Europe expansion | `country?: 'hr'` now; other countries deferred |
| Font | Existing display / monospace stack — no FE-Font package |

## Format research (constraints for simulation)

Standard Croatian civil plates (since 2016 style with EU band):

- Layout: blue EU strip (`HR`) | two-letter area code | Croatian coat of arms | serial
- Serial: three **or** four digits, hyphen, one **or** two letters
- Letters Q, W, X, Y are not used on standard Croatian plates
- Examples of valid shapes: `ZG 123-A`, `ZG 123-AB`, `ZG 1234-A`, `ZG 1234-AB`

Other countries (deferred; informs architecture only):

- SI / RS: similar “region + crest + serial” family, different serial shapes
- DE / AT: different models (variable district length, seals, different serial layout) — need separate renderers later

## Architecture

### Components

```
PlatesMode
  └─ RegistrationPlate (country='hr', size, code, serial?)
       ├─ EuBand (stars + HR)
       ├─ AreaCode
       ├─ CoatOfArmsSvg (simplified šahovnica)
       └─ Serial (digits-hyphen-letters)
```

- **`RegistrationPlate`:** Presentational. Props: `code: string`, `serial?: string`, `size: 'lg' | 'sm'`, `country?: 'hr'` (default `'hr'`). If `serial` is omitted, the component may call the simulator once only when used in isolation; in `PlatesMode`, serials are always passed from parent state so they stay stable across re-renders.
- **`simulateHrSerial()`:** Pure helper returning a string matching one of the four patterns above, using digits `0–9` and letters excluding Q/W/X/Y (and avoiding Croatian digraph edge cases by using A–Z minus those four; area codes already include Č/Š/Ž where needed — serial letters stay ASCII Latin without diacritics for simplicity, matching common plate letter sets).

### PlatesMode integration

- **`codeToPlace`:** Show one `lg` plate with `target.code` + `targetSerial` above/ beside the prompt; choices remain city/county text (unchanged).
- **`placeToCode`:** Choices render `sm` plates (each choice code + its own serial) instead of bare `.plate-code` text; keep accessible name via `aria-label` including the area code (and city if useful).
- On `startRound`: generate `targetSerial` and a `Record<code, serial>` (or map) for each choice so serials do not reshuffle on re-render or during wrong-answer flash.
- Wrong/correct styling stays on the choice button; the plate itself does not change colour semantics beyond belonging to the styled button.

### Europe (deferred)

- Do not implement SI/RS/DE/AT renderers in this work.
- Keep `country` prop so a later switch can select another layout without rewriting call sites.
- Document only: DE/AT cannot reuse the HR crest+serial template.

## Visual spec

- Approximate aspect ratio **520×110**; black border; white face; black glyphs
- Left: blue EU band with yellow stars circle (simplified) and white `HR`
- After area code: small SVG chequerboard (red/white), not a full multi-shield heraldic drawing
- Serial: monospace / display weight, hyphen between numbers and letters
- `lg`: fits mode panel width; `sm`: fits choice grid cells without wrapping the plate row
- Decorative plate graphics may use `aria-hidden` when the surrounding control already exposes the code

## Game logic

- No change to pools, levels, choice counts, direction flip, or scoring
- Serial is decorative only; never part of the correct-answer check
- Do not persist serials across rounds beyond in-memory state for the current round

## Components and files

| Path | Change |
|------|--------|
| `src/components/RegistrationPlate.tsx` | New — HR plate illustration |
| `src/lib/hrPlateSerial.ts` (or next to component) | New — `simulateHrSerial` + optional type/guards |
| `src/modes/plates/PlatesMode.tsx` | Wire `lg`/`sm` plates; round serial state |
| `src/App.css` | Plate layout styles; retire or replace `.plate-badge` / reduce `.plate-code` reliance |
| `src/lib/hrPlateSerial.test.ts` (or colocated test) | Unit tests for serial shapes and forbidden letters |
| i18n | Only if new a11y strings are needed; prefer composing from existing code/city |

## Testing

- Unit: `simulateHrSerial` samples match `/^\d{3,4}-[A-Z]{1,2}$/`, length combinations cover all four shapes over repeated draws (statistical or forced RNG injection if the helper accepts a random source), never contains Q/W/X/Y
- Manual / smoke: both directions show plates; wrong answer does not reshuffle serials mid-round; correct advance gets new serials
- Existing plates quiz behaviour remains (same pools and scoring)

## Out of scope

- Photorealistic metal, emboss screws, FE-Font webfont
- Police, military, diplomatic, temporary, personalized plates
- SI / RS / DE / AT layouts
- Changing which cities/codes are in `PLATES`

## Success criteria

1. In `codeToPlace`, the learner sees a full simulated HR plate with the real area code and a plausible serial.
2. In `placeToCode`, each choice shows a smaller full plate for that code.
3. Scoring and level pools behave as before.
4. Serials stay stable within a round and vary across rounds / choices.
5. Helper is covered by unit tests for format rules.

## Open points resolved

- Fidelity: approach “close to real” without metal effects — resolved in brainstorming.
- Serial: mixed four HR shapes — resolved.
- Placement: both prompt and choices — resolved.
