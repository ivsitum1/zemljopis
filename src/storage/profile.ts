import {
  DIFFICULTY_LEVELS,
  PROFILE_STORAGE_KEY,
  type DifficultyLevel,
  type UserProfile,
} from '../types/profile'

function isDifficultyLevel(value: unknown): value is DifficultyLevel {
  return typeof value === 'number' && (DIFFICULTY_LEVELS as number[]).includes(value)
}

export function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('name' in parsed) ||
      !('homeCityId' in parsed) ||
      !('level' in parsed)
    ) {
      return null
    }

    const candidate = parsed as Record<string, unknown>
    if (
      typeof candidate.name !== 'string' ||
      candidate.name.trim() === '' ||
      typeof candidate.homeCityId !== 'string' ||
      !isDifficultyLevel(candidate.level)
    ) {
      return null
    }

    return {
      name: candidate.name.trim(),
      homeCityId: candidate.homeCityId,
      level: candidate.level,
    }
  } catch {
    return null
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
}

export function clearProfile(): void {
  localStorage.removeItem(PROFILE_STORAGE_KEY)
}
