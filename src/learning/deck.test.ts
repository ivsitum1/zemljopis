import { describe, expect, it } from 'vitest'
import { createDeckCursor, shouldEndSession, shuffle } from './deck'

describe('shuffle', () => {
  it('preserves elements', () => {
    const input = [1, 2, 3, 4]
    expect(shuffle(input, () => 0).sort()).toEqual(input)
  })
})

describe('createDeckCursor', () => {
  it('does not repeat until exhausted', () => {
    const cursor = createDeckCursor(['a', 'b', 'c'], () => 0)
    const seen = [cursor.draw(), cursor.draw(), cursor.draw()]
    expect(seen.sort()).toEqual(['a', 'b', 'c'])
    expect(cursor.draw()).toBeUndefined()
  })
})

describe('shouldEndSession', () => {
  it('ends at fixed limits and never for endless', () => {
    expect(shouldEndSession(5, 5)).toBe(true)
    expect(shouldEndSession(4, 5)).toBe(false)
    expect(shouldEndSession(100, 'endless')).toBe(false)
  })
})
