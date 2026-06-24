import { useTranslation } from 'react-i18next'

const LANGUAGES = ['en', 'ru'] as const

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div>
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          onClick={() => i18n.changeLanguage(lang)}
          disabled={i18n.resolvedLanguage === lang}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
