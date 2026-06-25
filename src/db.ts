import Dexie, { type EntityTable } from 'dexie'

export interface Plant {
  id: number
  name: string
  wateringIntervalDays: number
  lastWateredAt: Date | null
  photo?: Blob
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

export default db
