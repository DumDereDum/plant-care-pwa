import type { CareGuide } from './db'

/**
 * A catalog entry is the source-of-truth shape for bundled species data.
 * It mirrors CareGuide fields (minus `id` and `source`) plus display names.
 * Keep this interface stable — AI-generated entries will be validated against it.
 */
export interface CatalogEntry {
  /** Stable slug used as a key; never rename once shipped. */
  id: string
  commonName: string
  latinName: string
  light?: 1 | 2 | 3 | 4 | 5
  water?: 1 | 2 | 3 | 4 | 5
  humidity?: 1 | 2 | 3 | 4 | 5
  difficulty?: 1 | 2 | 3 | 4 | 5
  tempMin?: number
  tempMax?: number
  perks?: string[]
  recommendedWateringIntervalDays?: number
  fertilizeIntervalDays?: number
  description?: string
  careTips?: string
}

export const CATALOG: CatalogEntry[] = [
  {
    id: 'monstera-deliciosa',
    commonName: 'Monstera',
    latinName: 'Monstera deliciosa',
    light: 3,
    water: 3,
    humidity: 4,
    difficulty: 2,
    tempMin: 18,
    tempMax: 30,
    perks: ['toxicCats', 'toxicDogs', 'airPurifying'],
    recommendedWateringIntervalDays: 7,
    fertilizeIntervalDays: 30,
    description: 'Tropical beauty with iconic split leaves. Adapts to a range of light conditions but thrives in bright indirect light.',
    careTips: 'Wipe leaves with a damp cloth monthly to keep them dust-free. Mist occasionally or place near a humidifier.',
  },
  {
    id: 'ficus-elastica',
    commonName: 'Rubber Plant',
    latinName: 'Ficus elastica',
    light: 4,
    water: 2,
    humidity: 2,
    difficulty: 2,
    tempMin: 15,
    tempMax: 30,
    perks: ['toxicCats', 'toxicDogs', 'airPurifying'],
    recommendedWateringIntervalDays: 10,
    fertilizeIntervalDays: 30,
    description: 'Bold glossy leaves in deep green or burgundy. Tolerant and long-lived indoors.',
    careTips: 'Avoid moving it once settled — Ficus dislikes relocation. Keep away from drafts.',
  },
  {
    id: 'epipremnum-aureum',
    commonName: 'Pothos',
    latinName: 'Epipremnum aureum',
    light: 2,
    water: 2,
    humidity: 2,
    difficulty: 1,
    tempMin: 15,
    tempMax: 30,
    perks: ['toxicCats', 'toxicDogs', 'airPurifying'],
    recommendedWateringIntervalDays: 7,
    fertilizeIntervalDays: 60,
    description: 'One of the most forgiving houseplants. Trails beautifully from shelves and thrives in low light.',
    careTips: 'Let the top inch of soil dry between waterings. Trim leggy vines to encourage bushy growth.',
  },
  {
    id: 'sansevieria-trifasciata',
    commonName: 'Snake Plant',
    latinName: 'Sansevieria trifasciata',
    light: 2,
    water: 1,
    humidity: 1,
    difficulty: 1,
    tempMin: 15,
    tempMax: 32,
    perks: ['toxicCats', 'toxicDogs', 'oxygenBoost'],
    recommendedWateringIntervalDays: 14,
    fertilizeIntervalDays: 60,
    description: 'Nearly indestructible. Tolerates deep shade, drought, and neglect with ease.',
    careTips: 'Water sparingly — root rot is the only real risk. Completely drought-tolerant in winter.',
  },
  {
    id: 'spathiphyllum',
    commonName: 'Peace Lily',
    latinName: 'Spathiphyllum wallisii',
    light: 2,
    water: 3,
    humidity: 4,
    difficulty: 2,
    tempMin: 15,
    tempMax: 30,
    perks: ['toxicCats', 'toxicDogs', 'airPurifying'],
    recommendedWateringIntervalDays: 7,
    fertilizeIntervalDays: 30,
    description: 'Elegant white blooms and deep green leaves. One of the best air-purifying plants for low-light rooms.',
    careTips: 'Drooping leaves are a reliable signal to water. Keep out of direct sun to prevent leaf scorch.',
  },
  {
    id: 'chlorophytum-comosum',
    commonName: 'Spider Plant',
    latinName: 'Chlorophytum comosum',
    light: 3,
    water: 2,
    humidity: 2,
    difficulty: 1,
    tempMin: 10,
    tempMax: 30,
    perks: ['airPurifying'],
    recommendedWateringIntervalDays: 7,
    fertilizeIntervalDays: 30,
    description: 'Hardy and cheerful with arching variegated leaves. Produces cascading "spiderettes" that can be propagated.',
    careTips: 'Brown leaf tips usually mean fluoride in tap water — switch to filtered or let water sit overnight.',
  },
  {
    id: 'zamioculcas-zamiifolia',
    commonName: 'ZZ Plant',
    latinName: 'Zamioculcas zamiifolia',
    light: 2,
    water: 1,
    humidity: 1,
    difficulty: 1,
    tempMin: 15,
    tempMax: 30,
    perks: ['toxicCats', 'toxicDogs'],
    recommendedWateringIntervalDays: 14,
    fertilizeIntervalDays: 60,
    description: 'Architectural glossy foliage. Stores water in its rhizomes, making it exceptionally drought-tolerant.',
    careTips: 'Overwatering is the main risk. Allow soil to dry completely before watering again.',
  },
  {
    id: 'aloe-vera',
    commonName: 'Aloe Vera',
    latinName: 'Aloe vera',
    light: 5,
    water: 1,
    humidity: 1,
    difficulty: 1,
    tempMin: 15,
    tempMax: 35,
    perks: ['unsafeChildren'],
    recommendedWateringIntervalDays: 14,
    fertilizeIntervalDays: 90,
    description: 'Succulent with soothing gel inside its leaves. Needs bright light and very little water.',
    careTips: 'Plant in well-draining cactus mix. Water deeply but infrequently; let soil dry out completely between waterings.',
  },
  {
    id: 'crassula-ovata',
    commonName: 'Jade Plant',
    latinName: 'Crassula ovata',
    light: 4,
    water: 1,
    humidity: 1,
    difficulty: 1,
    tempMin: 15,
    tempMax: 30,
    perks: ['toxicCats', 'toxicDogs'],
    recommendedWateringIntervalDays: 14,
    fertilizeIntervalDays: 60,
    description: 'Long-lived succulent that can become a small tree over decades. Said to bring good luck.',
    careTips: 'Needs several hours of direct sun daily. Water thoroughly then let soil dry completely.',
  },
  {
    id: 'ficus-lyrata',
    commonName: 'Fiddle-leaf Fig',
    latinName: 'Ficus lyrata',
    light: 5,
    water: 3,
    humidity: 3,
    difficulty: 4,
    tempMin: 18,
    tempMax: 30,
    perks: ['toxicCats', 'toxicDogs'],
    recommendedWateringIntervalDays: 7,
    fertilizeIntervalDays: 30,
    description: 'Statement plant with large violin-shaped leaves. Rewarding but requires consistent conditions.',
    careTips: 'Find a bright spot and do not move it. Inconsistent watering or drafts cause leaf drop.',
  },
  {
    id: 'calathea-orbifolia',
    commonName: 'Calathea',
    latinName: 'Calathea orbifolia',
    light: 2,
    water: 3,
    humidity: 5,
    difficulty: 4,
    tempMin: 18,
    tempMax: 28,
    perks: ['airPurifying'],
    recommendedWateringIntervalDays: 7,
    fertilizeIntervalDays: 30,
    description: 'Stunning silver-striped leaves. Folds its leaves at night — a beautiful natural rhythm.',
    careTips: 'Use distilled or rain water — Calatheas are sensitive to fluoride and chlorine. High humidity is essential.',
  },
  {
    id: 'dracaena-marginata',
    commonName: 'Dracaena',
    latinName: 'Dracaena marginata',
    light: 3,
    water: 2,
    humidity: 2,
    difficulty: 1,
    tempMin: 15,
    tempMax: 30,
    perks: ['toxicCats', 'toxicDogs', 'airPurifying'],
    recommendedWateringIntervalDays: 10,
    fertilizeIntervalDays: 60,
    description: 'Dramatic spiky silhouette with thin red-edged leaves on bare canes. Very adaptable.',
    careTips: 'Let soil dry between waterings. Brown leaf tips indicate low humidity or fluoride in water.',
  },
]

/** Sorted alphabetically by common name for display. */
export const CATALOG_SORTED = [...CATALOG].sort((a, b) =>
  a.commonName.localeCompare(b.commonName),
)

/** Convert a catalog entry into a CareGuide payload ready for db.careGuides.add(). */
export function catalogEntryToGuideData(entry: CatalogEntry): Omit<CareGuide, 'id'> {
  return {
    species: entry.latinName,
    light: entry.light,
    water: entry.water,
    humidity: entry.humidity,
    difficulty: entry.difficulty,
    tempMin: entry.tempMin,
    tempMax: entry.tempMax,
    perks: entry.perks ? [...entry.perks] : undefined,
    recommendedWateringIntervalDays: entry.recommendedWateringIntervalDays,
    description: entry.description,
    careTips: entry.careTips,
    source: 'catalog' as const,
  }
}
