import { useMemo } from 'react'
import countiesGeo from '../../data/geo/counties.json'
import { computeBBox, ringToPath, type LonLat } from '../../geo/project'
import { projectLonLat } from '../distance/projectOnMap'

type CountyFeature = {
  type: 'Feature'
  properties: { id: string }
  geometry: { type: 'Polygon'; coordinates: LonLat[][] }
}

const featureCollection = countiesGeo as unknown as {
  type: 'FeatureCollection'
  features: CountyFeature[]
}

export type PlaceLocationMapProps = {
  width?: number
  height?: number
  lat: number
  lon: number
  countyId: string
  ariaLabel: string
}

export function PlaceLocationMap({
  width = 640,
  height = 360,
  lat,
  lon,
  countyId,
  ariaLabel,
}: PlaceLocationMapProps) {
  const bbox = useMemo(() => computeBBox(featureCollection.features), [])
  const paths = useMemo(
    () =>
      featureCollection.features.map((feature) => ({
        id: feature.properties.id,
        d: ringToPath(feature.geometry.coordinates[0], bbox, width, height),
      })),
    [bbox, height, width],
  )

  const point = projectLonLat(lat, lon, bbox, width, height)

  return (
    <svg
      className="place-location-map"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
    >
      {paths.map((path) => {
        const isCounty = path.id === countyId
        return (
          <path
            key={path.id}
            d={path.d}
            className={isCounty ? 'county readonly highlight' : 'county readonly'}
          />
        )
      })}
      <circle cx={point.x} cy={point.y} r={7} className="place-map-marker" />
    </svg>
  )
}
