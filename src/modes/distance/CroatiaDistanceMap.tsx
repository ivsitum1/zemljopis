import { useMemo } from 'react'
import countiesGeo from '../../data/geo/counties.json'
import { interpolateGeodesic } from '../../geo/distance'
import { computeBBox, ringToPath, type BBox, type LonLat } from '../../geo/project'
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

function geodesicRoutePath(
  from: MapPoint,
  to: MapPoint,
  bbox: BBox,
  width: number,
  height: number,
): string {
  return interpolateGeodesic(from.lat, from.lon, to.lat, to.lon, 24)
    .map((point, index) => {
      const { x, y } = projectLonLat(point.lat, point.lon, bbox, width, height)
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

function countyClassName(
  id: string,
  homeCountyId?: string,
  targetCountyId?: string,
  secondaryCountyId?: string,
): string {
  let className = 'county readonly'
  if (id === homeCountyId) className += ' home'
  if (id === targetCountyId) className += ' target-county'
  if (id === secondaryCountyId) className += ' secondary-county'
  return className
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
  const homeRoute = geodesicRoutePath(home, target, bbox, width, height)
  const secondaryRoute = secondary
    ? geodesicRoutePath(home, secondary, bbox, width, height)
    : null

  return (
    <svg
      className="croatia-distance-map"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
    >
      {paths.map((path) => (
        <path
          key={path.id}
          d={path.d}
          className={countyClassName(
            path.id,
            home.countyId,
            target.countyId,
            secondary?.countyId,
          )}
        />
      ))}
      <path d={homeRoute} className="route-line" />
      {secondaryRoute ? <path d={secondaryRoute} className="route-line secondary" /> : null}
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
