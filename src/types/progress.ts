export type ProgressStatus = 'learning' | 'known' | 'hard'

export type ProgressEntry = {
  key: string
  mode: 'map' | 'plates' | 'places' | 'distance'
  entityId: string
  correct: number
  wrong: number
  streak: number
  nextDue: number
  lastSeen: number
  tags: string[]
  status: ProgressStatus
}

export type ProgressStore = {
  version: 1
  profileName: string
  entries: Record<string, ProgressEntry>
}

export const PROGRESS_STORAGE_KEY = 'zemljopis.progress'

export type CurriculumTopic = {
  id: string
  label: { hr: string; en: string }
}

/** Subset of GEO OŠ outcomes relevant to current MVP content. */
export const CURRICULUM_TOPICS: CurriculumTopic[] = [
  {
    id: 'GEO-OS-A.5.4',
    label: {
      hr: 'Hrvatska: regije i županije (A.5.4)',
      en: 'Croatia: regions and counties (A.5.4)',
    },
  },
  {
    id: 'GEO-OS-A.6.1',
    label: {
      hr: 'Hrvatska: država i uređenje (A.6.1)',
      en: 'Croatia: state and organisation (A.6.1)',
    },
  },
  {
    id: 'GEO-OS-B.5.2',
    label: {
      hr: 'Čitanje karte (B.5.2)',
      en: 'Reading maps (B.5.2)',
    },
  },
  {
    id: 'GEO-OS-B.5.3',
    label: {
      hr: 'Orijentacija u zavičaju (B.5.3)',
      en: 'Local orientation (B.5.3)',
    },
  },
]
