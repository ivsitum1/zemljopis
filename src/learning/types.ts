import type { ReactNode } from 'react'

export type LearningStyle = 'flashcards' | 'quiz' | 'encyclopedia'

export type ModeContext = {
  profileName: string
  homeCityId: string
  level: 1 | 2 | 3 | 4 | 5
  language: 'hr' | 'en'
}

export type Choice = { id: string; label: string; correct: boolean }

export type ChoiceRenderUi = {
  onPick: (id: string) => void
  status: 'asking' | 'correct' | 'wrong'
  picked: string | null
}

export type DeckItem = {
  entityId: string
  promptKind: string
  tags?: string[]
  /** Opaque payload for adapters (county id, place id, distance round, …) */
  payload: unknown
}

export type EncyclopediaEntry = {
  id: string
  title: string
  subtitle?: string
  searchText: string
}

export type ModeContentAdapter = {
  modeId: 'map' | 'plates' | 'places' | 'distance'
  buildDeck: (ctx: ModeContext) => DeckItem[]
  renderPrompt: (item: DeckItem, ctx: ModeContext) => ReactNode
  renderChoices?: (
    item: DeckItem,
    choices: Choice[],
    ctx: ModeContext,
    ui: ChoiceRenderUi,
  ) => ReactNode
  buildChoices: (item: DeckItem, deck: DeckItem[], ctx: ModeContext) => Choice[]
  renderDetail: (item: DeckItem, ctx: ModeContext) => ReactNode
  encyclopediaIndex: (ctx: ModeContext) => EncyclopediaEntry[]
  renderEncyclopediaDetail: (id: string, ctx: ModeContext) => ReactNode
}

/** Re-export from deck — single source of truth for RoundLimit. */
export type { RoundLimit } from './deck'
