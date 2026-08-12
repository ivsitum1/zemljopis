export type DifficultyLevel = 1 | 2 | 3 | 4 | 5

export type UserProfile = {
  name: string
  homeCityId: string
  level: DifficultyLevel
}

export const PROFILE_STORAGE_KEY = 'obzor.profile'

/** Pre-rebranding key. Read once, migrated, then removed. See loadProfile. */
export const LEGACY_PROFILE_STORAGE_KEY = 'zemljopis.profile'

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [1, 2, 3, 4, 5]
