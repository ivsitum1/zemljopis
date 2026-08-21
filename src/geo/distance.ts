const EARTH_RADIUS_KM = 6371

export type Compass8 = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'
export const COMPASS8_ALL: readonly Compass8[] = [
  'N',
  'NE',
  'E',
  'SE',
  'S',
  'SW',
  'W',
  'NW',
]
export type Compass4 = 'N' | 'E' | 'S' | 'W'

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)))
}

/** Initial bearing from point 1 to point 2, degrees 0–360 (0 = north). */
export function bearingDegrees(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const φ1 = toRad(lat1)
  const φ2 = toRad(lat2)
  const Δλ = toRad(lon2 - lon1)
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  const θ = Math.atan2(y, x)
  return ((θ * 180) / Math.PI + 360) % 360
}

export function toCompass8(bearing: number): Compass8 {
  const index = Math.round(bearing / 45) % 8
  return COMPASS8_ALL[index]!
}

export type GeoPoint = { lat: number; lon: number }

/**
 * Sample a spherical geodesic from (lat1, lon1) to (lat2, lon2).
 * Returns `segments + 1` points, including the exact endpoints.
 */
export function interpolateGeodesic(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  segments = 16,
): GeoPoint[] {
  const n = Math.max(1, Math.floor(segments))
  const points: GeoPoint[] = []
  for (let i = 0; i <= n; i += 1) {
    const fraction = i / n
    if (fraction <= 0) {
      points.push({ lat: lat1, lon: lon1 })
    } else if (fraction >= 1) {
      points.push({ lat: lat2, lon: lon2 })
    } else {
      points.push(intermediatePoint(lat1, lon1, lat2, lon2, fraction))
    }
  }
  return points
}

function intermediatePoint(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  fraction: number,
): GeoPoint {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const toDeg = (rad: number) => (rad * 180) / Math.PI
  const φ1 = toRad(lat1)
  const λ1 = toRad(lon1)
  const φ2 = toRad(lat2)
  const λ2 = toRad(lon2)
  const d =
    2 *
    Math.asin(
      Math.min(
        1,
        Math.sqrt(
          Math.sin((φ2 - φ1) / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2,
        ),
      ),
    )
  if (d < 1e-12) {
    return { lat: lat1, lon: lon1 }
  }
  const a = Math.sin((1 - fraction) * d) / Math.sin(d)
  const b = Math.sin(fraction * d) / Math.sin(d)
  const x = a * Math.cos(φ1) * Math.cos(λ1) + b * Math.cos(φ2) * Math.cos(λ2)
  const y = a * Math.cos(φ1) * Math.sin(λ1) + b * Math.cos(φ2) * Math.sin(λ2)
  const z = a * Math.sin(φ1) + b * Math.sin(φ2)
  return {
    lat: toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))),
    lon: toDeg(Math.atan2(y, x)),
  }
}

/**
 * Four direction choices for a quiz: correct, both neighbours, and opposite.
 * Returned in clockwise compass order (N → NW), not shuffled.
 */
export function directionChoices4(correct: Compass8): Compass8[] {
  const index = COMPASS8_ALL.indexOf(correct)
  const picked = new Set<Compass8>([
    correct,
    COMPASS8_ALL[(index + 7) % 8]!,
    COMPASS8_ALL[(index + 1) % 8]!,
    COMPASS8_ALL[(index + 4) % 8]!,
  ])
  return COMPASS8_ALL.filter((dir) => picked.has(dir))
}

export function toCompass4(bearing: number): Compass4 {
  const directions: Compass4[] = ['N', 'E', 'S', 'W']
  const index = Math.round(bearing / 90) % 4
  return directions[index]!
}

export type DistanceBand = {
  id: string
  minKm: number
  maxKm: number
  label: { hr: string; en: string }
}

export function distanceBandsForLevel(level: number): DistanceBand[] {
  if (level <= 2) {
    return [
      { id: '0-80', minKm: 0, maxKm: 80, label: { hr: 'do 80 km', en: 'up to 80 km' } },
      { id: '80-200', minKm: 80, maxKm: 200, label: { hr: '80–200 km', en: '80–200 km' } },
      { id: '200-350', minKm: 200, maxKm: 350, label: { hr: '200–350 km', en: '200–350 km' } },
      { id: '350+', minKm: 350, maxKm: Infinity, label: { hr: 'više od 350 km', en: 'over 350 km' } },
    ]
  }
  if (level === 3) {
    return [
      { id: '0-50', minKm: 0, maxKm: 50, label: { hr: 'do 50 km', en: 'up to 50 km' } },
      { id: '50-120', minKm: 50, maxKm: 120, label: { hr: '50–120 km', en: '50–120 km' } },
      { id: '120-220', minKm: 120, maxKm: 220, label: { hr: '120–220 km', en: '120–220 km' } },
      { id: '220-350', minKm: 220, maxKm: 350, label: { hr: '220–350 km', en: '220–350 km' } },
      { id: '350+', minKm: 350, maxKm: Infinity, label: { hr: 'više od 350 km', en: 'over 350 km' } },
    ]
  }
  return [
    { id: '0-40', minKm: 0, maxKm: 40, label: { hr: 'do 40 km', en: 'up to 40 km' } },
    { id: '40-100', minKm: 40, maxKm: 100, label: { hr: '40–100 km', en: '40–100 km' } },
    { id: '100-180', minKm: 100, maxKm: 180, label: { hr: '100–180 km', en: '100–180 km' } },
    { id: '180-280', minKm: 180, maxKm: 280, label: { hr: '180–280 km', en: '180–280 km' } },
    { id: '280-400', minKm: 280, maxKm: 400, label: { hr: '280–400 km', en: '280–400 km' } },
    { id: '400+', minKm: 400, maxKm: Infinity, label: { hr: 'više od 400 km', en: 'over 400 km' } },
  ]
}

export function bandForDistance(km: number, bands: DistanceBand[]): DistanceBand {
  return bands.find((band) => km >= band.minKm && km < band.maxKm) ?? bands[bands.length - 1]!
}
