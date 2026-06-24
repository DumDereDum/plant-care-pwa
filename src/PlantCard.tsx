import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import db, { type Plant } from './db'
import { daysUntilWatering, nextWateringDate } from './watering'

interface Props {
  plant: Plant
  onWatered: () => void
}

export default function PlantCard({ plant, onWatered }: Props) {
  const { t, i18n } = useTranslation()

  const photoUrl = useMemo(
    () => (plant.photo ? URL.createObjectURL(plant.photo) : null),
    [plant.photo],
  )
  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl) }, [photoUrl])

  const days = daysUntilWatering(plant)
  const nextDate = nextWateringDate(plant)
  const fmt = (d: Date) => new Intl.DateTimeFormat(i18n.resolvedLanguage).format(d)

  async function handleWatered() {
    await db.plants.update(plant.id, { lastWateredAt: new Date() })
    onWatered()
  }

  const statusText =
    !plant.lastWateredAt
      ? t('neverWatered')
      : days < 0
        ? t('overdueDays', { count: Math.abs(days) })
        : days === 0
          ? t('dueToday')
          : t('dueSoonDays', { count: days })

  return (
    <div>
      {photoUrl && <img src={photoUrl} alt={plant.name} width={80} height={80} />}
      <strong>{plant.name}</strong>
      <div>{t('waterEvery', { count: plant.wateringIntervalDays })}</div>
      {nextDate && <div>{t('nextWatering', { date: fmt(nextDate) })}</div>}
      <div>{statusText}</div>
      <button onClick={handleWatered}>{t('watered')}</button>
    </div>
  )
}
