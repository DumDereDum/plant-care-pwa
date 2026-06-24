import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import AddPlantForm from './AddPlantForm'
import LanguageSwitcher from './LanguageSwitcher'
import PlantList from './PlantList'
import UpdatePrompt from './UpdatePrompt'

export default function App() {
  const { t } = useTranslation()
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <main>
      <UpdatePrompt />
      <LanguageSwitcher />
      <h1>{t('appTitle')}</h1>
      <h2>{t('plantsHeading')}</h2>
      <PlantList refreshKey={refreshKey} />
      <h2>{t('addPlantHeading')}</h2>
      <AddPlantForm onAdded={() => setRefreshKey((k) => k + 1)} />
    </main>
  )
}
