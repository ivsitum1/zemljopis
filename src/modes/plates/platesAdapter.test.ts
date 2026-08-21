import { describe, expect, it } from 'vitest'
import { listPlateSeats } from '../../data/catalogue'
import type { ModeContext } from '../../learning/types'
import { poolForLevel, platesAdapter } from './platesAdapter'

const baseCtx: ModeContext = {
  profileName: 'Ana',
  homeCityId: 'zagreb',
  level: 1,
  language: 'hr',
}

describe('platesAdapter pools', () => {
  it('level ≤1 uses the six major codes', () => {
    const codes = poolForLevel(1).map((p) => p.plateCode).sort()
    expect(codes).toEqual(['OS', 'PU', 'RI', 'ST', 'ZD', 'ZG'])
  })

  it('level 2 uses the previous county-seat set (~20)', () => {
    const codes = poolForLevel(2).map((p) => p.plateCode!)
    expect(codes).toHaveLength(20)
    expect(codes).toContain('ZG')
    expect(codes).toContain('GS')
    expect(codes).not.toContain('NG') // full-list code, not in prior seat set
  })

  it('level ≥3 uses all plate seats', () => {
    const level3 = poolForLevel(3).length
    const level5 = poolForLevel(5).length
    expect(level3).toBeGreaterThan(20)
    expect(level5).toBe(level3)
  })

  it('buildDeck only includes codeToPlace below level 3', () => {
    const deck = platesAdapter.buildDeck({ ...baseCtx, level: 2 })
    expect(deck.every((item) => item.promptKind === 'codeToPlace')).toBe(true)
  })

  it('buildDeck includes both directions at level ≥3', () => {
    const deck = platesAdapter.buildDeck({ ...baseCtx, level: 3 })
    const kinds = new Set(deck.map((item) => item.promptKind))
    expect(kinds.has('codeToPlace')).toBe(true)
    expect(kinds.has('placeToCode')).toBe(true)
  })

  it('encyclopediaIndex lists every plate seat regardless of level', () => {
    const seats = listPlateSeats()
    const index = platesAdapter.encyclopediaIndex({ ...baseCtx, level: 1 })
    expect(index).toHaveLength(seats.length)
    expect(index.length).toBeGreaterThan(poolForLevel(1).length)
    expect(index.some((entry) => entry.id === 'ZG')).toBe(true)
    expect(index.some((entry) => entry.id === 'NG')).toBe(true)
  })

  it('buildChoices does not mutate deck payload', () => {
    const deck = platesAdapter.buildDeck(baseCtx)
    const item = deck[0]!
    const before = JSON.stringify(item.payload)
    platesAdapter.buildChoices(item, deck, baseCtx)
    expect(JSON.stringify(item.payload)).toBe(before)
  })
})
