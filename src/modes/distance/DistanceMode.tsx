import { useTranslation } from 'react-i18next'
import { LearningShell } from '../../learning/LearningShell'
import type { ModeContext } from '../../learning/types'
import type { DifficultyLevel } from '../../types/profile'
import { distanceAdapter } from './distanceAdapter'

type DistanceModeProps = {
  level: DifficultyLevel
  homeCityId: string
  profileName: string
  onBack: () => void
}

export function DistanceMode({ level, homeCityId, profileName, onBack }: DistanceModeProps) {
  const { i18n } = useTranslation()
  const language: ModeContext['language'] = i18n.language.startsWith('en') ? 'en' : 'hr'

  const ctx: ModeContext = {
    profileName,
    homeCityId,
    level,
    language,
  }

  return <LearningShell adapter={distanceAdapter} ctx={ctx} onBack={onBack} />
}
