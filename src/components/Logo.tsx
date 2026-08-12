/*
 * Obzor mark: the horizon line, with the north star above it.
 *
 * Deliberately two colours and no gradients or filters, because the same
 * geometry has to stay legible at 16px in a browser tab.
 */

type LogoProps = {
  /** 'mark' is the star and horizon alone; 'lockup' adds the wordmark. */
  variant?: 'mark' | 'lockup'
  /** Rendered size of the mark in pixels. The wordmark scales with it. */
  size?: number
  /** Accessible name. Omit inside a control that already has its own label. */
  title?: string
}

export function Logo({ variant = 'lockup', size = 28, title }: LogoProps) {
  const mark = (
    <svg
      className="logo-mark"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path
        className="logo-star"
        d="M24 4 L27 15 L38 18 L27 21 L24 32 L21 21 L10 18 L21 15 Z"
      />
      <path className="logo-horizon" d="M5 37 Q24 27 43 37" fill="none" />
      <path className="logo-horizon logo-horizon-far" d="M5 43 Q24 34 43 43" fill="none" />
    </svg>
  )

  if (variant === 'mark') {
    return mark
  }

  return (
    <span className="logo-lockup">
      {mark}
      <span className="logo-word">Obzor</span>
    </span>
  )
}
