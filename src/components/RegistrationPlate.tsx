import type { ReactElement } from 'react'

type RegistrationPlateProps = {
  code: string
  serial: string
  size?: 'lg' | 'sm'
  country?: 'hr'
}

function CoatOfArms() {
  const cells: ReactElement[] = []
  const n = 5
  const w = 20
  const h = 24
  const cw = w / n
  const ch = h / n
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) {
      const red = (r + c) % 2 === 0
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={c * cw}
          y={r * ch}
          width={cw}
          height={ch}
          fill={red ? '#c8102e' : '#ffffff'}
        />,
      )
    }
  }
  return (
    <svg className="reg-plate__arms" viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <rect x="0" y="0" width={w} height={h} fill="#ffffff" stroke="#1d2a24" strokeWidth="0.8" />
      {cells}
    </svg>
  )
}

function EuStars() {
  const cx = 20
  const cy = 14
  const r = 9
  const dots: ReactElement[] = []
  for (let i = 0; i < 12; i += 1) {
    const a = (Math.PI * 2 * i) / 12 - Math.PI / 2
    dots.push(<circle key={i} cx={cx + r * Math.cos(a)} cy={cy + r * Math.sin(a)} r="1.35" fill="#fc0" />)
  }
  return (
    <svg className="reg-plate__stars" viewBox="0 0 40 28" aria-hidden>
      {dots}
    </svg>
  )
}

export function RegistrationPlate({
  code,
  serial,
  size = 'lg',
  country = 'hr',
}: RegistrationPlateProps) {
  switch (country) {
    case 'hr':
      return (
        <div className={`reg-plate reg-plate--${size}`} aria-hidden="true">
          <div className="reg-plate__eu">
            <EuStars />
            <span className="reg-plate__cc">HR</span>
          </div>
          <span className="reg-plate__code">{code}</span>
          <CoatOfArms />
          <span className="reg-plate__serial">{serial}</span>
        </div>
      )
    default: {
      const _exhaustive: never = country
      return _exhaustive
    }
  }
}
