/*
 * Sjeverko: the compass needle that guides the quizzes.
 *
 * Never appears in the wordmark, so the brand can stay grown-up while the app
 * itself stays warm. Only the north half of the needle is drawn, which leaves
 * the lower half of the housing free for the face.
 */

type SjeverkoProps = {
  size?: number
  /** Face shown after an answer. 'idle' is the neutral resting expression. */
  mood?: 'idle' | 'happy' | 'thinking'
  title?: string
}

export function Sjeverko({ size = 48, mood = 'idle', title }: SjeverkoProps) {
  return (
    <svg
      className={`sjeverko sjeverko-${mood}`}
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <circle className="sjeverko-housing" cx="32" cy="32" r="27" fill="none" />
      <path className="sjeverko-needle" d="M32 8 L39 32 L32 28 L25 32 Z" />
      <circle className="sjeverko-eye" cx="26" cy="40" r="2.8" />
      <circle className="sjeverko-eye" cx="38" cy="40" r="2.8" />
      <path
        className="sjeverko-mouth"
        fill="none"
        d={
          mood === 'happy'
            ? 'M26 46 Q32 53 38 46'
            : mood === 'thinking'
              ? 'M27.5 48 L36.5 48'
              : 'M27.5 47 Q32 51.5 36.5 47'
        }
      />
    </svg>
  )
}
