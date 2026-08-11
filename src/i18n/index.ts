import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import hr from './locales/hr.json'

export type AppLanguage = 'hr' | 'en'

const savedLanguage = localStorage.getItem('zemljopis.language') as AppLanguage | null

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
  localStorage.setItem('zemljopis.language', language)
  void i18n.changeLanguage(language)
}

export default i18n
