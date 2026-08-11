import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HomeScreen, type AppMode } from './components/HomeScreen'
import { ModePlaceholder } from './components/ModePlaceholder'
import { SetupScreen } from './components/SetupScreen'
import { clearProfile, loadProfile, saveProfile } from './storage/profile'
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

  function handleResetProfile(): void {
    clearProfile()
    setProfile(null)
    setScreen('setup')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <span className="brand">{t('app.name')}</span>
        {profile && screen !== 'setup' ? (
          <button type="button" className="ghost compact" onClick={handleResetProfile}>
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

        {screen === 'mode' && activeMode ? (
          <ModePlaceholder mode={activeMode} onBack={handleBackHome} />
        ) : null}
      </main>
    </div>
  )
}

export default App
