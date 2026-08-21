import { describe, expect, it } from 'vitest'
import plateCodes from '../../content/hr/plate-codes.json'
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

  it('every plate-codes.json code exists on a place', () => {
    for (const row of plateCodes) {
      const place = getPlaceByPlateCode(row.code)
      expect(place, row.code).toBeTruthy()
      expect(place!.id).toBe(row.placeId)
      expect(place!.plateCode).toBe(row.code)
    }
  })
})
