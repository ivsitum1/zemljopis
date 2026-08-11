import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getCityById } from '../../data/cities'
import { curatedPlaces, type PlaceCard } from '../../data/places'
import {
  bandForDistance,
  bearingDegrees,
  distanceBandsForLevel,
  haversineKm,
  toCompass4,
  toCompass8,
  type Compass4,
  type Compass8,
  type DistanceBand,
} from '../../geo/distance'
import type { DifficultyLevel } from '../../types/profile'

type DistanceModeProps = {
  level: DifficultyLevel
  homeCityId: string
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
      correct: Compass4 | Compass8
      options: Array<Compass4 | Compass8>
      use8: boolean
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

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

function pickPlace(pool: PlaceCard[], excludeIds: string[] = []): PlaceCard {
  const candidates = pool.filter((place) => !excludeIds.includes(place.id))
  const list = candidates.length > 0 ? candidates : pool
  return list[Math.floor(Math.random() * list.length)]!
}

function makeRound(
  level: DifficultyLevel,
  home: { lat: number; lon: number; id: string },
  pool: PlaceCard[],
  previousTargetId?: string,
): Round {
  const bands = distanceBandsForLevel(level)
  const roll = Math.random()

  if (level >= 4 && roll > 0.66) {
    const a = pickPlace(pool, [home.id, previousTargetId ?? ''])
    const b = pickPlace(pool, [home.id, a.id])
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

  const target = pickPlace(pool, [home.id, previousTargetId ?? ''])
  const km = haversineKm(home.lat, home.lon, target.lat, target.lon)
  const bearing = bearingDegrees(home.lat, home.lon, target.lat, target.lon)

  if (level >= 2 && roll > 0.45) {
    const use8 = level >= 4
    const correct = use8 ? toCompass8(bearing) : toCompass4(bearing)
    const all = use8
      ? (['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as Compass8[])
      : (['N', 'E', 'S', 'W'] as Compass4[])
    return {
      kind: 'direction',
      target,
      km,
      bearing,
      correct,
      options: shuffle(all),
      use8,
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

export function DistanceMode({ level, homeCityId, onBack }: DistanceModeProps) {
  const { t, i18n } = useTranslation()
  const language = i18n.language.startsWith('en') ? 'en' : 'hr'
  const homeCity = getCityById(homeCityId)
  const pool = useMemo(() => curatedPlaces(), [])

  const home = homeCity
    ? { id: homeCity.id, lat: homeCity.lat, lon: homeCity.lon, name: homeCity.name }
    : { id: 'zagreb', lat: 45.815, lon: 15.982, name: { hr: 'Zagreb', en: 'Zagreb' } }

  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [round, setRound] = useState<Round>(() => makeRound(level, home, pool))
  const [status, setStatus] = useState<AnswerState>('asking')
  const [picked, setPicked] = useState<string | null>(null)

  function nextRound(excludeId?: string): void {
    setRound(makeRound(level, home, pool, excludeId))
    setStatus('asking')
    setPicked(null)
  }

  function resolve(isCorrect: boolean, pickId: string, excludeAfter?: string): void {
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

      {round.kind !== 'closer' ? (
        <MiniRoute
          homeLabel={homeName}
          targetLabel={round.target.name[language]}
          home={{ lat: home.lat, lon: home.lon }}
          target={{ lat: round.target.lat, lon: round.target.lon }}
        />
      ) : (
        <MiniRoute
          homeLabel={homeName}
          targetLabel={`${round.a.name[language]} / ${round.b.name[language]}`}
          home={{ lat: home.lat, lon: home.lon }}
          target={{ lat: round.a.lat, lon: round.a.lon }}
          secondary={{ lat: round.b.lat, lon: round.b.lon }}
        />
      )}

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
                    resolve(band.id === round.correctBand.id, band.id, round.target.id)
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
                  onClick={() => resolve(dir === round.correct, dir, round.target.id)}
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
                  onClick={() => resolve(place.id === round.closerId, place.id, place.id)}
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

function MiniRoute({
  homeLabel,
  targetLabel,
  home,
  target,
  secondary,
}: {
  homeLabel: string
  targetLabel: string
  home: { lat: number; lon: number }
  target: { lat: number; lon: number }
  secondary?: { lat: number; lon: number }
}) {
  const points = [home, target, ...(secondary ? [secondary] : [])]
  const lons = points.map((p) => p.lon)
  const lats = points.map((p) => p.lat)
  const minLon = Math.min(...lons) - 0.4
  const maxLon = Math.max(...lons) + 0.4
  const minLat = Math.min(...lats) - 0.3
  const maxLat = Math.max(...lats) + 0.3
  const w = 320
  const h = 160
  const project = (lat: number, lon: number) => ({
    x: ((lon - minLon) / (maxLon - minLon)) * (w - 24) + 12,
    y: ((maxLat - lat) / (maxLat - minLat)) * (h - 24) + 12,
  })
  const hPt = project(home.lat, home.lon)
  const tPt = project(target.lat, target.lon)
  const sPt = secondary ? project(secondary.lat, secondary.lon) : null

  return (
    <div className="mini-route">
      <svg viewBox={`0 0 ${w} ${h}`} className="mini-route-svg" aria-hidden>
        <line x1={hPt.x} y1={hPt.y} x2={tPt.x} y2={tPt.y} className="route-line" />
        {sPt ? <line x1={hPt.x} y1={hPt.y} x2={sPt.x} y2={sPt.y} className="route-line secondary" /> : null}
        <circle cx={hPt.x} cy={hPt.y} r={6} className="route-home" />
        <circle cx={tPt.x} cy={tPt.y} r={6} className="route-target" />
        {sPt ? <circle cx={sPt.x} cy={sPt.y} r={6} className="route-target secondary" /> : null}
      </svg>
      <p className="muted hint">
        {homeLabel} → {targetLabel}
      </p>
    </div>
  )
}
