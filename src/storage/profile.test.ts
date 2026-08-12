// @vitest-environment happy-dom
// Only this file needs a DOM; the geo tests stay on the default node env.
import { beforeEach, describe, expect, it } from 'vitest'
import {
  LEGACY_PROFILE_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  type UserProfile,
} from '../types/profile'
import { clearProfile, loadProfile, saveProfile } from './profile'

const VALID: UserProfile = { name: 'Ana', homeCityId: 'split', level: 3 }

describe('loadProfile', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when nothing is stored', () => {
    expect(loadProfile()).toBeNull()
  })

  it('reads a profile written under the current key', () => {
    saveProfile(VALID)
    expect(loadProfile()).toEqual(VALID)
  })

  it('migrates a pre-rebrand profile and removes the old key', () => {
    localStorage.setItem(LEGACY_PROFILE_STORAGE_KEY, JSON.stringify(VALID))

    expect(loadProfile()).toEqual(VALID)
    expect(localStorage.getItem(PROFILE_STORAGE_KEY)).toBe(JSON.stringify(VALID))
    expect(localStorage.getItem(LEGACY_PROFILE_STORAGE_KEY)).toBeNull()
  })

  it('prefers the current key over a stale legacy one', () => {
    saveProfile(VALID)
    localStorage.setItem(
      LEGACY_PROFILE_STORAGE_KEY,
      JSON.stringify({ ...VALID, name: 'Stara', level: 1 }),
    )

    expect(loadProfile()?.name).toBe('Ana')
  })

  it('does not copy an invalid legacy profile across', () => {
    localStorage.setItem(LEGACY_PROFILE_STORAGE_KEY, JSON.stringify({ name: '', level: 9 }))

    expect(loadProfile()).toBeNull()
    expect(localStorage.getItem(PROFILE_STORAGE_KEY)).toBeNull()
  })

  it('survives unparseable stored data', () => {
    localStorage.setItem(PROFILE_STORAGE_KEY, 'not json')
    expect(loadProfile()).toBeNull()
  })

  it('clearProfile removes both keys', () => {
    saveProfile(VALID)
    localStorage.setItem(LEGACY_PROFILE_STORAGE_KEY, JSON.stringify(VALID))

    clearProfile()

    expect(localStorage.getItem(PROFILE_STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem(LEGACY_PROFILE_STORAGE_KEY)).toBeNull()
  })
})
