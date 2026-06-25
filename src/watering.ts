import db, { type Plant } from './db'

/** Calendar date only, time stripped to midnight. */
function startOfDay(d: Date): Date {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  return out
}

/**
 * Returns the next watering date, or null if the plant has never been watered.
 * The date is always normalised to midnight.
 */
export function nextWateringDate(plant: Plant): Date | null {
  if (!plant.lastWateredAt) return null
  const next = startOfDay(plant.lastWateredAt)
  next.setDate(next.getDate() + plant.wateringIntervalDays)
  return next
}

/**
 * Records a watering event: updates lastWateredAt and appends a careLog row.
 * Wrapped in a transaction so both writes succeed or both fail.
 */
export async function recordWatering(plantId: number): Promise<void> {
  const now = new Date()
  await db.transaction('rw', db.plants, db.careLogs, async () => {
    await db.plants.update(plantId, { lastWateredAt: now })
    await db.careLogs.add({ plantId, type: 'water' as const, date: now })
  })
}

export async function recordFertilize(plantId: number): Promise<void> {
  const now = new Date()
  await db.transaction('rw', db.plants, db.careLogs, async () => {
    await db.plants.update(plantId, { lastFertilizedAt: now })
    await db.careLogs.add({ plantId, type: 'fertilize' as const, date: now })
  })
}

export async function recordRepot(plantId: number): Promise<void> {
  await db.careLogs.add({ plantId, type: 'repot' as const, date: new Date() })
}

/**
 * Next fertilize date, or null if the plant has no fertilize interval or has never been
 * fertilized (caller treats null as "due now").
 */
export function nextFertilizeDate(plant: Plant): Date | null {
  if (!plant.fertilizeIntervalDays || !plant.lastFertilizedAt) return null
  const next = startOfDay(plant.lastFertilizedAt)
  next.setDate(next.getDate() + plant.fertilizeIntervalDays)
  return next
}

/**
 * Days until the next fertilize from today.
 * Returns null  when the plant is not tracking fertilize.
 * Returns 0     when interval is set but never fertilized (treat as due today).
 * Returns < 0   when overdue.
 */
export function daysUntilFertilize(plant: Plant): number | null {
  if (!plant.fertilizeIntervalDays) return null
  if (!plant.lastFertilizedAt) return 0
  const today = startOfDay(new Date())
  const next = nextFertilizeDate(plant)!
  return Math.round((next.getTime() - today.getTime()) / 86_400_000)
}

/**
 * Days until the next watering from today (midnight).
 * Negative  → overdue.
 * Zero      → due today (including never-watered plants).
 * Positive  → due in the future.
 */
export function daysUntilWatering(plant: Plant): number {
  if (!plant.lastWateredAt) return 0
  const today = startOfDay(new Date())
  const next = nextWateringDate(plant)!
  return Math.round((next.getTime() - today.getTime()) / 86_400_000)
}
