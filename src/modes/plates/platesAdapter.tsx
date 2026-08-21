import type { ReactNode } from 'react'
import { RegistrationPlate } from '../../components/RegistrationPlate'
import { listPlateSeats } from '../../data/catalogue'
import { getCountyById } from '../../data/counties'
import type { PlaceRecord } from '../../data/placeTypes'
import en from '../../i18n/locales/en.json'
import hr from '../../i18n/locales/hr.json'
import { shuffle } from '../../learning/deck'
import type {
  Choice,
  ChoiceRenderUi,
  DeckItem,
  EncyclopediaEntry,
  ModeContentAdapter,
  ModeContext,
} from '../../learning/types'
import { simulateHrSerial } from '../../lib/hrPlateSerial'

/** Major urban codes for level ≤ 1. */
const MAJOR_CODES = new Set(['ZG', 'ST', 'RI', 'OS', 'ZD', 'PU'])

/**
 * Previous `PLATES` county-seat set (~20) used before the full HAK list.
 * Level 2 keeps this pool so difficulty does not jump to all 34 codes yet.
 */
const COUNTY_SEAT_CODES = new Set([
  'ZG',
  'ST',
  'RI',
  'OS',
  'ZD',
  'PU',
  'ŠI',
  'DU',
  'ČK',
  'VŽ',
  'KR',
  'KA',
  'SK',
  'KC',
  'BJ',
  'VT',
  'PŽ',
  'SB',
  'VK',
  'GS',
])

const PLATES_TAGS = ['GEO-OS-A.5.4']

type PlateDirection = 'codeToPlace' | 'placeToCode'

export type PlatesPayload = {
  code: string
  placeId: string
  countyId: string
  city: { hr: string; en: string }
  direction: PlateDirection
  serial: string
  hint: { hr: string; en: string }
  choiceSerials?: Record<string, string>
}

function isPlatesPayload(value: unknown): value is PlatesPayload {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return typeof record.code === 'string' && typeof record.direction === 'string'
}

export function poolForLevel(level: ModeContext['level']): PlaceRecord[] {
  const seats = listPlateSeats()
  if (level <= 1) {
    return seats.filter((place) => place.plateCode && MAJOR_CODES.has(place.plateCode))
  }
  if (level === 2) {
    return seats.filter((place) => place.plateCode && COUNTY_SEAT_CODES.has(place.plateCode))
  }
  return seats
}

function choiceCount(level: ModeContext['level']): number {
  if (level <= 1) return 3
  if (level === 2) return 4
  return 6
}

function directionsForLevel(level: ModeContext['level']): PlateDirection[] {
  if (level >= 3) return ['codeToPlace', 'placeToCode']
  return ['codeToPlace']
}

function toDeckItem(place: PlaceRecord, direction: PlateDirection): DeckItem {
  const code = place.plateCode!
  const county = getCountyById(place.countyId)
  return {
    entityId: code,
    promptKind: direction,
    tags: PLATES_TAGS,
    payload: {
      code,
      placeId: place.id,
      countyId: place.countyId,
      city: place.name,
      direction,
      serial: simulateHrSerial(),
      hint: county?.name ?? { hr: '', en: '' },
    } satisfies PlatesPayload,
  }
}

function payloadOf(item: DeckItem): PlatesPayload | null {
  return isPlatesPayload(item.payload) ? item.payload : null
}

function cityLabel(payload: PlatesPayload, language: ModeContext['language']): string {
  return payload.city[language]
}

function countyLabel(payload: PlatesPayload, language: ModeContext['language']): string {
  return getCountyById(payload.countyId)?.name[language] ?? ''
}

