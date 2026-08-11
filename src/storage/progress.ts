import {
  PROGRESS_STORAGE_KEY,
  type ProgressEntry,
  type ProgressStatus,
  type ProgressStore,
} from '../types/progress'
import { classifyForTest, nextIntervalMsForTest } from './progressTestables'

function emptyStore(profileName: string): ProgressStore {
  return { version: 1, profileName, entries: {} }
}

export function progressKey(
  mode: ProgressEntry['mode'],
  entityId: string,
): string {
  return `${mode}:${entityId}`
}

export function loadProgress(profileName: string): ProgressStore {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY)
    if (!raw) {
      return emptyStore(profileName)
    }
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('version' in parsed) ||
      !('entries' in parsed)
    ) {
      return emptyStore(profileName)
    }
    const store = parsed as ProgressStore
    if (store.profileName !== profileName) {
      return emptyStore(profileName)
    }
    return store
  } catch {
    return emptyStore(profileName)
  }
}

export function saveProgress(store: ProgressStore): void {
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(store))
}

export function recordAnswer(input: {
  profileName: string
  mode: ProgressEntry['mode']
  entityId: string
  correct: boolean
  tags?: string[]
  now?: number
}): ProgressEntry {
  const now = input.now ?? Date.now()
  const store = loadProgress(input.profileName)
  const key = progressKey(input.mode, input.entityId)
  const existing = store.entries[key]

  const base = existing
    ? {
        ...existing,
        correct: existing.correct + (input.correct ? 1 : 0),
        wrong: existing.wrong + (input.correct ? 0 : 1),
        streak: input.correct ? existing.streak + 1 : 0,
        lastSeen: now,
        tags: Array.from(new Set([...(existing.tags ?? []), ...(input.tags ?? [])])),
        nextDue: now,
      }
    : {
        key,
        mode: input.mode,
        entityId: input.entityId,
        correct: input.correct ? 1 : 0,
        wrong: input.correct ? 0 : 1,
        streak: input.correct ? 1 : 0,
        lastSeen: now,
        tags: input.tags ?? [],
        nextDue: now,
      }

  base.nextDue = now + nextIntervalMsForTest(base.streak, input.correct)
  const entry: ProgressEntry = {
    key: base.key,
    mode: base.mode,
    entityId: base.entityId,
    correct: base.correct,
    wrong: base.wrong,
    streak: base.streak,
    lastSeen: base.lastSeen,
    tags: base.tags,
    nextDue: base.nextDue,
    status: classifyForTest(base),
  }
  store.entries[key] = entry
  saveProgress(store)
  return entry
}

export function summarizeProgress(profileName: string): {
  known: number
  learning: number
  hard: number
  due: number
  byMode: Record<ProgressEntry['mode'], { known: number; learning: number; hard: number }>
} {
  const store = loadProgress(profileName)
  const now = Date.now()
  const summary = {
    known: 0,
    learning: 0,
    hard: 0,
    due: 0,
    byMode: {
      map: { known: 0, learning: 0, hard: 0 },
      plates: { known: 0, learning: 0, hard: 0 },
      places: { known: 0, learning: 0, hard: 0 },
      distance: { known: 0, learning: 0, hard: 0 },
    },
  }

  for (const entry of Object.values(store.entries)) {
    summary[entry.status] += 1
    summary.byMode[entry.mode][entry.status] += 1
    if (entry.nextDue <= now && entry.status !== 'known') {
      summary.due += 1
    }
  }

  return summary
}

export function listEntries(
  profileName: string,
  filter?: { mode?: ProgressEntry['mode']; tag?: string; status?: ProgressStatus },
): ProgressEntry[] {
  const store = loadProgress(profileName)
  return Object.values(store.entries)
    .filter((entry) => (filter?.mode ? entry.mode === filter.mode : true))
    .filter((entry) => (filter?.status ? entry.status === filter.status : true))
    .filter((entry) => (filter?.tag ? entry.tags.includes(filter.tag) : true))
    .sort((a, b) => a.nextDue - b.nextDue)
}

/** Prefer due / hard items, then unseen, then random from pool. */
export function pickWeightedId(
  profileName: string,
  mode: ProgressEntry['mode'],
  candidateIds: string[],
  excludeId?: string,
): string {
  const pool = candidateIds.filter((id) => id !== excludeId)
  if (pool.length === 0) {
    return candidateIds[0] ?? ''
  }

  const store = loadProgress(profileName)
  const now = Date.now()
  const due = pool.filter((id) => {
    const entry = store.entries[progressKey(mode, id)]
    return entry && entry.nextDue <= now && entry.status !== 'known'
  })
  if (due.length > 0) {
    return due[Math.floor(Math.random() * due.length)]!
  }

  const hard = pool.filter((id) => store.entries[progressKey(mode, id)]?.status === 'hard')
  if (hard.length > 0 && Math.random() < 0.55) {
    return hard[Math.floor(Math.random() * hard.length)]!
  }

  const unseen = pool.filter((id) => !store.entries[progressKey(mode, id)])
  if (unseen.length > 0) {
    return unseen[Math.floor(Math.random() * unseen.length)]!
  }

  return pool[Math.floor(Math.random() * pool.length)]!
}
