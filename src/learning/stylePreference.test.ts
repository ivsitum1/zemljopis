// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest'
import { loadLearningStyle, saveLearningStyle } from './stylePreference'

const STORAGE_KEY = 'obzor:learningStyle:v1'

describe('learning style preference', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when nothing is stored for a mode', () => {
    expect(loadLearningStyle('map')).toBeNull()
  })

  it('round-trips save then load for a mode', () => {
    saveLearningStyle('plates', 'quiz')
    expect(loadLearningStyle('plates')).toBe('quiz')
  })

  it('keeps preferences per mode independently', () => {
    saveLearningStyle('map', 'flashcards')
    saveLearningStyle('places', 'encyclopedia')

    expect(loadLearningStyle('map')).toBe('flashcards')
    expect(loadLearningStyle('places')).toBe('encyclopedia')
    expect(loadLearningStyle('distance')).toBeNull()
  })

  it('overwrites an existing preference for the same mode', () => {
    saveLearningStyle('map', 'flashcards')
    saveLearningStyle('map', 'quiz')
    expect(loadLearningStyle('map')).toBe('quiz')
  })

  it('persists under the versioned storage key', () => {
    saveLearningStyle('map', 'encyclopedia')
    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!)).toEqual({ map: 'encyclopedia' })
  })

  it('returns null when stored JSON is unparseable', () => {
    localStorage.setItem(STORAGE_KEY, 'not json')
    expect(loadLearningStyle('map')).toBeNull()
  })

  it('returns null for an invalid style value', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ map: 'bingo' }))
    expect(loadLearningStyle('map')).toBeNull()
  })
})
