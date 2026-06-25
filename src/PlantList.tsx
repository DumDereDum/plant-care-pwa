import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import db, { type Plant } from './db'
import PlantCard from './PlantCard'
import styles from './PlantList.module.css'

interface Props {
  refreshKey: number
  onRefresh: () => void
  onOpenPlant: (id: number) => void
}

export default function PlantList({ refreshKey, onRefresh, onOpenPlant }: Props) {
  const { t } = useTranslation()
  const [plants, setPlants] = useState<Plant[]>([])

  useEffect(() => {
    db.plants.toArray().then(setPlants)
  }, [refreshKey])

  if (plants.length === 0) return <p className={styles.empty}>{t('plantsEmpty')}</p>

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
