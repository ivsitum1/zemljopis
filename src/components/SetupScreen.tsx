import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { HOME_CITIES } from '../data/cities'
import { setAppLanguage, type AppLanguage } from '../i18n'
import { DIFFICULTY_LEVELS, type DifficultyLevel, type UserProfile } from '../types/profile'

type SetupScreenProps = {
  initial?: UserProfile | null
  onSave: (profile: UserProfile) => void
}

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
}

export function SetupScreen({ initial, onSave }: SetupScreenProps) {
  const { t, i18n } = useTranslation()
  const language = i18n.language.startsWith('en') ? 'en' : 'hr'
  const [name, setName] = useState(initial?.name ?? '')
  const [homeCityId, setHomeCityId] = useState(initial?.homeCityId ?? HOME_CITIES[0]?.id ?? 'zagreb')
  const [level, setLevel] = useState<DifficultyLevel>(initial?.level ?? 2)
  const [cityQuery, setCityQuery] = useState('')

  const cities = useMemo(
    () =>
      [...HOME_CITIES].sort((a, b) =>
        a.name.hr.localeCompare(b.name.hr, 'hr'),
      ),
    [],
  )

  const filteredCities = useMemo(() => {
    const q = normalizeSearch(cityQuery.trim())
    if (!q) return cities
    return cities.filter((city) => {
      const hr = normalizeSearch(city.name.hr)
      const en = normalizeSearch(city.name.en)
      return hr.includes(q) || en.includes(q)
    })
  }, [cities, cityQuery])

  useEffect(() => {
    if (filteredCities.length === 0) return
    if (filteredCities.some((city) => city.id === homeCityId)) return
    setHomeCityId(filteredCities[0]!.id)
  }, [filteredCities, homeCityId])

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || !homeCityId) {
      return
    }

    onSave({
      name: trimmed,
      homeCityId,
      level,
    })
  }

  function handleLanguageChange(next: AppLanguage): void {
    setAppLanguage(next)
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

        <div className="field">
          <span>{t('setup.homeLabel')}</span>
          <input
            type="search"
            value={cityQuery}
            onChange={(event) => setCityQuery(event.target.value)}
            placeholder={t('setup.homeSearchPlaceholder')}
            aria-label={t('setup.homeSearchPlaceholder')}
            autoComplete="off"
          />
          <select
            value={filteredCities.some((c) => c.id === homeCityId) ? homeCityId : ''}
            onChange={(event) => setHomeCityId(event.target.value)}
            size={Math.min(8, Math.max(4, filteredCities.length || 1))}
            className="city-picker"
            required
          >
            {filteredCities.length === 0 ? (
              <option value="" disabled>
                {t('setup.homeNoMatches')}
              </option>
            ) : (
              filteredCities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name[language]}
                </option>
              ))
            )}
          </select>
        </div>

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

        <button type="submit" className="primary" disabled={!homeCityId || filteredCities.length === 0}>
          {t('setup.save')}
        </button>
      </form>
    </section>
  )
}
