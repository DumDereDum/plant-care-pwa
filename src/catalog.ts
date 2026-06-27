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
  description_en: string
  description_ru: string
  careTips?: string
  wikiUrl: string
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
    description_en:
      'Tropical beauty with iconic split leaves. Adapts to a range of light conditions but thrives in bright indirect light. A fast grower that can reach impressive sizes indoors.',
    description_ru:
      'Тропическое растение с характерными резными листьями. Хорошо адаптируется к разным условиям освещения, но предпочитает яркий рассеянный свет. Быстро растёт и может достигать внушительных размеров в комнатных условиях.',
    careTips: 'Wipe leaves with a damp cloth monthly to keep them dust-free. Mist occasionally or place near a humidifier.',
    wikiUrl: 'https://en.wikipedia.org/wiki/Monstera_deliciosa',
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
    description_en:
      'Bold glossy leaves in deep green or burgundy. Tolerant and long-lived indoors, easily growing into a small tree with the right conditions.',
    description_ru:
      'Крупные блестящие листья тёмно-зелёного или бордового цвета. Неприхотливое и долговечное растение, которое при правильном уходе превращается в небольшое деревце.',
    careTips: 'Avoid moving it once settled — Ficus dislikes relocation. Keep away from drafts.',
    wikiUrl: 'https://en.wikipedia.org/wiki/Ficus_elastica',
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
    description_en:
      'One of the most forgiving houseplants. Trails beautifully from shelves and thrives in low light, making it perfect for beginners.',
    description_ru:
      'Одно из самых неприхотливых комнатных растений. Красиво свисает с полок и хорошо растёт при слабом освещении — идеальный выбор для начинающих.',
    careTips: 'Let the top inch of soil dry between waterings. Trim leggy vines to encourage bushy growth.',
    wikiUrl: 'https://en.wikipedia.org/wiki/Epipremnum_aureum',
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
    description_en:
      'Nearly indestructible. Tolerates deep shade, drought, and neglect with ease, and releases oxygen at night making it ideal for bedrooms.',
    description_ru:
      'Практически неубиваемое растение. Переносит глубокую тень, засуху и небрежный уход, а ночью выделяет кислород — идеально для спальни.',
    careTips: 'Water sparingly — root rot is the only real risk. Completely drought-tolerant in winter.',
    wikiUrl: 'https://en.wikipedia.org/wiki/Dracaena_trifasciata',
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
    description_en:
      'Elegant white blooms and deep green leaves. One of the best air-purifying plants for low-light rooms, also signaling when it needs water by drooping its leaves.',
    description_ru:
      'Элегантные белые цветы и насыщенно-зелёные листья. Одно из лучших воздухоочищающих растений для тенистых комнат; когда ему нужна вода, листья сами «просят» полива, опускаясь вниз.',
    careTips: 'Drooping leaves are a reliable signal to water. Keep out of direct sun to prevent leaf scorch.',
    wikiUrl: 'https://en.wikipedia.org/wiki/Spathiphyllum',
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
    description_en:
      'Hardy and cheerful with arching variegated leaves. Produces cascading "spiderettes" that can be easily propagated in water or soil.',
    description_ru:
      'Неприхотливое и жизнерадостное растение с дугообразными пёстрыми листьями. Образует каскады «паучков», которые легко укоренить в воде или почве.',
    careTips: 'Brown leaf tips usually mean fluoride in tap water — switch to filtered or let water sit overnight.',
    wikiUrl: 'https://en.wikipedia.org/wiki/Chlorophytum_comosum',
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
    description_en:
      'Architectural glossy foliage that stays fresh-looking year-round. Stores water in its rhizomes, making it exceptionally drought-tolerant.',
    description_ru:
      'Архитектурная глянцевая листва, которая выглядит свежо круглый год. Запасает воду в корневищах, что делает его исключительно засухоустойчивым.',
    careTips: 'Overwatering is the main risk. Allow soil to dry completely before watering again.',
    wikiUrl: 'https://en.wikipedia.org/wiki/Zamioculcas',
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
    description_en:
      'Succulent with soothing gel inside its leaves used for centuries to treat burns and skin irritation. Needs bright light and very little water.',
    description_ru:
      'Суккулент с целебным гелем в листьях, который веками применяется при ожогах и раздражении кожи. Требует яркого света и очень редкого полива.',
    careTips: 'Plant in well-draining cactus mix. Water deeply but infrequently; let soil dry out completely between waterings.',
    wikiUrl: 'https://en.wikipedia.org/wiki/Aloe_vera',
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
    description_en:
      'Long-lived succulent that can become a small tree over decades. Considered a symbol of good luck and prosperity in many cultures.',
    description_ru:
      'Долгоживущий суккулент, способный за десятилетия превратиться в небольшое деревце. Считается символом удачи и богатства во многих культурах.',
    careTips: 'Needs several hours of direct sun daily. Water thoroughly then let soil dry completely.',
    wikiUrl: 'https://en.wikipedia.org/wiki/Crassula_ovata',
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
    description_en:
      'Statement plant with large violin-shaped leaves. Rewarding but requires consistent conditions — avoid moving it or exposing it to drafts.',
    description_ru:
      'Эффектное растение с крупными листьями в форме скрипки. Требовательно к постоянству условий: его нельзя часто переставлять или держать на сквозняке.',
    careTips: 'Find a bright spot and do not move it. Inconsistent watering or drafts cause leaf drop.',
    wikiUrl: 'https://en.wikipedia.org/wiki/Ficus_lyrata',
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
    description_en:
      'Stunning silver-striped leaves that fold up at night in a beautiful natural rhythm. One of the most eye-catching foliage plants.',
    description_ru:
      'Потрясающие серебристо-полосатые листья, которые складываются на ночь в красивом природном ритме. Одно из самых декоративных лиственных растений.',
    careTips: 'Use distilled or rain water — Calatheas are sensitive to fluoride and chlorine. High humidity is essential.',
    wikiUrl: 'https://en.wikipedia.org/wiki/Calathea_orbifolia',
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
    description_en:
      'Dramatic spiky silhouette with thin red-edged leaves on bare canes. Very adaptable to indoor conditions and a reliable air purifier.',
    description_ru:
      'Эффектный силуэт с тонкими листьями с красной каймой на оголённых стеблях. Хорошо адаптируется к комнатным условиям и очищает воздух.',
    careTips: 'Let soil dry between waterings. Brown leaf tips indicate low humidity or fluoride in water.',
    wikiUrl: 'https://en.wikipedia.org/wiki/Dracaena_marginata',
  },
]

/** Sorted alphabetically by common name for display. */
export const CATALOG_SORTED = [...CATALOG].sort((a, b) =>
  a.commonName.localeCompare(b.commonName),
)

/** Convert a catalog entry into a CareGuide payload ready for db.careGuides.add(). */
export function catalogEntryToGuideData(
  entry: CatalogEntry,
  locale = 'en',
): Omit<CareGuide, 'id'> {
  const description = locale.startsWith('ru') ? entry.description_ru : entry.description_en
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
    description,
    careTips: entry.careTips,
    source: 'catalog' as const,
  }
}
