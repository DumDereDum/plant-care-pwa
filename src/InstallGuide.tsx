import { useTranslation } from 'react-i18next'

export default function InstallGuide() {
  const { t } = useTranslation()

  return (
    <section>
      <h2>{t('installGuideHeading')}</h2>
      <p>{t('installGuideIntro')}</p>

      <h3>{t('installIosHeading')}</h3>
      <ol>
        <li>{t('installIosStep1')}</li>
        <li>{t('installIosStep2')}</li>
        <li>{t('installIosStep3')}</li>
        <li>{t('installIosStep4')}</li>
      </ol>

      <h3>{t('installAndroidHeading')}</h3>
      <ol>
        <li>{t('installAndroidStep1')}</li>
        <li>{t('installAndroidStep2')}</li>
        <li>{t('installAndroidStep3')}</li>
      </ol>

      <p>{t('installGuideNote')}</p>
    </section>
  )
}
