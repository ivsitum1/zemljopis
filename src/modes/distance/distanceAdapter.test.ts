import { describe, expect, it } from 'vitest'
import type { ModeContext } from '../../learning/types'
import {
  distanceAdapter,
  kindsForLevel,
  poolForLevel,
  resolveHome,
  type DistancePayload,
} from './distanceAdapter'

const baseCtx: ModeContext = {
  profileName: 'Ana',
  homeCityId: 'zagreb',
  level: 1,
  language: 'hr',
}

function payloadKind(item: { payload: unknown }): DistancePayload['kind'] | null {
  const payload = item.payload as DistancePayload | null
  return payload?.kind ?? null
}

describe('distanceAdapter', () => {
  it('resolves home from ctx.homeCityId', () => {
    expect(resolveHome(baseCtx).id).toBe('zagreb')
    expect(resolveHome({ ...baseCtx, homeCityId: 'split' }).id).toBe('split')
  })

  it('pool excludes home and keeps coordinates', () => {
    const pool = poolForLevel(baseCtx)
    expect(pool.every((place) => place.id !== 'zagreb')).toBe(true)
    expect(pool.length).toBeGreaterThan(20)
    expect(pool.every((place) => Number.isFinite(place.lat) && Number.isFinite(place.lon))).toBe(
      true,
    )
  })

  it('kinds unlock by level', () => {
    expect(kindsForLevel(1)).toEqual(['distance'])
    expect(kindsForLevel(2)).toEqual(['distance', 'direction'])
    expect(kindsForLevel(4)).toEqual(['distance', 'direction', 'closer'])
  })

  it('level 1 deck is distance-only', () => {
    const deck = distanceAdapter.buildDeck(baseCtx)
    expect(deck.length).toBeGreaterThan(0)
    expect(deck.every((item) => item.promptKind === 'distance')).toBe(true)
    expect(deck.every((item) => payloadKind(item) === 'distance')).toBe(true)
  })

  it('level 4 deck includes closer items', () => {
    const deck = distanceAdapter.buildDeck({ ...baseCtx, level: 4 })
    const kinds = new Set(deck.map((item) => payloadKind(item)))
    expect(kinds.has('distance')).toBe(true)
    expect(kinds.has('direction')).toBe(true)
    expect(kinds.has('closer')).toBe(true)
  })

  it('buildChoices marks one correct answer per kind', () => {
    const deck = distanceAdapter.buildDeck({ ...baseCtx, level: 4 })
    for (const kind of ['distance', 'direction', 'closer'] as const) {
      const item = deck.find((row) => payloadKind(row) === kind)
      expect(item).toBeTruthy()
      const choices = distanceAdapter.buildChoices(item!, deck, { ...baseCtx, level: 4 })
      expect(choices.filter((c) => c.correct)).toHaveLength(1)
    }
  })

  it('encyclopediaIndex lists pool places excluding home', () => {
    const index = distanceAdapter.encyclopediaIndex(baseCtx)
    expect(index.length).toBe(poolForLevel(baseCtx).length)
    expect(index.some((entry) => entry.id === 'zagreb')).toBe(false)
    expect(index.some((entry) => entry.id === 'split')).toBe(true)
  })

  it('direction hints explain compass sides without revealing the answer letter', () => {
    const deck = distanceAdapter.buildDeck({ ...baseCtx, level: 2 })
    const item = deck.find((row) => payloadKind(row) === 'direction')
    expect(item).toBeTruthy()
    const payload = item!.payload as DistancePayload & { kind: 'direction' }
    expect(payload.hint.hr).toMatch(/sjever/i)
    expect(payload.hint.hr).toMatch(/jug/i)
    expect(payload.hint.hr).toMatch(/istok/i)
    expect(payload.hint.hr).toMatch(/zapad/i)
    expect(payload.hint.hr).toMatch(/kompas/i)
    // Must not spell the correct choice name as a giveaway like "Odgovor je Jug"
    expect(payload.hint.hr).not.toMatch(/odgovor je/i)
  })
})
