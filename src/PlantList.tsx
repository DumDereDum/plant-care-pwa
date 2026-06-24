import { useEffect, useState } from 'react'
import db, { type Plant } from './db'

interface Props {
  refreshKey: number
}

export default function PlantList({ refreshKey }: Props) {
  const [plants, setPlants] = useState<Plant[]>([])

  useEffect(() => {
    db.plants.toArray().then(setPlants)
  }, [refreshKey])

  if (plants.length === 0) return <p>No plants yet.</p>

  return (
    <ul>
      {plants.map((plant) => (
        <li key={plant.id}>
          <strong>{plant.name}</strong> — water every {plant.wateringIntervalDays} day(s)
          {plant.lastWateredAt && (
            <>, last watered {plant.lastWateredAt.toLocaleDateString()}</>
          )}
        </li>
      ))}
    </ul>
  )
}
