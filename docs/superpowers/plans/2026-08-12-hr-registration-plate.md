# HR Registration Plate UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show realistic simulated Croatian civil registration plates in Plates mode (prompt + choices), with mixed serial formats, without changing scoring.

**Architecture:** Pure `simulateHrSerial()` helper + presentational `RegistrationPlate` (CSS/SVG). `PlatesMode` owns per-round serial state and passes `code` + `serial` into the component.

**Tech Stack:** React 19, TypeScript, Vitest, existing `App.css`

## Global Constraints

- Civil HR plates only (no police/diplomatic/military)
- Serial shapes: `NNN-L` | `NNN-LL` | `NNNN-L` | `NNNN-LL`
- Forbidden serial letters: Q, W, X, Y
- Scoring uses only `PlateEntry.code`
- `country` prop defaults to `'hr'`; no other countries in this plan
- No FE-Font webfont; use existing CSS fonts
- Do not commit unless the user asks

---

## File map

| File | Role |
|------|------|
| `src/lib/hrPlateSerial.ts` | `simulateHrSerial(rng?)` |
| `src/lib/hrPlateSerial.test.ts` | Format / letter tests |
| `src/components/RegistrationPlate.tsx` | HR plate UI |
| `src/App.css` | `.reg-plate*` styles; retire `.plate-badge` usage |
| `src/modes/plates/PlatesMode.tsx` | Wire plates + serial state |

---

### Task 1: `simulateHrSerial` (TDD)

**Files:**
- Create: `src/lib/hrPlateSerial.ts`
- Test: `src/lib/hrPlateSerial.test.ts`

**Interfaces:**
- Produces: `simulateHrSerial(rng?: () => number): string`
- `rng` returns `[0, 1)` like `Math.random`; default `Math.random`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from 'vitest'
import { simulateHrSerial } from './hrPlateSerial'

const SERIAL_RE = /^\d{3,4}-[A-Z]{1,2}$/
const FORBIDDEN = /[QWXY]/

