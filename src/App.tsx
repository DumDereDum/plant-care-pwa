import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import AddPlantForm from './AddPlantForm'
import BottomNav, { type Tab } from './BottomNav'
import CalendarScreen from './CalendarScreen'
import DataTransferPanel from './DataTransferPanel'
import InstallGuide from './InstallGuide'
import LanguageSwitcher from './LanguageSwitcher'
import PlantDetail from './PlantDetail'
import PlantList from './PlantList'
import TodayScreen from './TodayScreen'
import UpdatePrompt from './UpdatePrompt'
import styles from './App.module.css'

export default function App() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('today')
  const [detailId, setDetailId] = useState<number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = () => setRefreshKey((k) => k + 1)
  const changeTab = (next: Tab) => {
    setDetailId(null)
    setTab(next)
  }

  return (
    <>
      <main>
        <UpdatePrompt />
        <header className={styles.header}>
          <h1>{t('appTitle')}</h1>
          <LanguageSwitcher />
        </header>

        {tab === 'today' && <TodayScreen refreshKey={refreshKey} onRefresh={refresh} />}

        {tab === 'plants' &&
          (detailId !== null ? (
            <PlantDetail
              plantId={detailId}
              refreshKey={refreshKey}
              onClose={() => setDetailId(null)}
              onChanged={refresh}
            />
          ) : (
            <>
              <PlantList
                refreshKey={refreshKey}
                onRefresh={refresh}
                onOpenPlant={(id) => setDetailId(id)}
              />
              <h2>{t('addPlantHeading')}</h2>
              <AddPlantForm onAdded={refresh} />
              <DataTransferPanel onImported={refresh} />
            </>
          ))}

        {tab === 'calendar' && <CalendarScreen />}

        {tab === 'help' && <InstallGuide />}
      </main>

      <BottomNav active={tab} onChange={changeTab} />
    </>
  )
}
