import {
  DIFFICULTY_LEVELS,
  LEGACY_PROFILE_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  type DifficultyLevel,
  type UserProfile,
} from '../types/profile'

function isDifficultyLevel(value: unknown): value is DifficultyLevel {
  return typeof value === 'number' && (DIFFICULTY_LEVELS as number[]).includes(value)
}

export function loadProfile(): UserProfile | null {
  try {
    // The rebrand renamed the storage namespace. Anyone who used the app
    // before it would otherwise land back on the setup screen and lose their
    // home city and level, so the old key is read once and moved across. The
    // value still goes through the validation below, because a key written by
    // an older build is no more trustworthy than any other stored input.
    let raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    let migrated = false
    if (!raw) {
      raw = localStorage.getItem(LEGACY_PROFILE_STORAGE_KEY)
      migrated = raw !== null
    }

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

    const profile: UserProfile = {
      name: candidate.name.trim(),
      homeCityId: candidate.homeCityId,
      level: candidate.level,
    }

    // Only rewrite once the value has proven valid, so a corrupt legacy entry
    // is dropped rather than copied into the new key.
    if (migrated) {
      saveProfile(profile)
      localStorage.removeItem(LEGACY_PROFILE_STORAGE_KEY)
    }

    return profile
  } catch {
    return null
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
}

export function clearProfile(): void {
  localStorage.removeItem(PROFILE_STORAGE_KEY)
  localStorage.removeItem(LEGACY_PROFILE_STORAGE_KEY)
}
