import { useTranslation } from 'react-i18next'
import type { AppMode } from './HomeScreen'

type ModePlaceholderProps = {
  mode: AppMode
  onBack: () => void
}

export function ModePlaceholder({ mode, onBack }: ModePlaceholderProps) {
  const { t } = useTranslation()

  return (
    <section className="panel">
      <button type="button" className="ghost" onClick={onBack}>
        ← {t('common.back')}
      </button>
      <h1>{t(`modes.${mode}.title`)}</h1>
      <p className="muted">{t(`modes.${mode}.desc`)}</p>
      <p>{t('home.comingSoon')}</p>
    </section>
  )
}
