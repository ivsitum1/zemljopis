import { useTranslation } from 'react-i18next'
import { getCityById } from '../data/cities'
import type { UserProfile } from '../types/profile'

export type AppMode = 'map' | 'plates' | 'places' | 'distance'

type HomeScreenProps = {
  profile: UserProfile
  onOpenMode: (mode: AppMode) => void
  onEditProfile: () => void
}

const MODES: AppMode[] = ['map', 'plates', 'places', 'distance']

export function HomeScreen({ profile, onOpenMode, onEditProfile }: HomeScreenProps) {
  const { t, i18n } = useTranslation()
  const city = getCityById(profile.homeCityId)
  const cityName = city
    ? city.name[i18n.language.startsWith('en') ? 'en' : 'hr']
    : profile.homeCityId

  return (
    <section className="panel home">
      <header className="home-header">
        <div>
          <p className="eyebrow">{t('app.name')}</p>
          <h1>{t('home.welcome', { name: profile.name })}</h1>
          <p className="muted">
            {t('home.from', { city: cityName })} · {t(`levels.${profile.level}`)}
          </p>
        </div>
        <button type="button" className="ghost" onClick={onEditProfile}>
          {t('setup.changeProfile')}
        </button>
      </header>

      <h2>{t('home.chooseMode')}</h2>
      <div className="mode-grid">
        {MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            className="mode-card"
            onClick={() => onOpenMode(mode)}
          >
            <strong>{t(`modes.${mode}.title`)}</strong>
            <span>{t(`modes.${mode}.desc`)}</span>
            <em>{t('home.comingSoon')}</em>
          </button>
        ))}
      </div>
    </section>
  )
}
