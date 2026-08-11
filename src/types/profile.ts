export type DifficultyLevel = 1 | 2 | 3 | 4 | 5

export type UserProfile = {
  name: string
  homeCityId: string
  level: DifficultyLevel
}

export const PROFILE_STORAGE_KEY = 'zemljopis.profile'

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [1, 2, 3, 4, 5]
