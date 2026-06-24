import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import AddPlantForm from './AddPlantForm'
import LanguageSwitcher from './LanguageSwitcher'
import PlantList from './PlantList'
import TodayScreen from './TodayScreen'
import UpdatePrompt from './UpdatePrompt'

type Tab = 'today' | 'plants'

export default function App() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('today')
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = () => setRefreshKey((k) => k + 1)

  return (
    <main>
      <UpdatePrompt />
      <LanguageSwitcher />
      <h1>{t('appTitle')}</h1>
      <nav>
        <button onClick={() => setTab('today')} disabled={tab === 'today'}>
          {t('tabToday')}
        </button>
        <button onClick={() => setTab('plants')} disabled={tab === 'plants'}>
          {t('tabPlants')}
        </button>
      </nav>
      {tab === 'today' && (
        <TodayScreen refreshKey={refreshKey} onRefresh={refresh} />
      )}
      {tab === 'plants' && (
        <>
          <PlantList refreshKey={refreshKey} onRefresh={refresh} />
          <h2>{t('addPlantHeading')}</h2>
          <AddPlantForm onAdded={refresh} />
        </>
      )}
    </main>
  )
}
