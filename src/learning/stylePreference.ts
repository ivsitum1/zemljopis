import type { LearningStyle } from './types'

export const LEARNING_STYLE_STORAGE_KEY = 'obzor:learningStyle:v1'

const STYLES: ReadonlySet<LearningStyle> = new Set([
  'flashcards',
  'quiz',
  'encyclopedia',
])

function isLearningStyle(value: unknown): value is LearningStyle {
  return typeof value === 'string' && STYLES.has(value as LearningStyle)
}

function readStore(): Record<string, LearningStyle> {
  try {
    const raw = localStorage.getItem(LEARNING_STYLE_STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {}
    }
    const store: Record<string, LearningStyle> = {}
    for (const [modeId, style] of Object.entries(parsed)) {
      if (isLearningStyle(style)) {
        store[modeId] = style
      }
    }
    return store
  } catch {
    return {}
  }
}

export function loadLearningStyle(modeId: string): LearningStyle | null {
  return readStore()[modeId] ?? null
}

export function saveLearningStyle(modeId: string, style: LearningStyle): void {
  const store = readStore()
  store[modeId] = style
  localStorage.setItem(LEARNING_STYLE_STORAGE_KEY, JSON.stringify(store))
}
