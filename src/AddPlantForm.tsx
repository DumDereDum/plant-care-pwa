import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { catalogEntryToGuideData, type CatalogEntry } from './catalog'
import { compressImage, imageMimeType } from './compressImage'
import db, { type CareGuide } from './db'
import CatalogBrowser from './CatalogBrowser'
import Button from './ui/Button'
import Card from './ui/Card'
import { LeafIcon } from './ui/icons'
import styles from './AddPlantForm.module.css'

interface Props {
  onAdded: () => void
}

export default function AddPlantForm({ onAdded }: Props) {
  const { t, i18n } = useTranslation()
  const [name, setName] = useState('')
  const [intervalDays, setIntervalDays] = useState(7)
  const [fertilizeEnabled, setFertilizeEnabled] = useState(false)
  const [fertilizeIntervalDays, setFertilizeIntervalDays] = useState(14)
  const [catalogEntry, setCatalogEntry] = useState<CatalogEntry | null>(null)
  const [browserOpen, setBrowserOpen] = useState(false)
  const [photo, setPhoto] = useState<ArrayBuffer | null>(null)

  const todayStr = new Date().toISOString().slice(0, 10)
  const [lastWateredEnabled, setLastWateredEnabled] = useState(true)
  const [lastWateredDate, setLastWateredDate] = useState(todayStr)
  const [lastFertilizedEnabled, setLastFertilizedEnabled] = useState(false)
  const [lastFertilizedDate, setLastFertilizedDate] = useState(todayStr)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const previewUrl = useMemo(() => {
    if (!photo || photo.byteLength === 0) return null
    return URL.createObjectURL(new Blob([photo], { type: imageMimeType(photo) }))
  }, [photo])
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  function handleCatalogEntry(entry: CatalogEntry) {
    setCatalogEntry(entry)
    // Pre-fill name only when the field is still empty
    if (!name.trim()) setName(entry.commonName)
    if (entry.recommendedWateringIntervalDays) {
      setIntervalDays(entry.recommendedWateringIntervalDays)
    }
    if (entry.fertilizeIntervalDays) {
      setFertilizeEnabled(true)
      setFertilizeIntervalDays(entry.fertilizeIntervalDays)
    }
    setBrowserOpen(false)
  }

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setPhoto(await compressImage(file))
    } catch {
      // unreadable file — ignore
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    const lastWateredAt = lastWateredEnabled ? new Date(lastWateredDate) : null
    const lastFertilizedAt =
      fertilizeEnabled && lastFertilizedEnabled ? new Date(lastFertilizedDate) : undefined

    const plantId = (await db.plants.add({
      name: name.trim(),
      wateringIntervalDays: Math.max(1, Math.round(intervalDays)),
      lastWateredAt,
      fertilizeIntervalDays: fertilizeEnabled ? Math.max(7, Math.round(fertilizeIntervalDays)) : undefined,
      lastFertilizedAt,
      photo: photo ?? undefined,
    })) as number

    // Create history entries so the past care shows up in the log
    if (lastWateredAt) {
      await db.careLogs.add({ plantId, type: 'water', date: lastWateredAt })
    }
    if (lastFertilizedAt) {
      await db.careLogs.add({ plantId, type: 'fertilize', date: lastFertilizedAt })
    }

    if (catalogEntry) {
      const guideId = (await db.careGuides.add(
        catalogEntryToGuideData(catalogEntry, i18n.language) as CareGuide,
      )) as number
      await db.plants.update(plantId, { careGuideId: guideId })
    }

    setName('')
    setIntervalDays(7)
    setFertilizeEnabled(false)
    setFertilizeIntervalDays(14)
    setCatalogEntry(null)
    setPhoto(null)
    setLastWateredEnabled(true)
    setLastWateredDate(new Date().toISOString().slice(0, 10))
    setLastFertilizedEnabled(false)
    setLastFertilizedDate(new Date().toISOString().slice(0, 10))
    onAdded()
  }

  return (
    <>
    {browserOpen && (
      <CatalogBrowser
        onSelect={handleCatalogEntry}
        onAddManually={() => setBrowserOpen(false)}
        onClose={() => setBrowserOpen(false)}
      />
    )}
    <Card className={styles.card}>
      <div className={styles.photo} onClick={() => fileInputRef.current?.click()}>
        {previewUrl ? (
          <img src={previewUrl} alt="" />
        ) : (
          <LeafIcon className={styles.leaf} />
        )}
      </div>

      <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
        {t(photo ? 'changePhoto' : 'addPhoto')}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handlePhotoChange}
      />

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Species picker — opens the full catalog browser */}
        <div className={styles.field}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setBrowserOpen(true)}
          >
            {t('browseCatalog')}
          </Button>
          {catalogEntry && (
            <span className={styles.hint}>
              {t('selectedSpecies', { name: catalogEntry.commonName })}
            </span>
          )}
        </div>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>{t('labelName')}</span>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <div className={styles.field}>
          <div className={styles.sliderHeader}>
            <span className={styles.fieldLabel}>{t('labelInterval')}</span>
            <span className={styles.sliderValue}>{t('waterEvery', { count: intervalDays })}</span>
          </div>
          <input
            className={styles.slider}
            type="range"
            min={1}
            max={60}
            value={intervalDays}
            onChange={(e) => setIntervalDays(Number(e.target.value))}
            style={{
              background: `linear-gradient(to right, var(--color-primary) ${((intervalDays - 1) / 59) * 100}%, var(--color-border) ${((intervalDays - 1) / 59) * 100}%)`,
            }}
          />
        </div>

        {/* Last watered */}
        <div className={styles.dateGroup}>
          <label className={styles.toggle}>
            <input
              className={styles.toggleInput}
              type="checkbox"
              checked={lastWateredEnabled}
              onChange={(e) => setLastWateredEnabled(e.target.checked)}
            />
            <span className={styles.toggleText}>{t('labelLastWatered')}</span>
          </label>
          {lastWateredEnabled && (
            <input
              className={`${styles.input} ${styles.dateInput}`}
              type="date"
              value={lastWateredDate}
              max={todayStr}
              onChange={(e) => setLastWateredDate(e.target.value)}
            />
          )}
        </div>

        <label className={styles.toggle}>
          <input
            className={styles.toggleInput}
            type="checkbox"
            checked={fertilizeEnabled}
            onChange={(e) => {
              setFertilizeEnabled(e.target.checked)
              if (e.target.checked) setLastFertilizedEnabled(false)
            }}
          />
          <span className={styles.toggleText}>{t('trackFertilize')}</span>
        </label>

        {fertilizeEnabled && (
          <div className={styles.field}>
            <div className={styles.sliderHeader}>
              <span className={styles.fieldLabel}>{t('labelFertilizeInterval')}</span>
              <span className={styles.sliderValue}>{t('fertilizeEvery', { count: fertilizeIntervalDays })}</span>
            </div>
            <input
              className={styles.slider}
              type="range"
              min={7}
              max={90}
              value={fertilizeIntervalDays}
              onChange={(e) => setFertilizeIntervalDays(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, var(--color-primary) ${((fertilizeIntervalDays - 7) / 83) * 100}%, var(--color-border) ${((fertilizeIntervalDays - 7) / 83) * 100}%)`,
              }}
            />
          </div>
        )}

        {/* Last fertilized — only when tracking fertilize */}
        {fertilizeEnabled && (
          <div className={styles.dateGroup}>
            <label className={styles.toggle}>
              <input
                className={styles.toggleInput}
                type="checkbox"
                checked={lastFertilizedEnabled}
                onChange={(e) => setLastFertilizedEnabled(e.target.checked)}
              />
              <span className={styles.toggleText}>{t('labelLastFertilized')}</span>
            </label>
            {lastFertilizedEnabled && (
              <input
                className={`${styles.input} ${styles.dateInput}`}
                type="date"
                value={lastFertilizedDate}
                max={todayStr}
                onChange={(e) => setLastFertilizedDate(e.target.value)}
              />
            )}
          </div>
        )}

        <div className={styles.actions}>
          <Button type="submit">{t('submitAdd')}</Button>
        </div>
      </form>
    </Card>
    </>
  )
}
