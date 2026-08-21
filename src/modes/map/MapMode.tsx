import { useTranslation } from 'react-i18next'
import { LearningShell } from '../../learning/LearningShell'
import type { ModeContext } from '../../learning/types'
import type { DifficultyLevel } from '../../types/profile'
import { mapAdapter } from './mapAdapter'

type MapModeProps = {
  level: DifficultyLevel
  profileName: string
  homeCityId: string
  onBack: () => void
}

export function MapMode({ level, profileName, homeCityId, onBack }: MapModeProps) {
  const { i18n } = useTranslation()
  const language: ModeContext['language'] = i18n.language.startsWith('en') ? 'en' : 'hr'

  const ctx: ModeContext = {
    profileName,
    homeCityId,
    level,
    language,
  }

  return <LearningShell adapter={mapAdapter} ctx={ctx} onBack={onBack} />
}
