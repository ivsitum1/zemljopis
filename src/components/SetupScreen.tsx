import { useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { HOME_CITIES } from '../data/cities'
import { setAppLanguage, type AppLanguage } from '../i18n'
import { DIFFICULTY_LEVELS, type DifficultyLevel, type UserProfile } from '../types/profile'

type SetupScreenProps = {
  initial?: UserProfile | null
  onSave: (profile: UserProfile) => void
}

export function SetupScreen({ initial, onSave }: SetupScreenProps) {
  const { t, i18n } = useTranslation()
  const [name, setName] = useState(initial?.name ?? '')
  const [homeCityId, setHomeCityId] = useState(initial?.homeCityId ?? HOME_CITIES[0]?.id ?? 'zagreb')
  const [level, setLevel] = useState<DifficultyLevel>(initial?.level ?? 2)

  const cities = useMemo(
    () =>
      [...HOME_CITIES].sort((a, b) =>
        a.name.hr.localeCompare(b.name.hr, 'hr'),
      ),
    [],
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      return
    }

    onSave({
      name: trimmed,
      homeCityId,
      level,
    })
  }

  function handleLanguageChange(language: AppLanguage): void {
    setAppLanguage(language)
  }

  return (
    <section className="panel setup">
      <h1>{t('setup.title')}</h1>
      <p className="muted">{t('app.tagline')}</p>

      <form className="stack" onSubmit={handleSubmit}>
        <label className="field">
          <span>{t('setup.nameLabel')}</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('setup.namePlaceholder')}
            autoComplete="nickname"
            required
          />
        </label>

        <label className="field">
          <span>{t('setup.homeLabel')}</span>
          <select value={homeCityId} onChange={(event) => setHomeCityId(event.target.value)}>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name[i18n.language === 'en' ? 'en' : 'hr']}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>{t('setup.levelLabel')}</span>
          <select
            value={level}
            onChange={(event) => setLevel(Number(event.target.value) as DifficultyLevel)}
          >
            {DIFFICULTY_LEVELS.map((value) => (
              <option key={value} value={value}>
                {t(`levels.${value}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>{t('setup.languageLabel')}</span>
          <select
            value={i18n.language.startsWith('en') ? 'en' : 'hr'}
            onChange={(event) => handleLanguageChange(event.target.value as AppLanguage)}
          >
            <option value="hr">{t('common.hr')}</option>
            <option value="en">{t('common.en')}</option>
          </select>
        </label>

        <button type="submit" className="primary">
          {t('setup.save')}
        </button>
      </form>
    </section>
  )
}
