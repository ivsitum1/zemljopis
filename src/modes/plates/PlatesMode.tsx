import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getCountyById } from '../../data/counties'
import { PLATES, type PlateEntry } from '../../data/plates'
import type { DifficultyLevel } from '../../types/profile'

type PlatesModeProps = {
  level: DifficultyLevel
  onBack: () => void
}

type Direction = 'codeToPlace' | 'placeToCode'

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

function pickPlate(pool: PlateEntry[], exclude?: string): PlateEntry {
  const candidates = pool.filter((plate) => plate.code !== exclude)
  const list = candidates.length > 0 ? candidates : pool
  return list[Math.floor(Math.random() * list.length)]!
}

function poolForLevel(level: DifficultyLevel): PlateEntry[] {
  if (level <= 1) {
    return PLATES.filter((plate) => ['ZG', 'ST', 'RI', 'OS', 'ZD', 'PU'].includes(plate.code))
  }
  if (level === 2) {
    return PLATES.filter((plate) => !['PŽ', 'VT', 'GS', 'KR'].includes(plate.code))
  }
  return PLATES
}

function choiceCount(level: DifficultyLevel): number {
  if (level <= 1) return 3
  if (level === 2) return 4
  return 6
}

export function PlatesMode({ level, onBack }: PlatesModeProps) {
  const { t, i18n } = useTranslation()
  const language = i18n.language.startsWith('en') ? 'en' : 'hr'
  const pool = useMemo(() => poolForLevel(level), [level])
  const nChoices = choiceCount(level)

  const [direction, setDirection] = useState<Direction>('codeToPlace')
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [target, setTarget] = useState<PlateEntry>(() => pickPlate(pool))
  const [choices, setChoices] = useState<PlateEntry[]>(() => buildChoices(pool, pickPlate(pool), nChoices))
  const [status, setStatus] = useState<'asking' | 'correct' | 'wrong'>('asking')
  const [picked, setPicked] = useState<string | null>(null)

  function startRound(nextDirection: Direction = direction, exclude?: string): void {
    const nextTarget = pickPlate(pool, exclude)
    setTarget(nextTarget)
    setChoices(buildChoices(pool, nextTarget, nChoices))
    setStatus('asking')
    setPicked(null)
    setDirection(nextDirection)
  }

  function handlePick(code: string): void {
    if (status !== 'asking') {
      return
    }

    const isCorrect = code === target.code
    setPicked(code)
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))

    if (isCorrect) {
      setStatus('correct')
      window.setTimeout(() => {
        const flip = level >= 3 && Math.random() > 0.45 ? 'placeToCode' : 'codeToPlace'
        startRound(flip, target.code)
      }, 850)
      return
    }

    setStatus('wrong')
    window.setTimeout(() => {
      setStatus('asking')
      setPicked(null)
    }, 1000)
  }

  const county = getCountyById(target.countyId)
  const prompt =
    direction === 'codeToPlace'
      ? t('plates.promptCode', { code: target.code })
      : t('plates.promptPlace', { place: target.city[language] })

  return (
    <section className="panel mode-panel">
      <div className="mode-toolbar">
        <button type="button" className="ghost" onClick={onBack}>
          ← {t('common.back')}
        </button>
        <p className="score">{t('plates.score', { correct: score.correct, total: score.total })}</p>
      </div>

      <h1>{t('modes.plates.title')}</h1>
      <p className="prompt">{prompt}</p>

      {direction === 'codeToPlace' ? (
        <div className="plate-badge" aria-hidden>
          {target.code}
        </div>
      ) : null}

      {status === 'correct' ? <p className="feedback ok">{t('plates.correct')}</p> : null}
      {status === 'wrong' ? <p className="feedback bad">{t('plates.wrong')}</p> : null}

      <div className="choice-grid">
        {choices.map((plate) => {
          const isPicked = picked === plate.code
          let className = 'choice'
          if (status === 'correct' && plate.code === target.code) className += ' correct'
          if (status === 'wrong' && isPicked) className += ' wrong'
          return (
            <button
              key={plate.code}
              type="button"
              className={className}
              disabled={status === 'correct'}
              onClick={() => handlePick(plate.code)}
            >
              {direction === 'codeToPlace' ? (
                <>
                  <strong>{plate.city[language]}</strong>
                  <span>{getCountyById(plate.countyId)?.name[language]}</span>
                </>
              ) : (
                <strong className="plate-code">{plate.code}</strong>
              )}
            </button>
          )
        })}
      </div>

      {status === 'correct' && county ? (
        <p className="muted hint">
          {t('plates.reveal', {
            code: target.code,
            city: target.city[language],
            county: county.name[language],
          })}
        </p>
      ) : (
        <p className="muted hint">{t('plates.hint')}</p>
      )}
    </section>
  )
}

function buildChoices(pool: PlateEntry[], target: PlateEntry, count: number): PlateEntry[] {
  const others = shuffle(pool.filter((plate) => plate.code !== target.code)).slice(0, Math.max(count - 1, 0))
  return shuffle([target, ...others])
}
