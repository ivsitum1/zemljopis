import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RegistrationPlate } from '../../components/RegistrationPlate'
import { getCountyById } from '../../data/counties'
import { PLATES, type PlateEntry } from '../../data/plates'
import { simulateHrSerial } from '../../lib/hrPlateSerial'
import { pickWeightedId, recordAnswer } from '../../storage/progress'
import type { DifficultyLevel } from '../../types/profile'

type PlatesModeProps = {
  level: DifficultyLevel
  profileName: string
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

function pickPlate(profileName: string, pool: PlateEntry[], exclude?: string): PlateEntry {
  const id = pickWeightedId(
    profileName,
    'plates',
    pool.map((plate) => plate.code),
    exclude,
  )
  return pool.find((plate) => plate.code === id) ?? pool[0]!
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

function serialsForChoices(choices: PlateEntry[]): Record<string, string> {
  return Object.fromEntries(choices.map((plate) => [plate.code, simulateHrSerial()]))
}

function createRound(profileName: string, pool: PlateEntry[], nChoices: number, exclude?: string) {
  const target = pickPlate(profileName, pool, exclude)
  const choices = buildChoices(pool, target, nChoices)
  return {
    target,
    choices,
    targetSerial: simulateHrSerial(),
    choiceSerials: serialsForChoices(choices),
  }
}

export function PlatesMode({ level, profileName, onBack }: PlatesModeProps) {
  const { t, i18n } = useTranslation()
  const language = i18n.language.startsWith('en') ? 'en' : 'hr'
  const pool = useMemo(() => poolForLevel(level), [level])
  const nChoices = choiceCount(level)

  const [direction, setDirection] = useState<Direction>('codeToPlace')
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [round, setRound] = useState(() => createRound(profileName, pool, nChoices))
  const [status, setStatus] = useState<'asking' | 'correct' | 'wrong'>('asking')
  const [picked, setPicked] = useState<string | null>(null)

  const { target, choices, targetSerial, choiceSerials } = round

  function startRound(nextDirection: Direction = direction, exclude?: string): void {
    setRound(createRound(profileName, pool, nChoices, exclude))
    setStatus('asking')
    setPicked(null)
    setDirection(nextDirection)
  }

  function handlePick(code: string): void {
    if (status !== 'asking') {
      return
    }

    const isCorrect = code === target.code
    recordAnswer({
      profileName,
      mode: 'plates',
      entityId: target.code,
      correct: isCorrect,
      tags: ['GEO-OS-A.5.4'],
    })
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
        <RegistrationPlate code={target.code} serial={targetSerial} size="lg" />
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
              aria-label={
                direction === 'placeToCode'
                  ? plate.code
                  : `${plate.city[language]}, ${getCountyById(plate.countyId)?.name[language] ?? ''}`
              }
            >
              {direction === 'codeToPlace' ? (
                <>
                  <strong>{plate.city[language]}</strong>
                  <span>{getCountyById(plate.countyId)?.name[language]}</span>
                </>
              ) : (
                <RegistrationPlate
                  code={plate.code}
                  serial={choiceSerials[plate.code] ?? '000-A'}
                  size="sm"
                />
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
