import db, { type CareGuide, type Plant } from './db'

// Bumped to 2 with the careGuides table (DB v2). Older backups (schemaVersion 1, no
// careGuides) still import. A backup from a NEWER app version is rejected.
export const SCHEMA_VERSION = 2

interface ExportedPlant {
  id: number
  name: string
  wateringIntervalDays: number
  lastWateredAt: string | null
  photo?: string // base64 data URL
  careGuideId?: number
}

export interface ExportPayload {
  schemaVersion: number
  exportedAt: string
  plants: ExportedPlant[]
  /** Optional so v1 backups (which have no guides) still validate and import. */
  careGuides?: CareGuide[]
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function dataURLToBlob(dataURL: string): Blob {
  const [header, base64] = dataURL.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

export async function buildExportPayload(): Promise<ExportPayload> {
  const [plants, careGuides] = await Promise.all([
    db.plants.toArray(),
    db.careGuides.toArray(),
  ])

  const exportedPlants: ExportedPlant[] = await Promise.all(
    plants.map(async (p) => ({
      id: p.id,
      name: p.name,
      wateringIntervalDays: p.wateringIntervalDays,
      lastWateredAt: p.lastWateredAt ? p.lastWateredAt.toISOString() : null,
      photo: p.photo ? await blobToDataURL(p.photo) : undefined,
      careGuideId: p.careGuideId,
    })),
  )

  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    plants: exportedPlants,
    careGuides,
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
    photo: p.photo ? dataURLToBlob(p.photo) : undefined,
    careGuideId: p.careGuideId,
  }))

  // Present only in v2+ backups; absent in v1 backups (guides left untouched).
  const careGuides: CareGuide[] = Array.isArray(payload.careGuides) ? payload.careGuides : []

  // Atomic: restore plants and guides together so references stay consistent.
  await db.transaction('rw', db.plants, db.careGuides, async () => {
    await db.plants.bulkPut(plants)
    if (careGuides.length > 0) await db.careGuides.bulkPut(careGuides)
  })

  return { count: plants.length }
}
