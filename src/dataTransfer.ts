import { imageMimeType } from './compressImage'
import db, { type CareGuide, type CareLog, type Plant } from './db'

// Bumped to 3 with the careLogs table (DB v3).
// v1 backups (no careGuides, no careLogs) still import.
// v2 backups (careGuides present, no careLogs) still import.
// A backup from a NEWER app version is rejected.
export const SCHEMA_VERSION = 3

interface ExportedPlant {
  id: number
  name: string
  wateringIntervalDays: number
  lastWateredAt: string | null
  photo?: string // base64 data URL
  careGuideId?: number
}

interface ExportedCareLog {
  id: number
  plantId: number
  type: 'water' | 'fertilize' | 'repot'
  date: string // ISO string — Date serialised for JSON
}

export interface ExportPayload {
  schemaVersion: number
  exportedAt: string
  plants: ExportedPlant[]
  /** Optional so v1 backups (no guides) still validate and import. */
  careGuides?: CareGuide[]
  /** Optional so v1/v2 backups (no logs) still validate and import. */
  careLogs?: ExportedCareLog[]
}

function bufToDataURL(buf: ArrayBuffer): Promise<string> {
  // Wrap in a Blob to use FileReader — preserves the correct MIME type
  // detected from the actual bytes (WebP vs JPEG).
  const blob = new Blob([buf], { type: imageMimeType(buf) })
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function dataURLToArrayBuffer(dataURL: string): ArrayBuffer {
  const [, base64] = dataURL.split(',')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

export async function buildExportPayload(): Promise<ExportPayload> {
  const [plants, careGuides, rawLogs] = await Promise.all([
    db.plants.toArray(),
    db.careGuides.toArray(),
    db.careLogs.toArray(),
  ])

  const exportedPlants: ExportedPlant[] = await Promise.all(
    plants.map(async (p) => ({
      id: p.id,
      name: p.name,
      wateringIntervalDays: p.wateringIntervalDays,
      lastWateredAt: p.lastWateredAt ? p.lastWateredAt.toISOString() : null,
      photo: p.photo && p.photo.byteLength > 0 ? await bufToDataURL(p.photo) : undefined,
      careGuideId: p.careGuideId,
    })),
  )

  const careLogs: ExportedCareLog[] = rawLogs.map((l) => ({
    id: l.id,
    plantId: l.plantId,
    type: l.type,
    date: l.date.toISOString(),
  }))

  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    plants: exportedPlants,
    careGuides,
    careLogs,
  }
}

export async function exportData(): Promise<void> {
  const payload = await buildExportPayload()
  const json = JSON.stringify(payload, null, 2)
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `plant-care-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importData(file: File): Promise<{ count: number }> {
  const text = await file.text()
  let payload: ExportPayload
  try {
    payload = JSON.parse(text) as ExportPayload
  } catch {
    throw new Error('invalidJson')
  }

  if (typeof payload.schemaVersion !== 'number' || !Array.isArray(payload.plants)) {
    throw new Error('invalidFormat')
  }
  if (payload.schemaVersion > SCHEMA_VERSION) {
    throw new Error('unsupportedVersion')
  }

  const plants: Plant[] = payload.plants.map((p) => ({
    id: p.id,
    name: p.name,
    wateringIntervalDays: p.wateringIntervalDays,
    lastWateredAt: p.lastWateredAt ? new Date(p.lastWateredAt) : null,
    photo: p.photo ? dataURLToArrayBuffer(p.photo) : undefined,
    careGuideId: p.careGuideId,
  }))

  // Present in v2+ backups; absent in v1 (guides left untouched).
  const careGuides: CareGuide[] = Array.isArray(payload.careGuides) ? payload.careGuides : []

  // Present in v3+ backups; absent in v1/v2 (logs left untouched).
  const careLogs: CareLog[] = Array.isArray(payload.careLogs)
    ? payload.careLogs.map((l) => ({ ...l, date: new Date(l.date) }))
    : []

  // Atomic: restore all three tables so cross-references stay consistent.
  await db.transaction('rw', db.plants, db.careGuides, db.careLogs, async () => {
    await db.plants.bulkPut(plants)
    if (careGuides.length > 0) await db.careGuides.bulkPut(careGuides)
    if (careLogs.length > 0) await db.careLogs.bulkPut(careLogs)
  })

  return { count: plants.length }
}
