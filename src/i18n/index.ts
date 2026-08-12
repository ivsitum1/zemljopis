import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import hr from './locales/hr.json'

export type AppLanguage = 'hr' | 'en'

const LANGUAGE_STORAGE_KEY = 'obzor.language'
const LEGACY_LANGUAGE_STORAGE_KEY = 'zemljopis.language'

// Same namespace rename as the profile: read the old key once, move it over.
function readSavedLanguage(): AppLanguage | null {
  const current = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (current === 'hr' || current === 'en') {
    return current
  }

  const legacy = localStorage.getItem(LEGACY_LANGUAGE_STORAGE_KEY)
  localStorage.removeItem(LEGACY_LANGUAGE_STORAGE_KEY)
  if (legacy === 'hr' || legacy === 'en') {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, legacy)
    return legacy
  }

  return null
}

const savedLanguage = readSavedLanguage()

void i18n.use(initReactI18next).init({
  resources: {
    hr: { translation: hr },
    en: { translation: en },
  },
  lng: savedLanguage ?? 'hr',
  fallbackLng: 'hr',
  interpolation: {
    escapeValue: false,
  },
  // Avoid blank screen: no Suspense boundary around App yet.
  react: {
    useSuspense: false,
  },
})

export function setAppLanguage(language: AppLanguage): void {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  void i18n.changeLanguage(language)
}

export default i18n
