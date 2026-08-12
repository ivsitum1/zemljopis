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
    const patterns = [
      { digits: 3, letters: 1, seq: [0.0, 0.0] },
      { digits: 3, letters: 2, seq: [0.0, 0.9] },
      { digits: 4, letters: 1, seq: [0.9, 0.0] },
      { digits: 4, letters: 2, seq: [0.9, 0.9] },
    ]
    for (const p of patterns) {
      let i = 0
      const rng = () => {
        if (i < p.seq.length) {
          return p.seq[i++]!
        }
        return 0.1
      }
      const s = simulateHrSerial(rng)
      const [num, lettrs] = s.split('-') as [string, string]
      expect(num).toHaveLength(p.digits)
      expect(lettrs).toHaveLength(p.letters)
    }
  })
})
