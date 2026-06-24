import { useRegisterSW } from 'virtual:pwa-register/react'
import { useTranslation } from 'react-i18next'

export default function UpdatePrompt() {
  const { t } = useTranslation()
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div>
      <span>{t('updateAvailable')}</span>{' '}
      <button onClick={() => updateServiceWorker(true)}>{t('updateNow')}</button>
    </div>
  )
}
