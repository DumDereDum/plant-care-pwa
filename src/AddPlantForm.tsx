import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import db from './db'

interface Props {
  onAdded: () => void
}

export default function AddPlantForm({ onAdded }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [intervalDays, setIntervalDays] = useState(7)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await db.plants.add({
      name: name.trim(),
      wateringIntervalDays: intervalDays,
      lastWateredAt: null,
    })
    setName('')
    setIntervalDays(7)
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
      <button type="submit">{t('submitAdd')}</button>
    </form>
  )
}
