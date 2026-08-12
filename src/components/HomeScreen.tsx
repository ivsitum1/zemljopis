import { useTranslation } from 'react-i18next'
import { getCityById } from '../data/cities'
import type { UserProfile } from '../types/profile'
import { ModeIcon } from './ModeIcon'

export type AppMode = 'map' | 'plates' | 'places' | 'distance'

type HomeScreenProps = {
  profile: UserProfile
  onOpenMode: (mode: AppMode) => void
}

const MODES: AppMode[] = ['map', 'plates', 'places', 'distance']

export function HomeScreen({ profile, onOpenMode }: HomeScreenProps) {
  const { t, i18n } = useTranslation()
  const city = getCityById(profile.homeCityId)
  const cityName = city
    ? city.name[i18n.language.startsWith('en') ? 'en' : 'hr']
    : profile.homeCityId

  return (
    <section className="panel home">
      {/* The topbar already carries "change profile" on every screen; a second
          copy here was harmless while both were small, but at a 44px tap
          target the duplication is loud. One control, one place. */}
      <header className="home-header">
        <p className="eyebrow">{t('app.name')}</p>
        <h1>{t('home.welcome', { name: profile.name })}</h1>
        <p className="muted">
          {t('home.from', { city: cityName })} · {t(`levels.${profile.level}`)}
        </p>
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
            <ModeIcon mode={mode} />
            <span className="mode-card-text">
              <strong>{t(`modes.${mode}.title`)}</strong>
              <span>{t(`modes.${mode}.desc`)}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
