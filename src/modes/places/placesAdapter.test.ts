import { describe, expect, it } from 'vitest'
import type { ModeContext } from '../../learning/types'
import { poolForLevel, placesAdapter, showAdvancedFacts } from './placesAdapter'

const baseCtx: ModeContext = {
  profileName: 'Ana',
  homeCityId: 'zagreb',
  level: 1,
  language: 'hr',
}

describe('placesAdapter pools', () => {
  it('level ≤1 uses the six major cities with facts', () => {
    const ids = poolForLevel(1).map((p) => p.id).sort()
    expect(ids).toEqual(['osijek', 'pula', 'rijeka', 'split', 'zadar', 'zagreb'])
  })

  it('level ≥2 includes all fact-bearing places', () => {
    const level2 = poolForLevel(2).length
    const level5 = poolForLevel(5).length
    expect(level2).toBeGreaterThan(6)
    expect(level5).toBe(level2)
  })

  it('buildDeck uses factToPlace prompts', () => {
    const deck = placesAdapter.buildDeck(baseCtx)
    expect(deck.length).toBeGreaterThan(0)
    expect(deck.every((item) => item.promptKind === 'factToPlace')).toBe(true)
  })

  it('buildDeck grows at level ≥3 when places have advanced facts', () => {
    const level1 = placesAdapter.buildDeck({ ...baseCtx, level: 1 }).length
    const level3 = placesAdapter.buildDeck({ ...baseCtx, level: 3 }).length
    expect(level3).toBeGreaterThan(level1)
  })

  it('encyclopediaIndex lists catalogue places', () => {
    const index = placesAdapter.encyclopediaIndex(baseCtx)
    expect(index.length).toBeGreaterThan(20)
    expect(index.some((entry) => entry.id === 'zagreb')).toBe(true)
  })

  it('encyclopedia detail shows advanced facts at any profile level', () => {
    expect(showAdvancedFacts(1, 'encyclopedia')).toBe(true)
    expect(showAdvancedFacts(2, 'encyclopedia')).toBe(true)
    expect(showAdvancedFacts(1, 'learning')).toBe(false)
    expect(showAdvancedFacts(3, 'learning')).toBe(true)
  })

  it('buildChoices marks the target place correct', () => {
    const deck = placesAdapter.buildDeck(baseCtx)
    const item = deck[0]!
    const choices = placesAdapter.buildChoices(item, deck, baseCtx)
    expect(choices.some((c) => c.correct && c.id === item.entityId)).toBe(true)
    expect(choices.filter((c) => c.correct)).toHaveLength(1)
  })
})
