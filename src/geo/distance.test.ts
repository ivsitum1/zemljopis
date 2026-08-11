import { describe, expect, it } from 'vitest'
import {
  bandForDistance,
  bearingDegrees,
  distanceBandsForLevel,
  haversineKm,
  toCompass4,
  toCompass8,
} from '../geo/distance'

describe('distance helpers', () => {
  it('computes Zagreb–Split air distance in a plausible range', () => {
    const km = haversineKm(45.815, 15.982, 43.508, 16.44)
    expect(km).toBeGreaterThan(240)
    expect(km).toBeLessThan(280)
  })

  it('maps Zagreb→Split roughly south', () => {
    const bearing = bearingDegrees(45.815, 15.982, 43.508, 16.44)
    expect(toCompass4(bearing)).toBe('S')
  })

  it('picks matching distance band', () => {
    const bands = distanceBandsForLevel(2)
    expect(bandForDistance(100, bands).id).toBe('80-200')
    expect(toCompass8(40)).toBe('NE')
  })
})
