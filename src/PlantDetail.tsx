import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import CareGuideFace from './CareGuideFace'
import CareGuideEditForm from './CareGuideEditForm'
import { compressImage } from './compressImage'
import db, { type CareGuide, type CareLog, type Plant } from './db'
import Button from './ui/Button'
import Card from './ui/Card'
import StatusPill from './ui/StatusPill'
import { DropIcon, LeafIcon } from './ui/icons'
import { daysUntilWatering, nextWateringDate, recordWatering } from './watering'
import styles from './PlantDetail.module.css'

interface Props {
  plantId: number
  refreshKey: number
  onClose: () => void
  onChanged: () => void
}

type Face = 'front' | 'back' | 'edit'

export default function PlantDetail({ plantId, refreshKey, onClose, onChanged }: Props) {
  const { t, i18n } = useTranslation()
  const [plant, setPlant] = useState<Plant | undefined>()
  const [guide, setGuide] = useState<CareGuide | null>(null)
  const [history, setHistory] = useState<CareLog[]>([])
  const [face, setFace] = useState<Face>('front')
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [intervalDays, setIntervalDays] = useState(7)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    db.plants.get(plantId).then(setPlant)
  }, [plantId, refreshKey])

  useEffect(() => {
    db.careLogs
      .where('plantId').equals(plantId)
      .toArray()
      .then((logs) =>
        setHistory(
          logs.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5),
        ),
      )
  }, [plantId, refreshKey])

  useEffect(() => {
    async function load() {
      if (plant?.careGuideId != null) {
        const g = await db.careGuides.get(plant.careGuideId)
        setGuide(g ?? null)
      } else {
        setGuide(null)
      }
    }
    load()
  }, [plant?.careGuideId])

  const photo = plant?.photo
  const photoUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo])
  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl) }, [photoUrl])

  if (!plant) return null

  const days = daysUntilWatering(plant)
  const nextDate = nextWateringDate(plant)
  const fmt = (d: Date) => new Intl.DateTimeFormat(i18n.resolvedLanguage).format(d)

  async function handleWatered() {
    await recordWatering(plantId)
    onChanged()
  }

  async function handleDelete() {
    if (!window.confirm(t('deleteConfirm'))) return
    await db.transaction('rw', db.plants, db.careLogs, async () => {
      await db.plants.delete(plantId)
      await db.careLogs.where('plantId').equals(plantId).delete()
    })
    onClose()
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

  function handleGuideSaved(saved: CareGuide) {
    setGuide(saved)
    setFace('back')
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

      {face === 'front' && (
        <Card key="front" className={styles.card}>
          <div
            className={`${styles.photo}${editing ? ` ${styles.photoEditing}` : ''}`}
            onClick={editing ? () => fileInputRef.current?.click() : undefined}
          >
            {photoUrl ? (
              <img src={photoUrl} alt={plant.name} />
            ) : (
              <LeafIcon className={styles.leaf} />
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handlePhotoChange}
          />

          {editing ? (
            <form className={styles.form} onSubmit={handleSave}>
              <div className={styles.actions}>
                <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  {t(plant.photo ? 'changePhoto' : 'addPhoto')}
                </Button>
              </div>
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
                <Button variant="secondary" onClick={() => setFace('back')}>
                  {t('flipToGuide')}
                </Button>
              </div>

              {history.length > 0 && (
                <div className={styles.history}>
                  <h3 className={styles.historyTitle}>{t('historyHeading')}</h3>
                  <ul className={styles.historyList}>
                    {history.map((log) => (
                      <li key={log.id} className={styles.historyItem}>
                        <DropIcon className={styles.historyIcon} />
                        <span className={styles.historyDate}>
                          {new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          }).format(log.date)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={styles.deleteRow}>
                <Button variant="danger" onClick={handleDelete}>
                  {t('deletePlant')}
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      {face === 'back' && (
        <Card key="back" className={styles.card}>
          <CareGuideFace
            guide={guide}
            onFlip={() => setFace('front')}
            onEdit={() => setFace('edit')}
          />
        </Card>
      )}

      {face === 'edit' && (
        <Card key="edit" className={`${styles.card} ${styles.cardEdit}`}>
          <CareGuideEditForm
            plant={plant}
            guide={guide}
            onSaved={handleGuideSaved}
            onCancel={() => setFace('back')}
            onChanged={onChanged}
          />
        </Card>
      )}
    </div>
  )
}