function lookupLocaleString(
  tree: unknown,
  path: string,
): string | null {
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

function renderPrompt(item: DeckItem, ctx: ModeContext): ReactNode {
  const payload = payloadOf(item)
  if (!payload) return null

  if (payload.direction === 'codeToPlace') {
    return (
      <div className="stack learning-plate-prompt">
        <p className="prompt">{t('plates.promptCode', ctx.language)}</p>
        <RegistrationPlate code={payload.code} serial={payload.serial} size="lg" />
      </div>
    )
  }

  return (
    <div className="stack learning-plate-prompt">
      <p className="prompt">
        {t('plates.promptPlace', ctx.language, { place: cityLabel(payload, ctx.language) })}
      </p>
    </div>
  )
}

function renderDetail(item: DeckItem, ctx: ModeContext): ReactNode {
  const payload = payloadOf(item)
  if (!payload) return null

  const city = cityLabel(payload, ctx.language)
  const county = countyLabel(payload, ctx.language)

  return (
    <div className="stack learning-plate-detail">
      <RegistrationPlate code={payload.code} serial={payload.serial} size="lg" />
      <p className="prompt">
        {t('plates.reveal', ctx.language, { code: payload.code, city, county })}
      </p>
    </div>
  )
}

/** Choice plate serials keyed by DeckItem — avoids mutating deck payloads. */
const choiceSerialCache = new WeakMap<DeckItem, Record<string, string>>()

function buildChoices(item: DeckItem, _deck: DeckItem[], ctx: ModeContext): Choice[] {
  const payload = payloadOf(item)
  if (!payload) return []

  const pool = poolForLevel(ctx.level)
  const n = choiceCount(ctx.level)
  const others = shuffle(pool.filter((place) => place.plateCode !== payload.code)).slice(
    0,
    Math.max(n - 1, 0),
  )
  const target = pool.find((place) => place.plateCode === payload.code)
  const options = shuffle([...(target ? [target] : []), ...others])

  choiceSerialCache.set(
    item,
    Object.fromEntries(options.map((place) => [place.plateCode!, simulateHrSerial()])),
  )

  return options.map((place) => {
    const code = place.plateCode!
    const correct = code === payload.code
    if (payload.direction === 'codeToPlace') {
      return {
        id: code,
        label: place.name[ctx.language],
        correct,
      }
    }
    return {
      id: code,
      label: code,
      correct,
    }
  })
}

function renderChoices(
  item: DeckItem,
  choices: Choice[],
  _ctx: ModeContext,
  ui: ChoiceRenderUi,
): ReactNode {
  const payload = payloadOf(item)
  if (!payload || payload.direction !== 'placeToCode') {
    return (
      <div className="choice-grid">
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
              {choice.label}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="choice-grid">
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
            aria-label={choice.id}
          >
            <RegistrationPlate
              code={choice.id}
              serial={
                choiceSerialCache.get(item)?.[choice.id] ??
                payload.choiceSerials?.[choice.id] ??
                '000-A'
              }
              size="sm"
            />
          </button>
        )
      })}
    </div>
  )
}

function encyclopediaIndex(ctx: ModeContext): EncyclopediaEntry[] {
  // Reference surface: all HAK civil codes, not level-gated deck pools.
  return listPlateSeats().map((place) => {
    const code = place.plateCode!
    const county = getCountyById(place.countyId)?.name[ctx.language] ?? ''
    const title = `${code} — ${place.name[ctx.language]}`
    return {
      id: code,
      title,
      subtitle: county || undefined,
      searchText: `${code} ${place.name.hr} ${place.name.en} ${county}`.toLowerCase(),
    }
  })
}

function renderEncyclopediaDetail(id: string, ctx: ModeContext): ReactNode {
  const place = listPlateSeats().find((row) => row.plateCode === id)
  if (!place || !place.plateCode) return null

  const payload: PlatesPayload = {
    code: place.plateCode,
    placeId: place.id,
    countyId: place.countyId,
    city: place.name,
    direction: 'codeToPlace',
    serial: simulateHrSerial(),
    hint: getCountyById(place.countyId)?.name ?? { hr: '', en: '' },
  }

  const plateDetail = renderDetail(
    { entityId: place.plateCode, promptKind: 'codeToPlace', tags: PLATES_TAGS, payload },
    ctx,
  )

  const facts = place.facts
  if (facts.length === 0) return plateDetail

  return (
    <div className="stack learning-plate-detail">
      {plateDetail}
      <h3>{t('places.basic', ctx.language)}</h3>
      <ul>
        {facts.slice(0, 3).map((fact) => (
          <li key={fact.hr}>{fact[ctx.language]}</li>
        ))}
      </ul>
    </div>
  )
}

export const platesAdapter: ModeContentAdapter = {
  modeId: 'plates',

  buildDeck(ctx) {
    const pool = poolForLevel(ctx.level)
    const directions = directionsForLevel(ctx.level)
    const items: DeckItem[] = []
    for (const place of pool) {
      if (!place.plateCode) continue
      for (const direction of directions) {
        items.push(toDeckItem(place, direction))
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
