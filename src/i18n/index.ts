import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import ru from './ru.json'

const STORAGE_KEY = 'lang'

function detectLanguage(): string {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'en' || saved === 'ru') return saved
  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}

i18n.use(initReactI18next).init({
  lng: detectLanguage(),
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng: string) => {
  localStorage.setItem(STORAGE_KEY, lng)
  document.documentElement.lang = lng.startsWith('ru') ? 'ru' : 'en'
})

// Sync <html lang> on startup too (languageChanged only fires on later switches), so screen
// readers and the browser treat the page as the right language from the first paint.
document.documentElement.lang = (i18n.resolvedLanguage ?? 'en').startsWith('ru') ? 'ru' : 'en'

export default i18n
