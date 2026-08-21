import { useState, type ReactNode } from 'react'
import { PLACE_CATALOGUE, getPlaceById } from '../../data/catalogue'
import { getCountyById } from '../../data/counties'
import type { LocalizedText, PlaceRecord } from '../../data/placeTypes'
import {
  COMPASS8_ALL,
  bandForDistance,
  bearingDegrees,
  distanceBandsForLevel,
  haversineKm,
  toCompass8,
  type Compass8,
  type DistanceBand,
} from '../../geo/distance'
import en from '../../i18n/locales/en.json'
import hr from '../../i18n/locales/hr.json'
import type {
  Choice,
  ChoiceRenderUi,
  DeckItem,
  EncyclopediaEntry,
  ModeContentAdapter,
  ModeContext,
} from '../../learning/types'
import { CompassRose } from './CompassRose'
import { CroatiaDistanceMap } from './CroatiaDistanceMap'

const DISTANCE_TAGS = ['GEO-OS-B.5.3', 'GEO-OS-B.5.2']

const FALLBACK_HOME: PlaceRecord = {
  id: 'zagreb',
  name: { hr: 'Zagreb', en: 'Zagreb' },
  isOfficialCity: true,
  countyId: 'gzg',
  lat: 45.815,
  lon: 15.982,
  facts: [],
}

export type PlaceRef = {
  id: string
  name: LocalizedText
  countyId: string
  lat: number
  lon: number
}

export type DistancePayload =
  | {
      kind: 'distance'
      target: PlaceRef
      km: number
      correctBand: DistanceBand
      bands: DistanceBand[]
      hint: LocalizedText
    }
  | {
      kind: 'direction'
      target: PlaceRef
      km: number
      bearing: number
      correct: Compass8
      options: Compass8[]
      hint: LocalizedText
    }
  | {
      kind: 'closer'
      a: PlaceRef
      b: PlaceRef
      kmA: number
      kmB: number
      closerId: string
      hint: LocalizedText
    }

function isDistancePayload(value: unknown): value is DistancePayload {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    record.kind === 'distance' || record.kind === 'direction' || record.kind === 'closer'
  )
}

function toPlaceRef(place: PlaceRecord): PlaceRef {
  return {
    id: place.id,
    name: place.name,
    countyId: place.countyId,
    lat: place.lat,
    lon: place.lon,
  }
}

export function resolveHome(ctx: ModeContext): PlaceRecord {
  return getPlaceById(ctx.homeCityId) ?? FALLBACK_HOME
}

/** Catalogue places with coordinates, excluding home. */
export function poolForLevel(ctx: ModeContext): PlaceRecord[] {
  const homeId = resolveHome(ctx).id
  return PLACE_CATALOGUE.filter(
    (place) =>
      place.id !== homeId &&
      Number.isFinite(place.lat) &&
      Number.isFinite(place.lon),
  )
}

export function kindsForLevel(level: ModeContext['level']): Array<DistancePayload['kind']> {
  if (level <= 1) return ['distance']
  if (level <= 3) return ['distance', 'direction']
  return ['distance', 'direction', 'closer']
}

function countyName(place: PlaceRecord, language: ModeContext['language']): string {
  const county = getCountyById(place.countyId)?.name
  if (county) return county[language]
  if (place.region) return place.region[language]
  return place.name[language]
}

function educationalHint(
  kind: 'distance' | 'direction' | 'closer',
  place: PlaceRecord | null,
): LocalizedText {
  if (kind === 'direction' && place) {
    return {
      hr: t('distance.hintDirection', 'hr', { county: countyName(place, 'hr') }),
      en: t('distance.hintDirection', 'en', { county: countyName(place, 'en') }),
    }
  }
  if (kind === 'closer') {
    return {
      hr: t('distance.hintCloser', 'hr'),
      en: t('distance.hintCloser', 'en'),
    }
  }
  if (place) {
    return {
      hr: t('distance.hintDistance', 'hr', { county: countyName(place, 'hr') }),
      en: t('distance.hintDistance', 'en', { county: countyName(place, 'en') }),
    }
  }
  return { hr: '', en: '' }
}

function lookupLocaleString(tree: unknown, path: string): string | null {
  let cur: unknown = tree
  for (const part of path.split('.')) {
    if (!cur || typeof cur !== 'object') return null
    cur = (cur as Record<string, unknown>)[part]
  }
  return typeof cur === 'string' ? cur : null
}

