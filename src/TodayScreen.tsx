import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import db, { type Plant } from './db'
import PlantCard from './PlantCard'
import { daysUntilWatering } from './watering'

interface Props {
  refreshKey: number
  onRefresh: () => void
}

export default function TodayScreen({ refreshKey, onRefresh }: Props) {
  const { t } = useTranslation()
  const [plants, setPlants] = useState<Plant[]>([])

  useEffect(() => {
    db.plants.toArray().then(setPlants)
  }, [refreshKey])

  if (plants.length === 0) return <p>{t('plantsEmpty')}</p>

  const overdue = plants.filter((p) => daysUntilWatering(p) < 0)
  const dueToday = plants.filter((p) => daysUntilWatering(p) === 0)
  const dueSoon = plants.filter((p) => daysUntilWatering(p) > 0)

  return (
    <div>
      {overdue.length > 0 && (
        <section>
          <h3>{t('overdueHeading')}</h3>
          {overdue.map((p) => (
            <PlantCard key={p.id} plant={p} onWatered={onRefresh} />
          ))}
        </section>
      )}
      {dueToday.length > 0 && (
        <section>
          <h3>{t('dueTodayHeading')}</h3>
          {dueToday.map((p) => (
            <PlantCard key={p.id} plant={p} onWatered={onRefresh} />
          ))}
        </section>
      )}
      {dueSoon.length > 0 && (
        <section>
          <h3>{t('dueSoonHeading')}</h3>
          {dueSoon.map((p) => (
            <PlantCard key={p.id} plant={p} onWatered={onRefresh} />
          ))}
        </section>
      )}
    </div>
  )
}
