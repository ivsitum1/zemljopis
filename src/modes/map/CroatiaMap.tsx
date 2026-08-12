import { useMemo } from 'react'
import countiesGeo from '../../data/geo/counties.json'
import { COUNTIES, getCountyById } from '../../data/counties'
import { computeBBox, ringToPath, type LonLat } from '../../geo/project'

type CountyFeature = {
  type: 'Feature'
  properties: { id: string; name: string; name_en: string }
  geometry: { type: 'Polygon'; coordinates: LonLat[][] }
}

type CroatiaMapProps = {
  width?: number
  height?: number
  selectedId?: string | null
  highlightId?: string | null
  correctId?: string | null
  wrongId?: string | null
  showLabels?: boolean
  language: 'hr' | 'en'
  onSelect: (countyId: string) => void
  disabled?: boolean
}

const featureCollection = countiesGeo as unknown as {
  type: 'FeatureCollection'
  features: CountyFeature[]
}

export function CroatiaMap({
  width = 640,
  height = 420,
  selectedId = null,
  highlightId = null,
  correctId = null,
  wrongId = null,
  showLabels = false,
  language,
  onSelect,
  disabled = false,
}: CroatiaMapProps) {
  const bbox = useMemo(() => computeBBox(featureCollection.features), [])
  const paths = useMemo(
    () =>
      featureCollection.features.map((feature) => {
        const ring = feature.geometry.coordinates[0]
        return {
          id: feature.properties.id,
          d: ringToPath(ring, bbox, width, height),
          labelPoint: ringCentroid(ring, bbox, width, height),
        }
      }),
    [bbox, height, width],
  )

  return (
    <svg
      className="croatia-map"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Karta Hrvatske"
    >
      {paths.map((path) => {
        const county = getCountyById(path.id)
        const isTarget = highlightId === path.id
        const isCorrect = correctId === path.id
        const isWrong = wrongId === path.id
        const isSelected = selectedId === path.id
        let className = 'county'
        if (isTarget) className += ' target'
        if (isCorrect) className += ' correct'
        if (isWrong) className += ' wrong'
        if (isSelected) className += ' selected'

        const label = county ? county.name[language] : path.id

        function choose(): void {
          if (!disabled) {
            onSelect(path.id)
          }
        }

        // A bare <path onClick> is unreachable without a pointer, which left
        // the whole map mode unusable by keyboard. Giving each county a role
        // and a tab stop makes it behave like the button it already was.
        return (
          <path
            key={path.id}
            d={path.d}
            className={className}
            role="button"
            aria-label={label}
            aria-disabled={disabled || undefined}
            tabIndex={disabled ? -1 : 0}
            onClick={choose}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                choose()
              }
            }}
          >
            <title>{label}</title>
          </path>
        )
      })}

      {showLabels
        ? paths.map((path) => {
            const county = COUNTIES.find((item) => item.id === path.id)
            if (!county) {
              return null
            }
            return (
              <text
                key={`label-${path.id}`}
                x={path.labelPoint.x}
                y={path.labelPoint.y}
                className="county-label"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {county.name[language].split('-')[0]?.slice(0, 8)}
              </text>
            )
          })
        : null}
    </svg>
  )
}

function ringCentroid(
  ring: LonLat[],
  bbox: ReturnType<typeof computeBBox>,
  width: number,
  height: number,
): { x: number; y: number } {
  let sumLon = 0
  let sumLat = 0
  const n = Math.max(ring.length - 1, 1)
  for (let i = 0; i < n; i += 1) {
    sumLon += ring[i]![0]
    sumLat += ring[i]![1]
  }
  const lon = sumLon / n
  const lat = sumLat / n
  const usableW = width - 24
  const usableH = height - 24
  return {
    x: 12 + ((lon - bbox.minLon) / (bbox.maxLon - bbox.minLon)) * usableW,
    y: 12 + ((bbox.maxLat - lat) / (bbox.maxLat - bbox.minLat)) * usableH,
  }
}
