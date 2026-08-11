import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HomeScreen, type AppMode } from './components/HomeScreen'
import { ModePlaceholder } from './components/ModePlaceholder'
import { SetupScreen } from './components/SetupScreen'
import { MapMode } from './modes/map/MapMode'
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
      <header className="topbar">
        <span className="brand">{t('app.name')}</span>
        {profile && screen !== 'setup' ? (
          <button type="button" className="ghost compact" onClick={handleEditProfile}>
            {t('setup.changeProfile')}
          </button>
        ) : null}
      </header>

      <main>
        {screen === 'setup' ? (
          <SetupScreen initial={profile} onSave={handleSaveProfile} />
        ) : null}

        {screen === 'home' && profile ? (
          <HomeScreen
            profile={profile}
            onOpenMode={handleOpenMode}
            onEditProfile={handleEditProfile}
          />
        ) : null}

        {screen === 'mode' && activeMode === 'map' && profile ? (
          <MapMode level={profile.level} onBack={handleBackHome} />
        ) : null}

        {screen === 'mode' && activeMode === 'plates' && profile ? (
          <PlatesMode level={profile.level} onBack={handleBackHome} />
        ) : null}

        {screen === 'mode' && activeMode && activeMode !== 'map' && activeMode !== 'plates' ? (
          <ModePlaceholder mode={activeMode} onBack={handleBackHome} />
        ) : null}
      </main>
    </div>
  )
}

export default App
