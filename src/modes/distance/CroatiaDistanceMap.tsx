import { useMemo } from 'react'
import countiesGeo from '../../data/geo/counties.json'
import { computeBBox, ringToPath, type LonLat } from '../../geo/project'
import type { MapPoint } from './mapTypes'
import { projectLonLat } from './projectOnMap'

type CountyFeature = {
  type: 'Feature'
  properties: { id: string }
  geometry: { type: 'Polygon'; coordinates: LonLat[][] }
}

const featureCollection = countiesGeo as unknown as {
  type: 'FeatureCollection'
  features: CountyFeature[]
}

export type CroatiaDistanceMapProps = {
  width?: number
  height?: number
  home: MapPoint
  target: MapPoint
  secondary?: MapPoint
  ariaLabel: string
}

export function CroatiaDistanceMap({
  width = 640,
  height = 420,
  home,
  target,
  secondary,
  ariaLabel,
}: CroatiaDistanceMapProps) {
  const bbox = useMemo(() => computeBBox(featureCollection.features), [])
  const paths = useMemo(
    () =>
      featureCollection.features.map((feature) => ({
        id: feature.properties.id,
        d: ringToPath(feature.geometry.coordinates[0], bbox, width, height),
      })),
    [bbox, height, width],
  )

  const homePt = projectLonLat(home.lat, home.lon, bbox, width, height)
  const targetPt = projectLonLat(target.lat, target.lon, bbox, width, height)
  const secondaryPt = secondary
    ? projectLonLat(secondary.lat, secondary.lon, bbox, width, height)
    : null

  return (
    <svg
      className="croatia-distance-map"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
    >
      {paths.map((path) => (
        <path key={path.id} d={path.d} className="county readonly" />
      ))}
      <line
        x1={homePt.x}
        y1={homePt.y}
        x2={targetPt.x}
        y2={targetPt.y}
        className="route-line"
      />
      {secondaryPt ? (
        <line
          x1={homePt.x}
          y1={homePt.y}
          x2={secondaryPt.x}
          y2={secondaryPt.y}
          className="route-line secondary"
        />
      ) : null}
      <circle cx={homePt.x} cy={homePt.y} r={7} className="route-home" />
      <circle cx={targetPt.x} cy={targetPt.y} r={7} className="route-target" />
      {secondaryPt ? (
        <circle
          cx={secondaryPt.x}
          cy={secondaryPt.y}
          r={7}
          className="route-target secondary"
        />
      ) : null}
    </svg>
  )
}
