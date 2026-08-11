import type { ProgressStatus } from '../types/progress'

/** Pure helpers extracted for unit tests (mirrors storage/progress rules). */
export function classifyForTest(input: {
  correct: number
  wrong: number
  streak: number
}): ProgressStatus {
  const total = input.correct + input.wrong
  if (total >= 4 && input.wrong >= 3 && input.correct / total < 0.5) {
    return 'hard'
  }
  if (input.streak >= 3 && input.correct >= 3) {
    return 'known'
  }
  return 'learning'
}

export function nextIntervalMsForTest(streak: number, correct: boolean): number {
  const DAY_MS = 24 * 60 * 60 * 1000
  if (!correct) {
    return 0
  }
  const steps = Math.min(streak, 5)
  return DAY_MS * Math.max(1, 2 ** (steps - 1))
}
