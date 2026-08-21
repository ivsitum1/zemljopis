import { describe, expect, it } from 'vitest'
import type { ModeContext } from '../../learning/types'
import { COUNTIES } from '../../data/counties'
import { mapAdapter, poolForLevel } from './mapAdapter'

const baseCtx: ModeContext = {
  profileName: 'Ana',
  homeCityId: 'zagreb',
  level: 1,
  language: 'hr',
}

describe('mapAdapter pools', () => {
  it('level ≤1 uses the eight coastal/major counties', () => {
    const ids = poolForLevel(1).map((c) => c.id).sort()
    expect(ids).toEqual(['dnz', 'gzg', 'isz', 'obz', 'pgz', 'sdz', 'zdz', 'zgz'])
  })

  it('level 2 excludes three harder inland counties', () => {
    const ids = new Set(poolForLevel(2).map((c) => c.id))
    expect(ids.has('kzz2')).toBe(false)
    expect(ids.has('psz')).toBe(false)
    expect(ids.has('vpz')).toBe(false)
    expect(ids.size).toBe(COUNTIES.length - 3)
  })

  it('level ≥3 uses all counties', () => {
    expect(poolForLevel(3)).toHaveLength(COUNTIES.length)
    expect(poolForLevel(5)).toHaveLength(COUNTIES.length)
  })

  it('buildDeck uses nameToCounty prompts', () => {
    const deck = mapAdapter.buildDeck(baseCtx)
    expect(deck.length).toBe(8)
    expect(deck.every((item) => item.promptKind === 'nameToCounty')).toBe(true)
  })

  it('encyclopediaIndex lists every county', () => {
    const index = mapAdapter.encyclopediaIndex(baseCtx)
    expect(index).toHaveLength(COUNTIES.length)
    expect(index.some((entry) => entry.id === 'gzg')).toBe(true)
  })

  it('buildChoices marks the target county correct among all counties', () => {
    const deck = mapAdapter.buildDeck(baseCtx)
    const item = deck[0]!
    const choices = mapAdapter.buildChoices(item, deck, baseCtx)
    expect(choices).toHaveLength(COUNTIES.length)
    expect(choices.filter((c) => c.correct)).toHaveLength(1)
    expect(choices.some((c) => c.correct && c.id === item.entityId)).toBe(true)
  })
})
