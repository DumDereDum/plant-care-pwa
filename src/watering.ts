import type { Plant } from './db'

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
