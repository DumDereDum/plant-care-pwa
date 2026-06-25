import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { compressImage } from './compressImage'
import db, { type Plant } from './db'
import Button from './ui/Button'
import Card from './ui/Card'
import StatusPill from './ui/StatusPill'
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

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const blob = await compressImage(file)
      await db.plants.update(plant.id, { photo: blob })
      onWatered()
    } catch {
      // unreadable file — ignore
    }
  }

  const statusText =
    !plant.lastWateredAt
      ? t('neverWatered')
      : days < 0
        ? t('overdueDays', { count: Math.abs(days) })
        : days === 0
          ? t('dueToday')
          : t('dueSoonDays', { count: days })

  const statusTone = !plant.lastWateredAt || days <= 0 ? 'coral' : 'amber'

  return (
    <Card>
      {photoUrl && (
        <img src={photoUrl} alt={plant.name} width={80} height={80} style={{ objectFit: 'cover' }} />
      )}
      <strong>{plant.name}</strong>
      <div>{t('waterEvery', { count: plant.wateringIntervalDays })}</div>
      {nextDate && <div>{t('nextWatering', { date: fmt(nextDate) })}</div>}
      <div><StatusPill tone={statusTone}>{statusText}</StatusPill></div>
      <Button onClick={handleWatered}>{t('watered')}</Button>
      <label>
        {t(plant.photo ? 'changePhoto' : 'addPhoto')}
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handlePhotoChange}
        />
      </label>
    </Card>
  )
}