function t(key: string, language: ModeContext['language'], values?: Record<string, string>) {
  const template =
    lookupLocaleString(language === 'en' ? en : hr, key) ??
    lookupLocaleString(hr, key) ??
    key
  if (!values) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => values[name] ?? '')
}

function payloadOf(item: DeckItem): DistancePayload | null {
  return isDistancePayload(item.payload) ? item.payload : null
}

function buildDistanceItem(place: PlaceRecord, home: PlaceRecord, level: ModeContext['level']): DeckItem {
  const bands = distanceBandsForLevel(level)
  const km = haversineKm(home.lat, home.lon, place.lat, place.lon)
  return {
    entityId: place.id,
    promptKind: 'distance',
    tags: DISTANCE_TAGS,
    payload: {
      kind: 'distance',
      target: toPlaceRef(place),
      km,
      correctBand: bandForDistance(km, bands),
      bands,
      hint: educationalHint('distance', place),
    } satisfies DistancePayload,
  }
}

function buildDirectionItem(place: PlaceRecord, home: PlaceRecord): DeckItem {
  const km = haversineKm(home.lat, home.lon, place.lat, place.lon)
  const bearing = bearingDegrees(home.lat, home.lon, place.lat, place.lon)
  const correct = toCompass8(bearing)
  return {
    entityId: place.id,
    promptKind: 'direction',
    tags: DISTANCE_TAGS,
    payload: {
      kind: 'direction',
      target: toPlaceRef(place),
      km,
      bearing,
      correct,
      options: [...COMPASS8_ALL],
      hint: educationalHint('direction', place),
    } satisfies DistancePayload,
  }
}

function buildCloserItem(a: PlaceRecord, b: PlaceRecord, home: PlaceRecord): DeckItem {
  const kmA = haversineKm(home.lat, home.lon, a.lat, a.lon)
  const kmB = haversineKm(home.lat, home.lon, b.lat, b.lon)
  const closerId = kmA <= kmB ? a.id : b.id
  return {
    entityId: `${a.id}__${b.id}`,
    promptKind: 'closer',
    tags: DISTANCE_TAGS,
    payload: {
      kind: 'closer',
      a: toPlaceRef(a),
      b: toPlaceRef(b),
      kmA,
      kmB,
      closerId,
      hint: educationalHint('closer', null),
    } satisfies DistancePayload,
  }
}

function renderViz(
  home: PlaceRecord,
  target: PlaceRef,
  secondary: PlaceRef | undefined,
  ctx: ModeContext,
  opts: {
    emphasized: boolean
    highlight?: Compass8 | null
    bearing?: number | null
  },
): ReactNode {
  return (
    <div className="distance-viz">
      <div className="distance-viz__stage">
        <CroatiaDistanceMap
          home={{
            lat: home.lat,
            lon: home.lon,
            countyId: home.countyId,
            role: 'home',
          }}
          target={{
            lat: target.lat,
            lon: target.lon,
            countyId: target.countyId,
            role: 'target',
          }}
          secondary={
            secondary
              ? {
                  lat: secondary.lat,
                  lon: secondary.lon,
                  countyId: secondary.countyId,
                  role: 'secondary',
                }
              : undefined
          }
          ariaLabel={t('distance.mapAria', ctx.language)}
        />
        <div className="distance-viz__compass">
          <CompassRose
            emphasized={opts.emphasized}
            highlight={opts.highlight ?? null}
            bearingDegrees={opts.bearing ?? null}
            ariaLabel={t('distance.compassAria', ctx.language)}
          />
        </div>
      </div>
    </div>
  )
}

function renderPrompt(item: DeckItem, ctx: ModeContext): ReactNode {
  const payload = payloadOf(item)
  if (!payload) return null

  const home = resolveHome(ctx)
  const homeName = home.name[ctx.language]

  if (payload.kind === 'closer') {
    return (
      <div className="stack learning-distance-prompt">
        <p className="muted">{t('distance.fromHome', ctx.language, { city: homeName })}</p>
        <p className="muted hint">{t('distance.airNote', ctx.language)}</p>
        {renderViz(home, payload.a, payload.b, ctx, { emphasized: false })}
        <p className="muted hint">
          {homeName} → {payload.a.name[ctx.language]} / {payload.b.name[ctx.language]}
        </p>
        <p className="prompt">{t('distance.askCloser', ctx.language)}</p>
      </div>
    )
  }

  const targetName = payload.target.name[ctx.language]
  return (
    <div className="stack learning-distance-prompt">
      <p className="muted">{t('distance.fromHome', ctx.language, { city: homeName })}</p>
      <p className="muted hint">{t('distance.airNote', ctx.language)}</p>
      {renderViz(home, payload.target, undefined, ctx, {
        emphasized: payload.kind === 'direction',
      })}
      <p className="muted hint">
        {homeName} → {targetName}
      </p>
      <p className="prompt">
        {payload.kind === 'direction'
          ? t('distance.askDirection', ctx.language, { place: targetName })
          : t('distance.askDistance', ctx.language, { place: targetName })}
      </p>
      {payload.kind === 'direction' ? (
        <p className="muted hint">{t('distance.hintCompassTip', ctx.language)}</p>
      ) : null}
    </div>
  )
}

