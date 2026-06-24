import Dexie, { type EntityTable } from 'dexie'

export interface Plant {
  id: number
  name: string
  wateringIntervalDays: number
  lastWateredAt: Date | null
  photo?: Blob
}

const db = new Dexie('plant-care-db') as Dexie & {
  plants: EntityTable<Plant, 'id'>
}

db.version(1).stores({
  plants: '++id, name, lastWateredAt',
})

export default db
