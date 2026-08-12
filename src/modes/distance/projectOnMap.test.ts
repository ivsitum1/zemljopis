import { describe, expect, it } from 'vitest'
import countiesGeo from '../../data/geo/counties.json'
import { computeBBox, type LonLat } from '../../geo/project'
import { projectLonLat } from './projectOnMap'

const features = (
  countiesGeo as unknown as {
    features: Array<{ geometry: { coordinates: LonLat[][] } }>
  }
).features

describe('projectLonLat', () => {
  it('places Zagreb inside the Croatia viewBox', () => {
    const width = 640
    const height = 420
    const bbox = computeBBox(features)
    const { x, y } = projectLonLat(45.815, 15.982, bbox, width, height)
    expect(x).toBeGreaterThan(0)
    expect(x).toBeLessThan(width)
    expect(y).toBeGreaterThan(0)
    expect(y).toBeLessThan(height)
  })
})