function renderDetail(item: DeckItem, ctx: ModeContext): ReactNode {
  const payload = payloadOf(item)
  if (!payload) return null

  const home = resolveHome(ctx)
  const homeName = home.name[ctx.language]

  if (payload.kind === 'distance') {
    const targetName = payload.target.name[ctx.language]
    return (
      <div className="stack learning-distance-detail">
        <p className="muted">{t('distance.fromHome', ctx.language, { city: homeName })}</p>
        {renderViz(home, payload.target, undefined, ctx, { emphasized: false })}
        <p className="prompt">
          {t('distance.askDistance', ctx.language, { place: targetName })}
        </p>
        <p className="feedback ok">
          {t('distance.revealKm', ctx.language, { km: String(Math.round(payload.km)) })}
        </p>
        <p className="muted">{payload.correctBand.label[ctx.language]}</p>
      </div>
    )
  }

  if (payload.kind === 'direction') {
    const targetName = payload.target.name[ctx.language]
    const dir = t(`distance.dirs.${payload.correct}`, ctx.language)
    return (
      <div className="stack learning-distance-detail">
        <p className="muted">{t('distance.fromHome', ctx.language, { city: homeName })}</p>
        {renderViz(home, payload.target, undefined, ctx, {
          emphasized: true,
          highlight: payload.correct,
          bearing: payload.bearing,
        })}
        <p className="prompt">
          {t('distance.askDirection', ctx.language, { place: targetName })}
        </p>
        <p className="feedback ok">
          {t('distance.revealDirection', ctx.language, {
            dir,
            km: String(Math.round(payload.km)),
          })}
        </p>
      </div>
    )
  }

  return (
    <div className="stack learning-distance-detail">
      <p className="muted">{t('distance.fromHome', ctx.language, { city: homeName })}</p>
      {renderViz(home, payload.a, payload.b, ctx, { emphasized: false })}
      <p className="prompt">{t('distance.askCloser', ctx.language)}</p>
      <p className="feedback ok">
        {t('distance.revealCloser', ctx.language, {
          a: payload.a.name[ctx.language],
          kmA: String(Math.round(payload.kmA)),
          b: payload.b.name[ctx.language],
          kmB: String(Math.round(payload.kmB)),
        })}
      </p>
    </div>
  )
}

function buildChoices(item: DeckItem, _deck: DeckItem[], ctx: ModeContext): Choice[] {
  const payload = payloadOf(item)
  if (!payload) return []

  if (payload.kind === 'distance') {
    return payload.bands.map((band) => ({
      id: band.id,
      label: band.label[ctx.language],
      correct: band.id === payload.correctBand.id,
    }))
  }

  if (payload.kind === 'direction') {
    return payload.options.map((dir) => ({
      id: dir,
      label: t(`distance.dirs.${dir}`, ctx.language),
      correct: dir === payload.correct,
    }))
  }

  return [payload.a, payload.b].map((place) => ({
    id: place.id,
    label: place.name[ctx.language],
    correct: place.id === payload.closerId,
  }))
}

function renderChoices(
  item: DeckItem,
  choices: Choice[],
  _ctx: ModeContext,
  ui: ChoiceRenderUi,
): ReactNode {
  const payload = payloadOf(item)
  const gridClass =
    payload?.kind === 'direction' ? 'choice-grid compass-grid' : 'choice-grid'

  return (
    <div className={gridClass}>
      {choices.map((choice) => {
        let className = 'choice'
        if (ui.status === 'correct' && choice.correct) className += ' correct'
        if (ui.status === 'wrong' && ui.picked === choice.id) className += ' wrong'
        if (ui.status === 'wrong' && choice.correct) className += ' correct'
        return (
          <button
            key={choice.id}
            type="button"
            className={className}
            disabled={ui.status !== 'asking'}
            onClick={() => ui.onPick(choice.id)}
          >
            <strong>{choice.label}</strong>
          </button>
        )
      })}
    </div>
  )
}

