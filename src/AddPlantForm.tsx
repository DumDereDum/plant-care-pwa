import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { compressImage } from './compressImage'
import db from './db'
import Button from './ui/Button'
import Card from './ui/Card'
import { LeafIcon } from './ui/icons'
import styles from './AddPlantForm.module.css'

interface Props {
  onAdded: () => void
}

export default function AddPlantForm({ onAdded }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [intervalDays, setIntervalDays] = useState(7)
  const [photo, setPhoto] = useState<Blob | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const previewUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo])
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

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
    await db.plants.add({
      name: name.trim(),
      wateringIntervalDays: Math.max(1, Math.round(intervalDays)),
      lastWateredAt: null,
      photo: photo ?? undefined,
    })
    setName('')
    setIntervalDays(7)
    setPhoto(null)
    onAdded()
  }

  return (
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
          <Button type="submit">{t('submitAdd')}</Button>
        </div>
      </form>
    </Card>
  )
}
