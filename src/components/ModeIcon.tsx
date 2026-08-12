import type { AppMode } from './HomeScreen'

/*
 * One icon per practice mode, drawn on a shared 32x32 grid at a single stroke
 * weight so the four read as a set on the home screen.
 */

type ModeIconProps = {
  mode: AppMode
  size?: number
}

export function ModeIcon({ mode, size = 32 }: ModeIconProps) {
  return (
    <svg
      className="mode-icon"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[mode]}
    </svg>
  )
}

const ICONS: Record<AppMode, React.ReactNode> = {
  // folded map
  map: (
    <>
      <path d="M4 8l8-3 8 3 8-3v19l-8 3-8-3-8 3z" />
      <path d="M12 5v19M20 8v19" />
    </>
  ),
  // licence plate with the EU band on the left
  plates: (
    <>
      <rect x="3" y="9" width="26" height="14" rx="2" />
      <path d="M10 9v14" />
      <path d="M15 14h9M15 18h6" />
    </>
  ),
  // map pin
  places: (
    <>
      <path d="M16 29s10-9.4 10-16A10 10 0 006 13c0 6.6 10 16 10 16z" />
      <circle cx="16" cy="13" r="3.4" />
    </>
  ),
  // route between two points
  distance: (
    <>
      <circle cx="7" cy="24" r="3.2" className="mode-icon-solid" />
      <circle cx="25" cy="8" r="3.2" />
      <path d="M10 21.5C15 18 17 14 22 10.5" strokeDasharray="2.5 3.5" />
    </>
  ),
}
