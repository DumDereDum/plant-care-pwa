import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import db, { type Plant } from './db'
import PlantCard from './PlantCard'

interface Props {
  refreshKey: number
  onRefresh: () => void
}

export default function PlantList({ refreshKey, onRefresh }: Props) {
  const { t } = useTranslation()
  const [plants, setPlants] = useState<Plant[]>([])

  useEffect(() => {
    db.plants.toArray().then(setPlants)
  }, [refreshKey])

  if (plants.length === 0) return <p>{t('plantsEmpty')}</p>

  return (
    <ul>
      {plants.map((p) => (
        <li key={p.id}>
          <PlantCard plant={p} onWatered={onRefresh} />
        </li>
      ))}
    </ul>
  )
}
