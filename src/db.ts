import Dexie, { type EntityTable } from 'dexie'

export interface CareLog {
  id: number
  plantId: number
  type: 'water' | 'fertilize' | 'repot'
  date: Date
}

export interface Plant {
  id: number
  name: string
  wateringIntervalDays: number
  lastWateredAt: Date | null
  /** When set, the app reminds to fertilize on this cycle (days). Undefined = not tracking. */
  fertilizeIntervalDays?: number
  /** Updated each time a fertilize event is recorded. Undefined = never fertilized. */
  lastFertilizedAt?: Date | null
  /**
   * Stored as ArrayBuffer (not Blob) to survive IndexedDB serialization on
   * iOS Safari and Android WebView.  When Dexie updates any field in a record
   * it re-serializes the whole object through the structured-clone algorithm;
   * Blobs silently lose their data on WebKit/Blink mobile during that pass,
   * while ArrayBuffers serialize correctly on every platform.
   */
  photo?: ArrayBuffer
  /** Optional link to a reusable care guide (CareGuide.id). Undefined = no guide yet. */
  careGuideId?: number
}

/** 1–5 rating used for light, water, humidity and difficulty. */
export type Rating = 1 | 2 | 3 | 4 | 5

/**
 * Passive, game-style trait badges shown on a care guide. Open, extensible set: the known
 * keys are listed in `KNOWN_PERKS`, but the field is stored as plain strings so a future
 * bundled/AI catalog can add new perks WITHOUT breaking older builds. Each key maps to an
 * icon + i18n label + tone (good | bad | neutral) in the UI layer (T11.3). Pet/child safety
 * lives here as the negative perks (toxicCats / toxicDogs / unsafeChildren).
 */
export type PerkKey =
  | 'toxicCats'
  | 'toxicDogs'
  | 'unsafeChildren'
  | 'allergenic'
  | 'airPurifying'
  | 'oxygenBoost'
  | 'dustCollecting'

export const KNOWN_PERKS: PerkKey[] = [
  'toxicCats',
  'toxicDogs',
  'unsafeChildren',
  'allergenic',
  'airPurifying',
  'oxygenBoost',
  'dustCollecting',
]

/**
 * Care recommendations for a plant. Standalone and reusable: a guide is NOT bound to a
 * single plant — plants reference it via `Plant.careGuideId`, so many plants can share one
 * guide and a bundled/AI catalog can seed guides later (Phase 14). Every value is an optional
 * placeholder to be filled in later.
 */
export interface CareGuide {
  id: number
  /** Common/Latin species name, free text for now. */
  species?: string
  light?: Rating // suns
  water?: Rating // drops (thirstiness)
  humidity?: Rating
  difficulty?: Rating
  /** Comfort temperature range, °C. */
  tempMin?: number
  tempMax?: number
  /** Passive trait badges; `PerkKey` values plus forward-compatible unknowns. */
  perks?: string[]
  /** Recommended watering interval; a plant may follow it or keep its own. */
  recommendedWateringIntervalDays?: number
  description?: string
  careTips?: string
  /** Where the data came from; hook for the future catalog (Phase 14). Defaults to 'user'. */
  source?: 'user' | 'catalog'
}

const db = new Dexie('plant-care-db') as Dexie & {
  plants: EntityTable<Plant, 'id'>
  careGuides: EntityTable<CareGuide, 'id'>
  careLogs: EntityTable<CareLog, 'id'>
}

// v1 — kept so existing installs follow the documented upgrade path.
db.version(1).stores({
  plants: '++id, name, lastWateredAt',
})

// v2 — add the standalone `careGuides` table and `Plant.careGuideId`.
// Non-destructive: `careGuideId` is optional (undefined = no guide), `careGuides` starts
// empty. No data transformation is needed, so the upgrade is a no-op declared explicitly to
// mark the v1→v2 step. Dexie re-indexes existing plants for the new `careGuideId` index.
db.version(2)
  .stores({
    plants: '++id, name, lastWateredAt, careGuideId',
    careGuides: '++id, species, source',
  })
  .upgrade(() => {
    // Existing plants are preserved as-is; nothing to migrate.
  })

// v3 — add the `careLogs` table for watering history (and future event types).
// Non-destructive: `careLogs` starts empty; plants and careGuides are unchanged.
// IndexedDB version will be 30 (Dexie version × 10).
db.version(3)
  .stores({
    plants: '++id, name, lastWateredAt, careGuideId',
    careGuides: '++id, species, source',
    careLogs: '++id, plantId, date, type',
  })
  .upgrade(() => {
    // careLogs starts empty; no data transformation needed.
  })

// v4 — migrate Plant.photo from Blob → ArrayBuffer.
// Blobs silently corrupt when Dexie re-serializes a record on iOS Safari /
// Android WebView (cursor.update re-runs structured clone over the whole
// object, and WebKit's Blob lifecycle management detaches the data).
// ArrayBuffers are plain bytes and survive structured clone on every platform.
// Schema string is unchanged; this is a pure data migration.
db.version(4)
  .stores({
    plants: '++id, name, lastWateredAt, careGuideId',
    careGuides: '++id, species, source',
    careLogs: '++id, plantId, date, type',
  })
  .upgrade(async (tx) => {
    type LegacyPlant = { id: number; photo?: unknown }
    const plants = await tx.table<LegacyPlant, number>('plants').toArray()
    await Promise.all(
      plants
        .filter((p) => p.photo instanceof Blob)
        .map(async (p) => {
          const buf = await (p.photo as Blob).arrayBuffer()
          await tx.table('plants').update(p.id, {
            photo: buf.byteLength > 0 ? buf : undefined,
          })
        }),
    )
  })

// v5 — add fertilizeIntervalDays + lastFertilizedAt to Plant.
// Non-destructive: both fields are optional; existing plants keep undefined (= not tracking).
// Adds lastFertilizedAt to the plants index.
db.version(5)
  .stores({
    plants: '++id, name, lastWateredAt, lastFertilizedAt, careGuideId',
    careGuides: '++id, species, source',
    careLogs: '++id, plantId, date, type',
  })
  .upgrade(() => {
    // Existing plants get undefined for the new fields — no migration needed.
  })

export default db
