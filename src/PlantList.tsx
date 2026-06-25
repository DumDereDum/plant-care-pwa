import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import db, { type Plant } from './db'
import PlantCard from './PlantCard'
import ScreenState from './ui/ScreenState'
import { LeafIcon } from './ui/icons'
import styles from './PlantList.module.css'

interface Props {
  refreshKey: number
  onRefresh: () => void
  onOpenPlant: (id: number) => void
}

export default function PlantList({ refreshKey, onRefresh, onOpenPlant }: Props) {
  const { t } = useTranslation()
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    db.plants.toArray()
      .then((data) => { setPlants(data); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [refreshKey])

  if (loading) return <ScreenState kind="loading" />
  if (error) return <ScreenState kind="error" onRetry={onRefresh} />

  if (plants.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>
          <LeafIcon className={styles.emptyLeaf} />
        </span>
        <p className={styles.emptyText}>{t('plantsEmpty')}</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {plants.map((p) => (
        <PlantCard
          key={p.id}
          plant={p}
          onWatered={onRefresh}
          onOpen={() => onOpenPlant(p.id)}
        />
      ))}
    </div>
  )
}
