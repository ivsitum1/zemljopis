export type LonLat = [number, number]

export type BBox = {
  minLon: number
  minLat: number
  maxLon: number
  maxLat: number
}

export function projectEquirectangular(
  lon: number,
  lat: number,
  bbox: BBox,
  width: number,
  height: number,
  padding = 12,
): { x: number; y: number } {
  const usableW = width - padding * 2
  const usableH = height - padding * 2
  const x = padding + ((lon - bbox.minLon) / (bbox.maxLon - bbox.minLon)) * usableW
  const y = padding + ((bbox.maxLat - lat) / (bbox.maxLat - bbox.minLat)) * usableH
  return { x, y }
}

export function ringToPath(
  ring: LonLat[],
  bbox: BBox,
  width: number,
  height: number,
): string {
  return ring
    .map((point, index) => {
      const [lon, lat] = point
      const { x, y } = projectEquirectangular(lon, lat, bbox, width, height)
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
    .concat(' Z')
}

export function computeBBox(features: Array<{ geometry: { coordinates: LonLat[][] } }>): BBox {
  let minLon = Infinity
  let minLat = Infinity
  let maxLon = -Infinity
  let maxLat = -Infinity

  for (const feature of features) {
    for (const ring of feature.geometry.coordinates) {
      for (const [lon, lat] of ring) {
        minLon = Math.min(minLon, lon)
        minLat = Math.min(minLat, lat)
        maxLon = Math.max(maxLon, lon)
        maxLat = Math.max(maxLat, lat)
      }
    }
  }

  // Slight pad so edges are not clipped.
  const lonPad = (maxLon - minLon) * 0.03
  const latPad = (maxLat - minLat) * 0.03
  return {
    minLon: minLon - lonPad,
    minLat: minLat - latPad,
    maxLon: maxLon + lonPad,
    maxLat: maxLat + latPad,
  }
}
