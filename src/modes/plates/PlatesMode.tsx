import { useTranslation } from 'react-i18next'
import { LearningShell } from '../../learning/LearningShell'
import type { ModeContext } from '../../learning/types'
import type { DifficultyLevel } from '../../types/profile'
import { platesAdapter } from './platesAdapter'

type PlatesModeProps = {
  level: DifficultyLevel
  profileName: string
  homeCityId: string
  onBack: () => void
}

export function PlatesMode({ level, profileName, homeCityId, onBack }: PlatesModeProps) {
  const { i18n } = useTranslation()
  const language: ModeContext['language'] = i18n.language.startsWith('en') ? 'en' : 'hr'

  const ctx: ModeContext = {
    profileName,
    homeCityId,
    level,
    language,
  }

  return <LearningShell adapter={platesAdapter} ctx={ctx} onBack={onBack} />
}
