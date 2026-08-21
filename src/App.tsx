import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HomeScreen, type AppMode } from './components/HomeScreen'
import { Logo } from './components/Logo'
import { OfflineBanner } from './components/OfflineBanner'
import { SetupScreen } from './components/SetupScreen'
import { DistanceMode } from './modes/distance/DistanceMode'
import { MapMode } from './modes/map/MapMode'
import { PlacesMode } from './modes/places/PlacesMode'
import { PlatesMode } from './modes/plates/PlatesMode'
import { loadProfile, saveProfile } from './storage/profile'
import type { UserProfile } from './types/profile'
import './App.css'

type Screen = 'setup' | 'home' | 'mode'

function App() {
  const { t } = useTranslation()
  const [profile, setProfile] = useState<UserProfile | null>(() => loadProfile())
  const [screen, setScreen] = useState<Screen>(() => (loadProfile() ? 'home' : 'setup'))
  const [activeMode, setActiveMode] = useState<AppMode | null>(null)

  function handleSaveProfile(next: UserProfile): void {
    saveProfile(next)
    setProfile(next)
    setScreen('home')
  }

  function handleEditProfile(): void {
    setScreen('setup')
  }

  function handleOpenMode(mode: AppMode): void {
    setActiveMode(mode)
    setScreen('mode')
  }

  function handleBackHome(): void {
    setActiveMode(null)
    setScreen('home')
  }

  return (
    <div className="app-shell">
      <div className="app-chrome">
        <OfflineBanner />
        <header className="topbar">
          <span className="brand">
            <Logo variant="lockup" size={26} title={t('app.name')} />
          </span>
          {profile && screen !== 'setup' ? (
            <button type="button" className="ghost compact" onClick={handleEditProfile}>
              {t('setup.changeProfile')}
            </button>
          ) : null}
        </header>
      </div>

      <main>
        {screen === 'setup' ? (
          <SetupScreen initial={profile} onSave={handleSaveProfile} />
        ) : null}

        {screen === 'home' && profile ? (
          <HomeScreen profile={profile} onOpenMode={handleOpenMode} />
        ) : null}

        {screen === 'mode' && activeMode === 'map' && profile ? (
          <MapMode
            level={profile.level}
            profileName={profile.name}
            homeCityId={profile.homeCityId}
            onBack={handleBackHome}
          />
        ) : null}

        {screen === 'mode' && activeMode === 'plates' && profile ? (
          <PlatesMode
            level={profile.level}
            profileName={profile.name}
            homeCityId={profile.homeCityId}
            onBack={handleBackHome}
          />
        ) : null}

        {screen === 'mode' && activeMode === 'places' && profile ? (
          <PlacesMode
            level={profile.level}
            profileName={profile.name}
            homeCityId={profile.homeCityId}
            onBack={handleBackHome}
          />
        ) : null}

        {screen === 'mode' && activeMode === 'distance' && profile ? (
          <DistanceMode
            level={profile.level}
            homeCityId={profile.homeCityId}
            profileName={profile.name}
            onBack={handleBackHome}
          />
        ) : null}
      </main>
    </div>
  )
}

export default App