describe('simulateHrSerial', () => {
  it('matches HR serial shape', () => {
    for (let i = 0; i < 50; i += 1) {
      const s = simulateHrSerial()
      expect(s).toMatch(SERIAL_RE)
      expect(s).not.toMatch(FORBIDDEN)
    }
  })

  it('can produce each of the four length patterns via controlled rng', () => {
    // digitCount index 0→3, letterCount index 0→1 via first two rng calls
    const patterns = [
      { digits: 3, letters: 1, seq: [0.0, 0.0] },
      { digits: 3, letters: 2, seq: [0.0, 0.9] },
      { digits: 4, letters: 1, seq: [0.9, 0.0] },
      { digits: 4, letters: 2, seq: [0.9, 0.9] },
    ]
    for (const p of patterns) {
      let i = 0
      const rng = () => {
        if (i < p.seq.length) return p.seq[i++]!
        return 0.1 // rest: digits/letters pick low indices
      }
      const s = simulateHrSerial(rng)
      const [num, lettrs] = s.split('-') as [string, string]
      expect(num).toHaveLength(p.digits)
      expect(lettrs).toHaveLength(p.letters)
    }
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npm test -- src/lib/hrPlateSerial.test.ts`  
Expected: fail (module missing)

- [ ] **Step 3: Implement**

```ts
const LETTERS = 'ABCDEFGHIJKLMNOPRSTUVZ' // A–Z without Q W X Y (and without unused Croatian digraph issues)

export function simulateHrSerial(rng: () => number = Math.random): string {
  const digitCount = rng() < 0.5 ? 3 : 4
  const letterCount = rng() < 0.5 ? 1 : 2
  let digits = ''
  for (let i = 0; i < digitCount; i += 1) {
    digits += Math.floor(rng() * 10).toString()
  }
  let letters = ''
  for (let i = 0; i < letterCount; i += 1) {
    letters += LETTERS[Math.floor(rng() * LETTERS.length)]!
  }
  return `${digits}-${letters}`
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `npm test -- src/lib/hrPlateSerial.test.ts`

---

### Task 2: `RegistrationPlate` component + CSS

**Files:**
- Create: `src/components/RegistrationPlate.tsx`
- Modify: `src/App.css` (add `.reg-plate*` after `.plate-badge` block; keep old class unused or remove if unused)

**Interfaces:**
- Consumes: none from Task 1 at render time (serial passed in)
- Produces: `RegistrationPlate({ code, serial, size?, country? })`

- [ ] **Step 1: Add component**

```tsx
type RegistrationPlateProps = {
  code: string
  serial: string
  size?: 'lg' | 'sm'
  country?: 'hr'
}

export function RegistrationPlate({
  code,
  serial,
  size = 'lg',
  country = 'hr',
}: RegistrationPlateProps) {
  if (country !== 'hr') {
    // Exhaustive guard for future countries
    const _exhaustive: never = country
    return _exhaustive
  }
  return (
    <div className={`reg-plate reg-plate--${size}`} aria-hidden="true">
      <div className="reg-plate__eu">
        <svg className="reg-plate__stars" viewBox="0 0 40 40" aria-hidden>
          {/* simplified 12-star ring: small circles or star paths */}
        </svg>
        <span className="reg-plate__cc">HR</span>
      </div>
      <span className="reg-plate__code">{code}</span>
      <svg className="reg-plate__arms" viewBox="0 0 20 24" aria-hidden>
        {/* 5×5 chequer red/white starting white top-left per Croatian arms convention:
            actually Croatian šahovnica starts with red in upper-left — use red first */}
      </svg>
      <span className="reg-plate__serial">{serial}</span>
    </div>
  )
}
```

Implement chequer as 5×5 rects: row-major, cell `(r+c)%2===0` → `#c8102e`, else `#fff`. EU band: blue `#003399`, yellow dots for stars, white `HR`.

- [ ] **Step 2: Add CSS** (approx. 520∶110 aspect; `lg` max-width ~320–400px; `sm` ~100% of choice width, smaller type)

- [ ] **Step 3: Typecheck**

Run: `npx tsc -b --pretty false`  
Expected: no errors from new files

---

### Task 3: Wire `PlatesMode`

**Files:**
- Modify: `src/modes/plates/PlatesMode.tsx`
- Modify: `src/App.css` (remove dead `.plate-badge` if unused)

**Interfaces:**
- Consumes: `RegistrationPlate`, `simulateHrSerial`

- [ ] **Step 1: State for serials**

On each `startRound`, after picking target/choices:

```ts
const nextTarget = pickPlate(...)
const nextChoices = buildChoices(...)
setTargetSerial(simulateHrSerial())
setChoiceSerials(
  Object.fromEntries(nextChoices.map((p) => [p.code, simulateHrSerial()])),
)
```

- [ ] **Step 2: Render**

- `codeToPlace`: replace `.plate-badge` with  
  `<RegistrationPlate code={target.code} serial={targetSerial} size="lg" />`
- `placeToCode` choices: render  
  `<RegistrationPlate code={plate.code} serial={choiceSerials[plate.code] ?? '000-A'} size="sm" />`  
  and set `aria-label={plate.code}` (or city+code) on the button

- [ ] **Step 3: Run full test suite + lint**

Run: `npm test` and `npm run lint`  
Expected: all pass

---

## Spec coverage

| Spec item | Task |
|-----------|------|
| Mixed serial formats | 1 |
| Forbidden letters | 1 |
| RegistrationPlate lg/sm | 2 |
| EU band + arms SVG | 2 |
| Prompt + choices wiring | 3 |
| Stable serials per round | 3 |
| Scoring unchanged | 3 (no score logic edits) |
| country='hr' only | 2 |
| Unit tests | 1 |

## Self-review

- No TBD placeholders
- Types consistent: `simulateHrSerial(rng?: () => number): string`
- Croatia chequer: red in upper-left (standard HR arms)
