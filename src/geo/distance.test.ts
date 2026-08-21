import { describe, expect, it } from 'vitest'
import {
  bandForDistance,
  bearingDegrees,
  COMPASS8_ALL,
  directionChoices4,
  distanceBandsForLevel,
  haversineKm,
  interpolateGeodesic,
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

  it('exposes all eight compass directions in order', () => {
    expect(COMPASS8_ALL).toEqual(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'])
  })

  it('maps Zagreb→Split to south on the 8-way compass', () => {
    const bearing = bearingDegrees(45.815, 15.982, 43.508, 16.44)
    expect(toCompass8(bearing)).toBe('S')
  })

  it('builds four direction choices: neighbours + opposite, in compass order', () => {
    expect(directionChoices4('NE')).toEqual(['N', 'NE', 'E', 'SW'])
    expect(directionChoices4('S')).toEqual(['N', 'SE', 'S', 'SW'])
  })

  it('picks matching distance band', () => {
    const bands = distanceBandsForLevel(2)
    expect(bandForDistance(100, bands).id).toBe('80-200')
    expect(toCompass8(40)).toBe('NE')
  })

  it('interpolates a geodesic with endpoints and in-between samples', () => {
    const zagreb = { lat: 45.815, lon: 15.982 }
    const split = { lat: 43.508, lon: 16.44 }
    const pts = interpolateGeodesic(zagreb.lat, zagreb.lon, split.lat, split.lon, 8)
    expect(pts).toHaveLength(9)
    expect(pts[0]).toEqual(zagreb)
    expect(pts[8]).toEqual(split)
    for (const point of pts.slice(1, -1)) {
      expect(point.lat).toBeLessThan(zagreb.lat)
      expect(point.lat).toBeGreaterThan(split.lat)
      expect(point.lon).toBeGreaterThan(zagreb.lon)
      expect(point.lon).toBeLessThan(split.lon)
    }
  })
})
