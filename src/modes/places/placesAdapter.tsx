import type { ReactNode } from 'react'
import { PLACE_CATALOGUE, getPlaceById } from '../../data/catalogue'
import { getCountyById } from '../../data/counties'
import type { LocalizedText, PlaceRecord } from '../../data/placeTypes'
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
import { PlaceLocationMap } from './PlaceLocationMap'

/** Major urban centres for level ≤ 1 (same set as plates). */
const MAJOR_IDS = new Set(['zagreb', 'split', 'rijeka', 'osijek', 'zadar', 'pula'])

const DEFAULT_TAGS = ['GEO-OS-A.5.4']

export type PlacesPayload = {
  placeId: string
  countyId: string
  name: LocalizedText
  region: LocalizedText
  lat: number
  lon: number
  fact: LocalizedText
  /** County name — used as quiz hint without revealing the place. */
  hint: LocalizedText
}

function isPlacesPayload(value: unknown): value is PlacesPayload {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return typeof record.placeId === 'string' && !!record.fact && typeof record.fact === 'object'
}

function placesWithFacts(): PlaceRecord[] {
  return PLACE_CATALOGUE.filter((place) => place.facts.length > 0)
}

/** Deck pool by difficulty: majors → curated facts → all fact-bearing places. */
export function poolForLevel(level: ModeContext['level']): PlaceRecord[] {
  const withFacts = placesWithFacts()
  if (level <= 1) {
    return withFacts.filter((place) => MAJOR_IDS.has(place.id))
  }
  return withFacts
}

function encyclopediaPool(): PlaceRecord[] {
  return PLACE_CATALOGUE
}

function choiceCount(level: ModeContext['level']): number {
  if (level <= 1) return 3
  if (level === 2) return 4
  return 6
}

function basicFacts(place: PlaceRecord): LocalizedText[] {
  return place.facts.slice(0, 3)
}

function advancedFacts(place: PlaceRecord): LocalizedText[] {
  return place.facts.slice(3)
}

function factsForDeck(place: PlaceRecord, level: ModeContext['level']): LocalizedText[] {
  if (level >= 3) return place.facts
  return basicFacts(place)
}

function toDeckItem(place: PlaceRecord, fact: LocalizedText): DeckItem {
  const county = getCountyById(place.countyId)
  return {
    entityId: place.id,
    promptKind: 'factToPlace',
    tags: place.curriculumTags?.length ? place.curriculumTags : DEFAULT_TAGS,
    payload: {
      placeId: place.id,
      countyId: place.countyId,
      name: place.name,
      region: place.region ?? { hr: '', en: '' },
      lat: place.lat,
      lon: place.lon,
      fact,
      hint: county?.name ?? place.region ?? { hr: '', en: '' },
    } satisfies PlacesPayload,
  }
}

