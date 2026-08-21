import type { ReactNode } from 'react'
import { COUNTIES, getCountyById, type County } from '../../data/counties'
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
import { CroatiaMap } from './CroatiaMap'

const MAP_TAGS = ['GEO-OS-B.5.2']

/** Coastal + major counties for level ≤ 1 (same set as pre-shell MapMode). */
const LEVEL_1_IDS = new Set(['gzg', 'zgz', 'sdz', 'pgz', 'obz', 'isz', 'zdz', 'dnz'])

/** Exclude a few harder inland counties at level 2. */
const LEVEL_2_EXCLUDED = new Set(['kzz2', 'psz', 'vpz'])

export type MapPayload = {
  countyId: string
  name: { hr: string; en: string }
  /** Plate code when available — used as quiz hint. */
  hint: { hr: string; en: string }
}

function isMapPayload(value: unknown): value is MapPayload {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return typeof record.countyId === 'string' && !!record.name && typeof record.name === 'object'
}

export function poolForLevel(level: ModeContext['level']): County[] {
  if (level <= 1) {
    return COUNTIES.filter((county) => LEVEL_1_IDS.has(county.id))
  }
  if (level === 2) {
    return COUNTIES.filter((county) => !LEVEL_2_EXCLUDED.has(county.id))
  }
  return COUNTIES
}

function toDeckItem(county: County): DeckItem {
  const plate = county.plateCode ?? ''
  return {
    entityId: county.id,
    promptKind: 'nameToCounty',
    tags: [...county.curriculumTags, ...MAP_TAGS],
    payload: {
      countyId: county.id,
      name: county.name,
      hint: plate ? { hr: plate, en: plate } : { hr: '', en: '' },
    } satisfies MapPayload,
  }
}

function payloadOf(item: DeckItem): MapPayload | null {
  return isMapPayload(item.payload) ? item.payload : null
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

function showLabels(level: ModeContext['level']): boolean {
  return level <= 1
}

function renderPrompt(item: DeckItem, ctx: ModeContext): ReactNode {
  const payload = payloadOf(item)
  if (!payload) return null

  return (
    <div className="stack learning-map-prompt">
      <p className="prompt">
        {t('map.findCounty', ctx.language, { name: payload.name[ctx.language] })}
      </p>
    </div>
  )
}

function renderCountyMap(
  countyId: string,
  ctx: ModeContext,
  options: {
    interactive?: boolean
    onSelect?: (id: string) => void
    correctId?: string | null
    wrongId?: string | null
    disabled?: boolean
  } = {},
): ReactNode {
  const {
    interactive = false,
    onSelect,
    correctId = null,
    wrongId = null,
    disabled = false,
  } = options

  return (
    <div className="map-frame">
      <CroatiaMap
        language={ctx.language}
        showLabels={showLabels(ctx.level)}
        highlightId={interactive ? (correctId ?? null) : countyId}
        correctId={correctId}
        wrongId={wrongId}
        onSelect={interactive && onSelect ? onSelect : () => undefined}
        disabled={!interactive || disabled}
      />
    </div>
  )
}

function renderDetail(item: DeckItem, ctx: ModeContext): ReactNode {
  const payload = payloadOf(item)
  if (!payload) return null

  const county = getCountyById(payload.countyId)
  const plate = county?.plateCode

  return (
    <div className="stack learning-map-detail">
      <h2>{payload.name[ctx.language]}</h2>
      {plate ? <p className="muted">{plate}</p> : null}
      {renderCountyMap(payload.countyId, ctx)}
      <p className="muted hint">{t('map.hint', ctx.language)}</p>
    </div>
  )
}

function buildChoices(item: DeckItem, _deck: DeckItem[], ctx: ModeContext): Choice[] {
  const payload = payloadOf(item)
  if (!payload) return []

  // Every county on the SVG is a valid tap target (wrong if not the target).
  return COUNTIES.map((county) => ({
    id: county.id,
    label: county.name[ctx.language],
    correct: county.id === payload.countyId,
  }))
}

function renderChoices(
  item: DeckItem,
  _choices: Choice[],
  ctx: ModeContext,
  ui: ChoiceRenderUi,
): ReactNode {
  const payload = payloadOf(item)
  if (!payload) return null

  const correctId = ui.status === 'correct' || ui.status === 'wrong' ? payload.countyId : null
  const wrongId = ui.status === 'wrong' ? ui.picked : null

  return (
    <div className="stack learning-map-choices">
      {renderCountyMap(payload.countyId, ctx, {
        interactive: true,
        onSelect: (id) => ui.onPick(id),
        correctId,
        wrongId,
        disabled: ui.status !== 'asking',
      })}
      <p className="muted hint">{t('map.hint', ctx.language)}</p>
    </div>
  )
}

function encyclopediaIndex(ctx: ModeContext): EncyclopediaEntry[] {
  return COUNTIES.map((county) => {
    const plate = county.plateCode ?? ''
    return {
      id: county.id,
      title: county.name[ctx.language],
      subtitle: plate || undefined,
      searchText: `${county.name.hr} ${county.name.en} ${plate}`.toLowerCase(),
    }
  })
}

function renderEncyclopediaDetail(id: string, ctx: ModeContext): ReactNode {
  const county = getCountyById(id)
  if (!county) return null

  return renderDetail(toDeckItem(county), ctx)
}

export const mapAdapter: ModeContentAdapter = {
  modeId: 'map',

  buildDeck(ctx) {
    return poolForLevel(ctx.level).map(toDeckItem)
  },

  renderPrompt,
  renderChoices,
  buildChoices,
  renderDetail,
  encyclopediaIndex,
  renderEncyclopediaDetail,
}
