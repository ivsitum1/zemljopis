import { useTranslation } from 'react-i18next'
import { LearningShell } from '../../learning/LearningShell'
import type { ModeContext } from '../../learning/types'
import type { DifficultyLevel } from '../../types/profile'
import { placesAdapter } from './placesAdapter'

type PlacesModeProps = {
  level: DifficultyLevel
  profileName: string
  homeCityId: string
  onBack: () => void
}

export function PlacesMode({ level, profileName, homeCityId, onBack }: PlacesModeProps) {
  const { i18n } = useTranslation()
  const language: ModeContext['language'] = i18n.language.startsWith('en') ? 'en' : 'hr'

  const ctx: ModeContext = {
    profileName,
    homeCityId,
    level,
    language,
  }

  return <LearningShell adapter={placesAdapter} ctx={ctx} onBack={onBack} />
}
