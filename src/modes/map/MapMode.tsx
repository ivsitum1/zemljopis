import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { COUNTIES, getCountyById, type County } from '../../data/counties'
import { pickWeightedId, recordAnswer } from '../../storage/progress'
import type { DifficultyLevel } from '../../types/profile'
import { CroatiaMap } from './CroatiaMap'

type MapModeProps = {
  level: DifficultyLevel
  profileName: string
  onBack: () => void
}

type RoundState = {
  target: County
  status: 'asking' | 'correct' | 'wrong'
  wrongId: string | null
}

function poolForLevel(level: DifficultyLevel): County[] {
  if (level <= 1) {
    return COUNTIES.filter((county) =>
      ['gzg', 'zgz', 'sdz', 'pgz', 'obz', 'isz', 'zdz', 'dnz'].includes(county.id),
    )
  }
  if (level === 2) {
    return COUNTIES.filter((county) => county.id !== 'kzz2' && county.id !== 'psz' && county.id !== 'vpz')
  }
  return COUNTIES
}

function pickTarget(profileName: string, pool: County[], excludeId?: string): County {
  const id = pickWeightedId(
    profileName,
    'map',
    pool.map((county) => county.id),
    excludeId,
  )
  return pool.find((county) => county.id === id) ?? pool[0]!
}

export function MapMode({ level, profileName, onBack }: MapModeProps) {
  const { t, i18n } = useTranslation()
  const language = i18n.language.startsWith('en') ? 'en' : 'hr'
  const pool = useMemo(() => poolForLevel(level), [level])
  const showLabels = level <= 1

  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [round, setRound] = useState<RoundState>(() => ({
    target: pickTarget(profileName, pool),
    status: 'asking',
    wrongId: null,
  }))

  function nextRound(previousId?: string): void {
    setRound({
      target: pickTarget(profileName, pool, previousId),
      status: 'asking',
      wrongId: null,
    })
  }

  function handleSelect(countyId: string): void {
    if (round.status !== 'asking') {
      return
    }

    const isCorrect = countyId === round.target.id
    recordAnswer({
      profileName,
      mode: 'map',
      entityId: round.target.id,
      correct: isCorrect,
      tags: [...round.target.curriculumTags, 'GEO-OS-B.5.2'],
    })
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))

    if (isCorrect) {
      setRound((prev) => ({ ...prev, status: 'correct', wrongId: null }))
      window.setTimeout(() => nextRound(round.target.id), 900)
      return
    }

    setRound((prev) => ({ ...prev, status: 'wrong', wrongId: countyId }))
    window.setTimeout(() => {
      setRound((prev) => ({ ...prev, status: 'asking', wrongId: null }))
    }, 1100)
  }

  const targetName = round.target.name[language]
  const wrongCounty = round.wrongId ? getCountyById(round.wrongId) : undefined

  return (
    <section className="panel mode-panel">
      <div className="mode-toolbar">
        <button type="button" className="ghost" onClick={onBack}>
          ← {t('common.back')}
        </button>
        <p className="score">
          {t('map.score', { correct: score.correct, total: score.total })}
        </p>
      </div>

      <h1>{t('modes.map.title')}</h1>
      <p className="prompt">{t('map.findCounty', { name: targetName })}</p>

      {round.status === 'correct' ? <p className="feedback ok">{t('map.correct')}</p> : null}
      {round.status === 'wrong' && wrongCounty ? (
        <p className="feedback bad">
          {t('map.wrong', { name: wrongCounty.name[language] })}
        </p>
      ) : null}

      <div className="map-frame">
        <CroatiaMap
          language={language}
          showLabels={showLabels}
          highlightId={round.status === 'correct' ? round.target.id : null}
          correctId={round.status === 'correct' ? round.target.id : null}
          wrongId={round.wrongId}
          onSelect={handleSelect}
          disabled={round.status === 'correct'}
        />
      </div>

      <p className="muted hint">{t('map.hint')}</p>
    </section>
  )
}
