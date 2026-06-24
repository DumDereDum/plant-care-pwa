import { useState } from 'react'
import db from './db'

interface Props {
  onAdded: () => void
}

export default function AddPlantForm({ onAdded }: Props) {
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
          Name{' '}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Watering interval (days){' '}
          <input
            type="number"
            min={1}
            value={intervalDays}
            onChange={(e) => setIntervalDays(Number(e.target.value))}
            required
          />
        </label>
      </div>
      <button type="submit">Add plant</button>
    </form>
  )
}
