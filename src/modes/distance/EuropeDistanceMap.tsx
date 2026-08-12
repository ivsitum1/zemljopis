import type { MapPoint } from './mapTypes'

/**
 * Phase 2 placeholder: Europe outline + city dots.
 * Do not mount until Europe GeoJSON and city dataset exist.
 */
export type EuropeDistanceMapProps = {
  home: MapPoint
  target: MapPoint
  secondary?: MapPoint
  ariaLabel: string
}

export function EuropeDistanceMap(_props: EuropeDistanceMapProps) {
  return null
}
