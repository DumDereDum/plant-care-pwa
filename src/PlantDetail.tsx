import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
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

/** Plant detail — front face. T11.3 adds the flip to the care guide (back face). */
export default function PlantDetail({ plantId, refreshKey, onClose, onChanged }: Props) {
  const { t, i18n } = useTranslation()
  const [plant, setPlant] = useState<Plant | undefined>()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [intervalDays, setIntervalDays] = useState(7)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    db.plants.get(plantId).then(setPlant)
  }, [plantId, refreshKey])

  const photo = plant?.photo
  const photoUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo])
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

  function startEditing() {
    if (!plant) return
    setName(plant.name)
    setIntervalDays(plant.wateringIntervalDays)
    setEditing(true)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    await db.plants.update(plantId, {
      name: trimmed,
      wateringIntervalDays: Math.max(1, Math.round(intervalDays)),
    })
    setEditing(false)
    onChanged()
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

        {editing ? (
          <form className={styles.form} onSubmit={handleSave}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>{t('labelName')}</span>
              <input
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>{t('labelInterval')}</span>
              <input
                className={styles.input}
                type="number"
                min={1}
                value={intervalDays}
                onChange={(e) => setIntervalDays(Number(e.target.value))}
                required
              />
            </label>
            <div className={styles.actions}>
              <Button type="submit">{t('save')}</Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                {t('cancel')}
              </Button>
            </div>
          </form>
        ) : (
          <>
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
            </div>
            <div className={styles.actions}>
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                {t(plant.photo ? 'changePhoto' : 'addPhoto')}
              </Button>
              <Button variant="secondary" onClick={startEditing}>
                {t('edit')}
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handlePhotoChange}
            />
          </>
        )}
      </Card>
    </div>
  )
}
