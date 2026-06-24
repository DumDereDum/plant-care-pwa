import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { compressImage } from './compressImage'
import db from './db'

interface Props {
  onAdded: () => void
}

export default function AddPlantForm({ onAdded }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [intervalDays, setIntervalDays] = useState(7)
  const [photo, setPhoto] = useState<Blob | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const previewUrl = useMemo(
    () => (photo ? URL.createObjectURL(photo) : null),
    [photo],
  )
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setPhoto(await compressImage(file))
    } catch {
      // file was unreadable — leave the previous photo state untouched
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await db.plants.add({
      name: name.trim(),
      wateringIntervalDays: intervalDays,
      lastWateredAt: null,
      photo: photo ?? undefined,
    })
    setName('')
    setIntervalDays(7)
    setPhoto(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onAdded()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          {t('labelName')}{' '}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          {t('labelInterval')}{' '}
          <input
            type="number"
            min={1}
            value={intervalDays}
            onChange={(e) => setIntervalDays(Number(e.target.value))}
            required
          />
        </label>
      </div>
      <div>
        <label>
          {t('labelPhoto')}{' '}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
          />
        </label>
        {previewUrl && (
          <img src={previewUrl} alt="" width={80} height={80} style={{ objectFit: 'cover' }} />
        )}
      </div>
      <button type="submit">{t('submitAdd')}</button>
    </form>
  )
}
