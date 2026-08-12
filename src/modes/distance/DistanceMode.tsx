import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getCityById } from '../../data/cities'
import { curatedPlaces, type PlaceCard } from '../../data/places'
import {
  bandForDistance,
  bearingDegrees,
  directionChoices4,
  distanceBandsForLevel,
  haversineKm,
  toCompass8,
  type Compass8,
  type DistanceBand,
} from '../../geo/distance'
import type { DifficultyLevel } from '../../types/profile'
import { pickWeightedId, recordAnswer } from '../../storage/progress'
import { CompassRose } from './CompassRose'
import { CroatiaDistanceMap } from './CroatiaDistanceMap'

type DistanceModeProps = {
  level: DifficultyLevel
  homeCityId: string
  profileName: string
  onBack: () => void
}

type Round =
  | {
      kind: 'distance'
      target: PlaceCard
      km: number
      correctBand: DistanceBand
      bands: DistanceBand[]
    }
  | {
      kind: 'direction'
      target: PlaceCard
      km: number
      bearing: number
      correct: Compass8
      options: Compass8[]
    }
  | {
      kind: 'closer'
      a: PlaceCard
      b: PlaceCard
      kmA: number
      kmB: number
      closerId: string
    }

type AnswerState = 'asking' | 'correct' | 'wrong'

function pickPlace(
  profileName: string,
  pool: PlaceCard[],
  excludeIds: string[] = [],
): PlaceCard {
  const candidates = pool.filter((place) => !excludeIds.includes(place.id))
  const list = candidates.length > 0 ? candidates : pool
  const id = pickWeightedId(
    profileName,
    'distance',
    list.map((place) => place.id),
  )
  return list.find((place) => place.id === id) ?? list[0]!
}

function makeRound(
  level: DifficultyLevel,
  home: { lat: number; lon: number; id: string },
  pool: PlaceCard[],
  profileName: string,
  previousTargetId?: string,
): Round {
  const bands = distanceBandsForLevel(level)
  const roll = Math.random()

  if (level >= 4 && roll > 0.66) {
    const a = pickPlace(profileName, pool, [home.id, previousTargetId ?? ''])
    const b = pickPlace(profileName, pool, [home.id, a.id])
    const kmA = haversineKm(home.lat, home.lon, a.lat, a.lon)
    const kmB = haversineKm(home.lat, home.lon, b.lat, b.lon)
    return {
      kind: 'closer',
      a,
      b,
      kmA,
      kmB,
      closerId: kmA <= kmB ? a.id : b.id,
    }
  }

  const target = pickPlace(profileName, pool, [home.id, previousTargetId ?? ''])
  const km = haversineKm(home.lat, home.lon, target.lat, target.lon)
  const bearing = bearingDegrees(home.lat, home.lon, target.lat, target.lon)

  if (level >= 2 && roll > 0.45) {
    const correct = toCompass8(bearing)
    return {
      kind: 'direction',
      target,
      km,
      bearing,
      correct,
      options: directionChoices4(correct),
    }
  }

  return {
    kind: 'distance',
    target,
    km,
    correctBand: bandForDistance(km, bands),
    bands,
  }
}