function encyclopediaIndex(ctx: ModeContext): EncyclopediaEntry[] {
  return poolForLevel(ctx).map((place) => {
    const county = getCountyById(place.countyId)?.name[ctx.language] ?? ''
    const region = place.region?.[ctx.language] ?? ''
    return {
      id: place.id,
      title: place.name[ctx.language],
      subtitle: region || county || undefined,
      searchText: `${place.name.hr} ${place.name.en} ${region} ${county}`.toLowerCase(),
    }
  })
}

function EncyclopediaDistanceDetail({
  placeId,
  ctx,
}: {
  placeId: string
  ctx: ModeContext
}) {
  const place = getPlaceById(placeId)
  const home = resolveHome(ctx)
  const [compareId, setCompareId] = useState('')

  if (!place) return null

  const km = haversineKm(home.lat, home.lon, place.lat, place.lon)
  const bearing = bearingDegrees(home.lat, home.lon, place.lat, place.lon)
  const dir = toCompass8(bearing)
  const dirLabel = t(`distance.dirs.${dir}`, ctx.language)
  const comparePlace = compareId ? getPlaceById(compareId) : undefined
  const betweenKm =
    comparePlace != null
      ? haversineKm(place.lat, place.lon, comparePlace.lat, comparePlace.lon)
      : null
  const others = poolForLevel(ctx).filter((row) => row.id !== place.id)

  return (
    <article className="stack learning-distance-encyclopedia">
      <h2>{place.name[ctx.language]}</h2>
      <p className="muted">
        {t('distance.fromHome', ctx.language, { city: home.name[ctx.language] })}
      </p>
      <p className="muted hint">{t('distance.airNote', ctx.language)}</p>
      {renderViz(home, toPlaceRef(place), comparePlace ? toPlaceRef(comparePlace) : undefined, ctx, {
        emphasized: true,
        highlight: dir,
        bearing,
      })}
      <p className="prompt">
        {t('distance.fromHomeDetail', ctx.language, {
          place: place.name[ctx.language],
          km: String(Math.round(km)),
          dir: dirLabel,
        })}
      </p>

      <label className="field" htmlFor={`distance-compare-${place.id}`}>
        {t('distance.comparePrompt', ctx.language)}
        <select
          id={`distance-compare-${place.id}`}
          value={compareId}
          onChange={(event) => setCompareId(event.target.value)}
        >
          <option value="">{t('distance.compareNone', ctx.language)}</option>
          {others.map((row) => (
            <option key={row.id} value={row.id}>
              {row.name[ctx.language]}
            </option>
          ))}
        </select>
      </label>

      {comparePlace && betweenKm != null ? (
        <p className="muted">
          {t('distance.betweenPlaces', ctx.language, {
            a: place.name[ctx.language],
            b: comparePlace.name[ctx.language],
            km: String(Math.round(betweenKm)),
          })}
        </p>
      ) : null}
    </article>
  )
}

function renderEncyclopediaDetail(id: string, ctx: ModeContext): ReactNode {
  return <EncyclopediaDistanceDetail placeId={id} ctx={ctx} />
}

export const distanceAdapter: ModeContentAdapter = {
  modeId: 'distance',

  buildDeck(ctx) {
    const home = resolveHome(ctx)
    const pool = poolForLevel(ctx)
    const kinds = kindsForLevel(ctx.level)
    const items: DeckItem[] = []

    for (const place of pool) {
      if (kinds.includes('distance')) {
        items.push(buildDistanceItem(place, home, ctx.level))
      }
      if (kinds.includes('direction')) {
        items.push(buildDirectionItem(place, home))
      }
    }

    if (kinds.includes('closer') && pool.length >= 2) {
      const half = Math.max(1, Math.floor(pool.length / 2))
      for (let i = 0; i < pool.length; i += 1) {
        const a = pool[i]!
        const b = pool[(i + half) % pool.length]!
        if (a.id === b.id) continue
        items.push(buildCloserItem(a, b, home))
      }
    }

    return items
  },

  renderPrompt,
  renderChoices,
  buildChoices,
  renderDetail,
  encyclopediaIndex,
  renderEncyclopediaDetail,
}
