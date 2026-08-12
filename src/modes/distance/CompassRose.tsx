import { useTranslation } from 'react-i18next'
import { COMPASS8_ALL, type Compass8 } from '../../geo/distance'

export type CompassRoseProps = {
  emphasized: boolean
  highlight?: Compass8 | null
  bearingDegrees?: number | null
  ariaLabel: string
}

const SIZE = 160
const CX = SIZE / 2
const CY = SIZE / 2
const LABEL_R = 58
const RING_R = 48

function labelPosition(dir: Compass8): { x: number; y: number } {
  const index = COMPASS8_ALL.indexOf(dir)
  const angle = ((index * 45 - 90) * Math.PI) / 180
  return {
    x: CX + Math.cos(angle) * LABEL_R,
    y: CY + Math.sin(angle) * LABEL_R,
  }
}

export function CompassRose({
  emphasized,
  highlight = null,
  bearingDegrees = null,
  ariaLabel,
}: CompassRoseProps) {
  const { t } = useTranslation()
  const className = `compass-rose ${emphasized ? 'emphasized' : 'subdued'}`

  return (
    <svg
      className={className}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={ariaLabel}
      width={SIZE}
      height={SIZE}
    >
      <circle cx={CX} cy={CY} r={RING_R} className="compass-ring" />
      {COMPASS8_ALL.map((dir) => {
        const { x, y } = labelPosition(dir)
        const isHi = highlight === dir
        return (
          <text
            key={dir}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className={isHi ? 'compass-label highlight' : 'compass-label'}
          >
            {t(`distance.dirsShort.${dir}`)}
          </text>
        )
      })}
      {bearingDegrees != null ? (
        <line
          x1={CX}
          y1={CY}
          x2={CX}
          y2={CY - RING_R + 6}
          className="compass-needle"
          transform={`rotate(${bearingDegrees} ${CX} ${CY})`}
        />
      ) : (
        <circle cx={CX} cy={CY} r={3} className="compass-hub" />
      )}
    </svg>
  )
}