export function DistanceMode({ level, homeCityId, profileName, onBack }: DistanceModeProps) {
  const { t, i18n } = useTranslation()
  const language = i18n.language.startsWith('en') ? 'en' : 'hr'
  const homeCity = getCityById(homeCityId)
  const pool = useMemo(() => curatedPlaces(), [])

  const home = homeCity
    ? { id: homeCity.id, lat: homeCity.lat, lon: homeCity.lon, name: homeCity.name }
    : { id: 'zagreb', lat: 45.815, lon: 15.982, name: { hr: 'Zagreb', en: 'Zagreb' } }

  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [round, setRound] = useState<Round>(() => makeRound(level, home, pool, profileName))
  const [status, setStatus] = useState<AnswerState>('asking')
  const [picked, setPicked] = useState<string | null>(null)

  function nextRound(excludeId?: string): void {
    setRound(makeRound(level, home, pool, profileName, excludeId))
    setStatus('asking')
    setPicked(null)
  }

  function resolve(isCorrect: boolean, pickId: string, entityId: string, excludeAfter?: string): void {
    recordAnswer({
      profileName,
      mode: 'distance',
      entityId,
      correct: isCorrect,
      tags: ['GEO-OS-B.5.3', 'GEO-OS-B.5.2'],
    })
    setPicked(pickId)
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))
    setStatus(isCorrect ? 'correct' : 'wrong')
    window.setTimeout(() => {
      if (isCorrect) {
        nextRound(excludeAfter)
      } else {
        setStatus('asking')
        setPicked(null)
      }
    }, isCorrect ? 1100 : 1000)
  }

  const targetName =
    round.kind === 'closer' ? null : round.target.name[language]
  const homeName = home.name[language]

  const mapHome = { lat: home.lat, lon: home.lon, role: 'home' as const }
  const mapTarget =
    round.kind === 'closer'
      ? { lat: round.a.lat, lon: round.a.lon, role: 'target' as const }
      : { lat: round.target.lat, lon: round.target.lon, role: 'target' as const }
  const mapSecondary =
    round.kind === 'closer'
      ? { lat: round.b.lat, lon: round.b.lon, role: 'secondary' as const }
      : undefined

  const directionHighlight =
    round.kind === 'direction' && status === 'correct' ? round.correct : null
  const directionBearing =
    round.kind === 'direction' && status === 'correct' ? round.bearing : null

  return (
    <section className="panel mode-panel">
      <div className="mode-toolbar">
        <button type="button" className="ghost" onClick={onBack}>
          ← {t('common.back')}
        </button>
        <p className="score">{t('distance.score', { correct: score.correct, total: score.total })}</p>
      </div>

      <h1>{t('modes.distance.title')}</h1>
      <p className="muted">{t('distance.fromHome', { city: homeName })}</p>
      <p className="muted hint">{t('distance.airNote')}</p>

      <div className="distance-viz">
        <CroatiaDistanceMap
          home={mapHome}
          target={mapTarget}
          secondary={mapSecondary}
          ariaLabel={t('distance.mapAria')}
        />
        <CompassRose
          emphasized={round.kind === 'direction'}
          highlight={directionHighlight}
          bearingDegrees={directionBearing}
          ariaLabel={t('distance.compassAria')}
        />
      </div>
      <p className="muted hint">
        {round.kind === 'closer'
          ? `${homeName} → ${round.a.name[language]} / ${round.b.name[language]}`
          : `${homeName} → ${targetName}`}
      </p>

      {round.kind === 'distance' ? (
        <>
          <p className="prompt">{t('distance.askDistance', { place: targetName })}</p>
          {status === 'correct' ? (
            <p className="feedback ok">
              {t('distance.revealKm', { km: Math.round(round.km) })}
            </p>
          ) : null}
          {status === 'wrong' ? <p className="feedback bad">{t('distance.wrong')}</p> : null}
          <div className="choice-grid">
            {round.bands.map((band) => {
              let className = 'choice'
              if (status === 'correct' && band.id === round.correctBand.id) className += ' correct'
              if (status === 'wrong' && picked === band.id) className += ' wrong'
              return (
                <button
                  key={band.id}
                  type="button"
                  className={className}
                  disabled={status === 'correct'}
                  onClick={() =>
                    resolve(
                      band.id === round.correctBand.id,
                      band.id,
                      round.target.id,
                      round.target.id,
                    )
                  }
                >
                  <strong>{band.label[language]}</strong>
                </button>
              )
            })}
          </div>
        </>
      ) : null}

      {round.kind === 'direction' ? (
        <>
          <p className="prompt">{t('distance.askDirection', { place: targetName })}</p>
          {status === 'correct' ? (
            <p className="feedback ok">
              {t('distance.revealDirection', {
                dir: t(`distance.dirs.${round.correct}`),
                km: Math.round(round.km),
              })}
            </p>
          ) : null}
          {status === 'wrong' ? <p className="feedback bad">{t('distance.wrong')}</p> : null}
          <div className="choice-grid compass-grid">
            {round.options.map((dir) => {
              let className = 'choice'
              if (status === 'correct' && dir === round.correct) className += ' correct'
              if (status === 'wrong' && picked === dir) className += ' wrong'
              return (
                <button
                  key={dir}
                  type="button"
                  className={className}
                  disabled={status === 'correct'}
                  onClick={() => resolve(dir === round.correct, dir, round.target.id, round.target.id)}
                >
                  <strong>{t(`distance.dirs.${dir}`)}</strong>
                </button>
              )
            })}
          </div>
        </>
      ) : null}

      {round.kind === 'closer' ? (
        <>
          <p className="prompt">{t('distance.askCloser')}</p>
          {status === 'correct' ? (
            <p className="feedback ok">
              {t('distance.revealCloser', {
                a: round.a.name[language],
                kmA: Math.round(round.kmA),
                b: round.b.name[language],
                kmB: Math.round(round.kmB),
              })}
            </p>
          ) : null}
          {status === 'wrong' ? <p className="feedback bad">{t('distance.wrong')}</p> : null}
          <div className="choice-grid">
            {[round.a, round.b].map((place) => {
              let className = 'choice'
              if (status === 'correct' && place.id === round.closerId) className += ' correct'
              if (status === 'wrong' && picked === place.id) className += ' wrong'
              return (
                <button
                  key={place.id}
                  type="button"
                  className={className}
                  disabled={status === 'correct'}
                  onClick={() =>
                    resolve(place.id === round.closerId, place.id, round.closerId, round.closerId)
                  }
                >
                  <strong>{place.name[language]}</strong>
                </button>
              )
            })}
          </div>
        </>
      ) : null}
    </section>
  )
}
