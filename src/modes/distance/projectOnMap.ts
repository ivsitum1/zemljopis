import { projectEquirectangular, type BBox } from '../../geo/project'

export function projectLonLat(
  lat: number,
  lon: number,
  bbox: BBox,
  width: number,
  height: number,
  padding = 12,
): { x: number; y: number } {
  return projectEquirectangular(lon, lat, bbox, width, height, padding)
}
