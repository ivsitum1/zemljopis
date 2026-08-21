export type RoundLimit = 5 | 10 | 15 | 'endless'

export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

export function createDeckCursor<T>(items: T[], rng: () => number = Math.random) {
  let order = shuffle(items, rng)
  let index = 0

  return {
    remaining(): number {
      return order.length - index
    },
    draw(): T | undefined {
      if (index >= order.length) return undefined
      const item = order[index]
      index += 1
      return item
    },
    reset(): void {
      order = shuffle(items, rng)
      index = 0
    },
  }
}

export function shouldEndSession(answered: number, limit: RoundLimit): boolean {
  if (limit === 'endless') return false
  return answered >= limit
}
