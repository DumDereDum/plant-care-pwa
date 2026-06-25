import { useTranslation } from 'react-i18next'
import { CalendarIcon } from './ui/icons'
import styles from './CalendarScreen.module.css'

/** Placeholder until Phase 12 (T12.2) builds the real month-grid calendar. */
export default function CalendarScreen() {
  const { t } = useTranslation()

  return (
    <div className={styles.placeholder}>
      <span className={styles.icon}>
        <CalendarIcon className={styles.glyph} />
      </span>
      <h2>{t('calendarTitle')}</h2>
      <p className={styles.hint}>{t('calendarComingSoon')}</p>
    </div>
  )
}
