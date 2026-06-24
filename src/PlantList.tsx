import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import db, { type Plant } from './db'

interface Props {
  refreshKey: number
}

export default function PlantList({ refreshKey }: Props) {
  const { t, i18n } = useTranslation()
  const [plants, setPlants] = useState<Plant[]>([])

  useEffect(() => {
    db.plants.toArray().then(setPlants)
  }, [refreshKey])

  if (plants.length === 0) return <p>{t('plantsEmpty')}</p>

  return (
    <ul>
      {plants.map((plant) => (
        <li key={plant.id}>
          <strong>{plant.name}</strong> — {t('waterEvery', { count: plant.wateringIntervalDays })}
          {plant.lastWateredAt && (
            <>, {t('lastWatered', {
              date: new Intl.DateTimeFormat(i18n.resolvedLanguage).format(plant.lastWateredAt),
            })}</>
          )}
        </li>
      ))}
    </ul>
  )
}
