import { describe, expect, it } from 'vitest'
import { classifyForTest, nextIntervalMsForTest } from './progressTestables'

describe('progress rules', () => {
  it('marks known after streak of 3 with enough corrects', () => {
    expect(
      classifyForTest({ correct: 3, wrong: 0, streak: 3 }),
    ).toBe('known')
  })

  it('marks hard when many wrongs and low accuracy', () => {
    expect(
      classifyForTest({ correct: 1, wrong: 4, streak: 0 }),
    ).toBe('hard')
  })

  it('grows review interval with streak', () => {
    expect(nextIntervalMsForTest(1, true)).toBe(24 * 60 * 60 * 1000)
    expect(nextIntervalMsForTest(3, true)).toBe(4 * 24 * 60 * 60 * 1000)
    expect(nextIntervalMsForTest(2, false)).toBe(0)
  })
})
