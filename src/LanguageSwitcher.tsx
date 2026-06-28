import { useTranslation } from 'react-i18next'
import styles from './LanguageSwitcher.module.css'

const LANGUAGES = ['en', 'ru'] as const

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className={styles.switcher} role="group" aria-label="Language">
      {LANGUAGES.map((lang) => {
        const active = i18n.resolvedLanguage === lang
        return (
          <button
            key={lang}
            type="button"
            className={`${styles.option}${active ? ` ${styles.active}` : ''}`}
            onClick={() => i18n.changeLanguage(lang)}
            aria-pressed={active}
          >
            {lang.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
