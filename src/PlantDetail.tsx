import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { compressImage } from './compressImage'
import db, { type Plant } from './db'
import Button from './ui/Button'
import Card from './ui/Card'
import StatusPill from './ui/StatusPill'
import { LeafIcon } from './ui/icons'
import { daysUntilWatering, nextWateringDate } from './watering'
import styles from './PlantDetail.module.css'

interface Props {
  plantId: number
  refreshKey: number
  onClose: () => void
  onChanged: () => void
}

/**
 * Placeholder plant detail screen (T10.1). It already hosts the controls moved off
 * the list card — photo add/change and watering — so nothing is lost. T11.2 turns this
 * into the full detail view (edit, care-guide flip, history).
 */
export default function PlantDetail({ plantId, refreshKey, onClose, onChanged }: Props) {
  const { t, i18n } = useTranslation()
  const [plant, setPlant] = useState<Plant | undefined>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    db.plants.get(plantId).then(setPlant)
  }, [plantId, refreshKey])

  const photo = plant?.photo
  const photoUrl = useMemo(
    () => (photo ? URL.createObjectURL(photo) : null),
    [photo],
  )
  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl) }, [photoUrl])

  if (!plant) return null

  const days = daysUntilWatering(plant)
  const nextDate = nextWateringDate(plant)
  const fmt = (d: Date) => new Intl.DateTimeFormat(i18n.resolvedLanguage).format(d)

  async function handleWatered() {
    await db.plants.update(plantId, { lastWateredAt: new Date() })
    onChanged()
  }

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await db.plants.update(plantId, { photo: await compressImage(file) })
      onChanged()
    } catch {
      // unreadable file — ignore
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const statusText = !plant.lastWateredAt
    ? t('neverWatered')
    : days < 0
      ? t('overdueDays', { count: Math.abs(days) })
      : days === 0
        ? t('dueToday')
        : t('dueSoonDays', { count: days })

  const statusTone = !plant.lastWateredAt || days <= 0 ? 'coral' : 'amber'

  return (
    <div className={styles.detail}>
      <Button variant="secondary" className={styles.back} onClick={onClose}>
        {t('back')}
      </Button>

      <Card className={styles.card}>
        <div className={styles.photo}>
          {photoUrl ? (
            <img src={photoUrl} alt={plant.name} />
          ) : (
            <LeafIcon className={styles.leaf} />
          )}
        </div>

        <h2>{plant.name}</h2>
        <StatusPill tone={statusTone}>{statusText}</StatusPill>

        <div className={styles.meta}>
          {t('waterEvery', { count: plant.wateringIntervalDays })}
        </div>
        {nextDate && (
          <div className={styles.meta}>{t('nextWatering', { date: fmt(nextDate) })}</div>
        )}

        <div className={styles.actions}>
          <Button onClick={handleWatered}>{t('watered')}</Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            {t(plant.photo ? 'changePhoto' : 'addPhoto')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handlePhotoChange}
          />
        </div>

        <p className={styles.note}>{t('detailComingSoon')}</p>
      </Card>
    </div>
  )
}
