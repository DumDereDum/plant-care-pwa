import { useTranslation } from 'react-i18next'
import { AlertCircleIcon } from './icons'
import styles from './ScreenState.module.css'

interface Props {
  kind: 'loading' | 'error'
  onRetry?: () => void
}

export default function ScreenState({ kind, onRetry }: Props) {
  const { t } = useTranslation()

  if (kind === 'loading') {
    return (
      <div className={styles.box} role="status" aria-label={t('loadingHint')}>
        <span className={styles.spinner} aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className={styles.box} role="alert">
      <span className={styles.iconWrap}>
        <AlertCircleIcon className={styles.alertIcon} />
      </span>
      <h2 className={styles.heading}>{t('errorHeading')}</h2>
      <p className={styles.hint}>{t('errorHint')}</p>
      {onRetry && (
        <button type="button" className={styles.retryBtn} onClick={onRetry}>
          {t('errorRetry')}
        </button>
      )}
    </div>
  )
}