function payloadOf(item: DeckItem): PlacesPayload | null {
  return isPlacesPayload(item.payload) ? item.payload : null
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

/** Quiz/flashcard detail may lock advanced facts; encyclopedia always shows them. */
export function showAdvancedFacts(
  level: ModeContext['level'],
  surface: 'learning' | 'encyclopedia' = 'learning',
): boolean {
  if (surface === 'encyclopedia') return true
  return level >= 3
}

function renderPrompt(item: DeckItem, ctx: ModeContext): ReactNode {
  const payload = payloadOf(item)
  if (!payload) return null

  return (
    <div className="stack learning-place-prompt">
      <p className="prompt">{t('places.quizPrompt', ctx.language)}</p>
      <blockquote className="fact-quote">{payload.fact[ctx.language]}</blockquote>
    </div>
  )
}

function renderPlaceDetail(
  place: PlaceRecord,
  ctx: ModeContext,
  highlightFact?: LocalizedText,
  surface: 'learning' | 'encyclopedia' = 'learning',
): ReactNode {
  const county = getCountyById(place.countyId)
  const basic = basicFacts(place)
  const advanced = advancedFacts(place)
  const advancedOk = showAdvancedFacts(ctx.level, surface)
  const region = place.region?.[ctx.language] ?? ''

  return (
    <article className="place-card-detail learning-place-detail">
      {region ? <p className="eyebrow">{region}</p> : null}
      <h2>{place.name[ctx.language]}</h2>
      <p className="muted">{county ? county.name[ctx.language] : place.countyId}</p>

      <PlaceLocationMap
        lat={place.lat}
        lon={place.lon}
        countyId={place.countyId}
        ariaLabel={t('places.mapAria', ctx.language, { place: place.name[ctx.language] })}
      />

      {highlightFact ? <blockquote className="fact-quote">{highlightFact[ctx.language]}</blockquote> : null}

      {basic.length > 0 ? (
        <>
          <h3>{t('places.basic', ctx.language)}</h3>
          <ul>
            {basic.map((fact) => (
              <li key={fact.hr}>{fact[ctx.language]}</li>
            ))}
          </ul>
        </>
      ) : null}

      {advancedOk && advanced.length > 0 ? (
        <>
          <h3>{t('places.advanced', ctx.language)}</h3>
          <ul>
            {advanced.map((fact) => (
              <li key={fact.hr}>{fact[ctx.language]}</li>
            ))}
          </ul>
        </>
      ) : null}

      {!advancedOk && advanced.length > 0 ? (
        <p className="muted hint">{t('places.advancedLocked', ctx.language)}</p>
      ) : null}
    </article>
  )
}

function renderDetail(item: DeckItem, ctx: ModeContext): ReactNode {
  const payload = payloadOf(item)
  if (!payload) return null

  const place = getPlaceById(payload.placeId)
  if (!place) return null

  return renderPlaceDetail(place, ctx, payload.fact)
}

function buildChoices(item: DeckItem, _deck: DeckItem[], ctx: ModeContext): Choice[] {
  const payload = payloadOf(item)
  if (!payload) return []

  const pool = poolForLevel(ctx.level)
  const n = choiceCount(ctx.level)
  const others = shuffle(pool.filter((place) => place.id !== payload.placeId)).slice(
    0,
    Math.max(n - 1, 0),
  )
  const target = pool.find((place) => place.id === payload.placeId)
  const options = shuffle([...(target ? [target] : []), ...others])

  return options.map((place) => ({
    id: place.id,
    label: place.name[ctx.language],
    correct: place.id === payload.placeId,
  }))
}

function renderChoices(
  item: DeckItem,
  choices: Choice[],
  ctx: ModeContext,
  ui: ChoiceRenderUi,
): ReactNode {
  const payload = payloadOf(item)
  if (!payload) return null

  return (
    <div className="choice-grid">
      {choices.map((choice) => {
        const place = getPlaceById(choice.id)
        const region = place?.region?.[ctx.language] ?? ''
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
            {region ? <span>{region}</span> : null}
          </button>
        )
      })}
    </div>
  )
}

function encyclopediaIndex(ctx: ModeContext): EncyclopediaEntry[] {
  return encyclopediaPool().map((place) => {
    const county = getCountyById(place.countyId)?.name[ctx.language] ?? ''
    const region = place.region?.[ctx.language] ?? ''
    return {
      id: place.id,
      title: place.name[ctx.language],
      subtitle: region || county || undefined,
      searchText: `${place.name.hr} ${place.name.en} ${region} ${county} ${place.plateCode ?? ''}`.toLowerCase(),
    }
  })
}

function renderEncyclopediaDetail(id: string, ctx: ModeContext): ReactNode {
  const place = getPlaceById(id)
  if (!place) return null
  return renderPlaceDetail(place, ctx, undefined, 'encyclopedia')
}

export const placesAdapter: ModeContentAdapter = {
  modeId: 'places',

  buildDeck(ctx) {
    const pool = poolForLevel(ctx.level)
    const items: DeckItem[] = []
    for (const place of pool) {
      for (const fact of factsForDeck(place, ctx.level)) {
        items.push(toDeckItem(place, fact))
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
