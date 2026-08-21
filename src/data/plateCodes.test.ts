import { describe, expect, it } from 'vitest'
import plateCodes from '../../content/hr/plate-codes.json'
import { getPlaceByPlateCode } from './catalogue'

/**
 * Source: HAK “Popis registarskih oznaka za RH” (34 active civil codes).
 * Brief suggested ≥50; that exceeds the official civil set — do not invent codes.
 * Obsolete PS/SP and military/police/diplomatic codes are excluded.
 */
describe('HR plate codes', () => {
  it('lists the full civil HAK set (34 codes, not county seats only)', () => {
    expect(plateCodes.length).toBe(34)
    expect(plateCodes.length).toBeGreaterThanOrEqual(20)
  })

  it('every code has a catalogue place with matching plateCode', () => {
    for (const row of plateCodes) {
      const place = getPlaceByPlateCode(row.code)
      expect(place, row.code).toBeTruthy()
      expect(place!.id).toBe(row.placeId)
    }
  })
})
