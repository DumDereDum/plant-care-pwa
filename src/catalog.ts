import type { CareGuide } from './db'

/**
 * Bundled species photos, downloaded from Wikimedia Commons and optimized to WebP
 * (see assets/catalog/CREDITS.md for sources/attribution). Imported via Vite's glob so they
 * are hashed, base-prefixed and precached by the service worker — the catalog shows photos
 * fully OFFLINE, with no dependency on Wikipedia being reachable. Keyed by the file's slug.
 */
const PHOTO_MODULES = import.meta.glob('./assets/catalog/*.webp', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const PHOTO_BY_SLUG: Record<string, string> = {}
for (const [path, url] of Object.entries(PHOTO_MODULES)) {
  const slug = path.split('/').pop()!.replace(/\.webp$/, '')
  PHOTO_BY_SLUG[slug] = url
}

/** A bilingual text blob. Both languages are bundled; the UI picks one at render time. */
export interface LocalizedText {
  en: string
  ru: string
}

/**
 * Structured, per-topic care guidance shown as the "Care tips" section of the species
 * card (mirrors the reference design's «Советы по уходу»). Every field is optional so a
 * species can fill in only what is known; the UI renders sections in a fixed order and
 * skips empty ones. Content is bilingual and authored/compiled (not fetched at runtime).
 */
export interface CareSections {
  appearance?: LocalizedText
  watering?: LocalizedText
  temperature?: LocalizedText
  light?: LocalizedText
  humidity?: LocalizedText
  fertilizer?: LocalizedText
  soil?: LocalizedText
  repotting?: LocalizedText
  pruning?: LocalizedText
  flowering?: LocalizedText
  /** Use of the plant in interior design («Фитодизайн»). */
  phytodesign?: LocalizedText
}

/** One propagation method (e.g. stem cuttings) with step-by-step instructions. */
export interface PropagationMethod {
  /** Stable slug, unique within the entry. */
  id: string
  name: LocalizedText
  steps: LocalizedText
}

/**
 * A disease or pest entry. Forward-compatible with a future dedicated sub-page: it already
 * carries the full text and an optional photo. `treatment` applies to both; `signs` /
 * `prevention` are mainly used by pests, `description` mainly by diseases — all optional.
 */
export interface Ailment {
  /** Stable slug, unique within its list. */
  id: string
  name: LocalizedText
  /** Optional macro photo (e.g. Wikimedia Commons). Requires network; UI degrades without it. */
  photoUrl?: string
  description?: LocalizedText
  signs?: LocalizedText
  prevention?: LocalizedText
  treatment?: LocalizedText
}

/**
 * A catalog entry is the source-of-truth shape for bundled species data.
 * It mirrors CareGuide fields (minus `id` and `source`) plus display names.
 * Keep this interface stable — AI-generated entries will be validated against it.
 */
export interface CatalogEntry {
  /** Stable slug used as a key; never rename once shipped. */
  id: string
  /** English common name (default / fallback display name). */
  commonName: string
  /** Russian common name, shown when the UI language is Russian. */
  commonName_ru: string
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
  /** Legacy single-paragraph tips. Shown only when `care` (structured sections) is absent. */
  careTips?: string
  /** Structured per-topic care guidance. When present, replaces the legacy `careTips` block. */
  care?: CareSections
  propagation?: PropagationMethod[]
  diseases?: Ailment[]
  pests?: Ailment[]
  wikiUrl: string
  /**
   * Source Wikimedia Commons thumbnail URL the bundled photo came from (kept for reference and
   * as a last-resort fallback). Display uses the bundled local WebP via `catalogPhoto()`.
   */
  photoUrl: string
}

export const CATALOG: CatalogEntry[] = [
  {
    id: 'monstera-deliciosa',
    commonName: 'Monstera',
    commonName_ru: 'Монстера',
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
    care: {
      appearance: {
        en: 'An evergreen climber famous for its large, glossy, heart-shaped leaves that develop dramatic splits and holes (fenestrations) as the plant matures. Indoors it can reach 2–3 m, supported by thick aerial roots.',
        ru: 'Вечнозелёная лиана с крупными глянцевыми сердцевидными листьями, на которых с возрастом появляются характерные разрезы и отверстия. В помещении вырастает до 2–3 м, опираясь на толстые воздушные корни.',
      },
      watering: {
        en: 'Water when the top 3–5 cm of soil have dried out — roughly once a week in summer and every 10–14 days in winter. Pour until water runs from the drainage holes, then empty the saucer: Monstera dislikes soggy roots.',
        ru: 'Поливайте, когда верхние 3–5 см почвы просохнут — примерно раз в неделю летом и раз в 10–14 дней зимой. Лейте до появления воды в поддоне, затем сливайте излишки: монстера не любит застоя влаги у корней.',
      },
      temperature: {
        en: 'Comfortable at normal room temperature, 18–27 °C. Keep it above 13 °C and away from cold draughts and hot radiators — sudden chills damage the leaves.',
        ru: 'Хорошо чувствует себя при обычной комнатной температуре 18–27 °C. Не допускайте охлаждения ниже 13 °C, берегите от сквозняков и горячих батарей — резкий холод повреждает листья.',
      },
      light: {
        en: 'Bright, indirect light brings out the leaf splits. It tolerates medium light but grows slower and keeps solid leaves; direct midday sun scorches the foliage.',
        ru: 'Яркий рассеянный свет усиливает образование разрезов на листьях. Переносит полутень, но растёт медленнее, а листья остаются цельными; прямое полуденное солнце оставляет ожоги.',
      },
      humidity: {
        en: 'Prefers moderate-to-high humidity (50%+). Mist occasionally, group it with other plants or run a humidifier; brown leaf edges signal air that is too dry.',
        ru: 'Предпочитает умеренную и высокую влажность (от 50%). Иногда опрыскивайте, ставьте рядом с другими растениями или используйте увлажнитель; коричневые края листьев — признак слишком сухого воздуха.',
      },
      fertilizer: {
        en: 'Feed every 2–4 weeks in spring and summer with a balanced liquid houseplant fertilizer at half strength. Stop feeding in autumn and winter while growth slows.',
        ru: 'С весны до конца лета подкармливайте каждые 2–4 недели сбалансированным жидким удобрением для комнатных растений в половинной дозе. Осенью и зимой, когда рост замедляется, подкормки прекращают.',
      },
      soil: {
        en: 'Use a loose, well-draining aroid mix — general potting soil lightened with bark, perlite and a little coco coir. Good aeration is the best protection against root rot.',
        ru: 'Используйте рыхлый, хорошо дренируемый субстрат для ароидных: универсальный грунт с добавлением коры, перлита и кокосового волокна. Хорошая аэрация — лучшая защита от загнивания корней.',
      },
      repotting: {
        en: 'Repot every 1–2 years in spring, moving up one pot size when roots fill the container or grow out of the drainage holes. Add a moss pole to support the climbing stems.',
        ru: 'Пересаживайте раз в 1–2 года весной, увеличивая горшок на размер, когда корни заполнят ёмкость или начнут вылезать из дренажных отверстий. Установите опору-мохошест для лазящих стеблей.',
      },
      pruning: {
        en: 'Trim in spring to control size and shape, cutting just below a node. Remove yellowing or damaged leaves at the base, and wipe the leaves with a damp cloth so they stay dust-free.',
        ru: 'Обрезайте весной для контроля размера и формы, делая срез чуть ниже узла. Удаляйте пожелтевшие и повреждённые листья у основания, а сами листья протирайте влажной тканью, чтобы они не пылились.',
      },
      flowering: {
        en: 'Indoor flowering is rare. In the wild it produces a cream-coloured spathe and a spadix that ripens into an edible fruit; potted plants almost never bloom.',
        ru: 'В комнатных условиях цветёт крайне редко. В природе образует кремовое покрывало и початок, из которого созревает съедобный плод; в горшке цветение практически не наступает.',
      },
      phytodesign: {
        en: 'A statement plant for living rooms, offices and bright hallways. Its bold silhouette suits modern and tropical interiors — give it floor space and a support to climb.',
        ru: 'Эффектное акцентное растение для гостиных, офисов и светлых прихожих. Выразительный силуэт впишется в современный и тропический интерьер — дайте ему место на полу и опору для роста вверх.',
      },
    },
    propagation: [
      {
        id: 'stem-cuttings',
        name: { en: 'Stem cuttings', ru: 'Черенками' },
        steps: {
          en: '1. Choose a healthy stem with at least one node, ideally with an aerial root.\n2. Cut just below the node with clean, sharp scissors.\n3. Root the cutting in water or moist substrate in a warm, bright spot.\n4. Once roots reach 3–5 cm, pot it into aroid mix and keep the soil lightly moist.',
          ru: '1. Выберите здоровый стебель хотя бы с одним узлом, желательно с воздушным корнем.\n2. Сделайте срез чуть ниже узла чистыми острыми ножницами.\n3. Укорените черенок в воде или влажном субстрате в тёплом и светлом месте.\n4. Когда корни достигнут 3–5 см, посадите в субстрат для ароидных и поддерживайте лёгкую влажность.',
        },
      },
      {
        id: 'air-layering',
        name: { en: 'Air layering', ru: 'Воздушными отводками' },
        steps: {
          en: '1. Find a node with an aerial root on the stem.\n2. Wrap it in moist sphagnum moss and cover with plastic film to hold humidity.\n3. Keep the moss damp until new roots grow through it.\n4. Cut the rooted section below the moss and pot it up.',
          ru: '1. Найдите на стебле узел с воздушным корнем.\n2. Оберните его влажным сфагнумом и закрепите плёнкой для сохранения влажности.\n3. Поддерживайте мох влажным, пока сквозь него не прорастут новые корни.\n4. Отрежьте укоренившийся участок ниже мха и посадите в горшок.',
        },
      },
    ],
    diseases: [
      {
        id: 'root-rot',
        name: { en: 'Root rot', ru: 'Корневая гниль' },
        description: {
          en: 'Caused by overwatering and poor drainage. Leaves yellow and wilt, stems soften and the soil smells sour.',
          ru: 'Возникает из-за переувлажнения и плохого дренажа. Листья желтеют и вянут, стебли размягчаются, от почвы идёт кислый запах.',
        },
        treatment: {
          en: 'Remove the plant, cut away black mushy roots, dust the cuts with charcoal and repot into fresh, airy mix. Water less and make sure the drainage holes are open.',
          ru: 'Достаньте растение, обрежьте чёрные размягчённые корни, присыпьте срезы углём и пересадите в свежий рыхлый субстрат. Сократите полив и проверьте, открыты ли дренажные отверстия.',
        },
      },
      {
        id: 'leaf-spot',
        name: { en: 'Leaf spot', ru: 'Пятнистость листьев' },
        description: {
          en: 'Brown or black spots with yellow halos — usually a fungal or bacterial infection in damp, stagnant conditions.',
          ru: 'Коричневые или чёрные пятна с жёлтым ореолом — обычно грибковая или бактериальная инфекция во влажных застойных условиях.',
        },
        treatment: {
          en: 'Remove affected leaves, improve air circulation, avoid wetting the foliage and treat with a fungicide if it keeps spreading.',
          ru: 'Удалите поражённые листья, улучшите проветривание, не мочите листву и при дальнейшем распространении обработайте фунгицидом.',
        },
      },
      {
        id: 'powdery-mildew',
        name: { en: 'Powdery mildew', ru: 'Мучнистая роса' },
        description: {
          en: 'A white, flour-like coating on the leaves caused by fungus in humid, poorly ventilated spots.',
          ru: 'Белый мучнистый налёт на листьях — грибок, развивающийся при высокой влажности и плохой вентиляции.',
        },
        treatment: {
          en: 'Wipe off the coating, isolate the plant, improve ventilation and spray with a fungicide or a baking-soda solution.',
          ru: 'Удалите налёт, изолируйте растение, улучшите вентиляцию и обработайте фунгицидом или раствором пищевой соды.',
        },
      },
    ],
    pests: [
      {
        id: 'spider-mites',
        name: { en: 'Spider mites', ru: 'Паутинный клещ' },
        signs: {
          en: 'Fine webbing on the undersides of leaves, tiny pale speckles and dull, drying foliage.',
          ru: 'Тонкая паутина на изнанке листьев, мелкие светлые точки и тусклая, подсыхающая листва.',
        },
        treatment: {
          en: 'Rinse the plant in the shower, raise humidity and treat with insecticidal soap or neem oil, repeating weekly until clear.',
          ru: 'Промойте растение под душем, повысьте влажность и обработайте инсектицидным мылом или маслом нима, повторяя еженедельно до исчезновения.',
        },
      },
      {
        id: 'mealybugs',
        name: { en: 'Mealybugs', ru: 'Мучнистый червец' },
        signs: {
          en: 'White cottony tufts in the leaf joints and a sticky residue on the foliage.',
          ru: 'Белые ватообразные комочки в пазухах листьев и липкий налёт на листве.',
        },
        treatment: {
          en: 'Dab the bugs with an alcohol-soaked cotton swab, then treat with insecticidal soap or neem oil and quarantine the plant.',
          ru: 'Снимите вредителей ватной палочкой, смоченной спиртом, затем обработайте инсектицидным мылом или маслом нима и изолируйте растение.',
        },
      },
      {
        id: 'scale',
        name: { en: 'Scale insects', ru: 'Щитовка' },
        signs: {
          en: "Small brown bumps along stems and leaf veins that don't brush off easily, with sticky honeydew nearby.",
          ru: 'Мелкие коричневые бугорки на стеблях и жилках, которые трудно стереть, и липкая падь рядом.',
        },
        treatment: {
          en: 'Scrape off the shells, wipe with alcohol and apply neem oil or a systemic insecticide; check weekly for survivors.',
          ru: 'Соскоблите щитки, протрите спиртом и обработайте маслом нима или системным инсектицидом; еженедельно проверяйте на повторное появление.',
        },
      },
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Monstera_deliciosa',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Monstera_deliciosa2.jpg/400px-Monstera_deliciosa2.jpg',
  },
  {
    id: 'ficus-elastica',
    commonName: 'Rubber Plant',
    commonName_ru: 'Фикус каучуконосный',
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
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Ficus_elastica_leaves_02.JPG/400px-Ficus_elastica_leaves_02.JPG',
  },
  {
    id: 'epipremnum-aureum',
    commonName: 'Pothos',
    commonName_ru: 'Эпипремнум',
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
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Money_Plant_%28Epipremnum_aureum%29_4.jpg/400px-Money_Plant_%28Epipremnum_aureum%29_4.jpg',
  },
  {
    id: 'sansevieria-trifasciata',
    commonName: 'Snake Plant',
    commonName_ru: 'Сансевиерия',
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
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Snake_Plant_%28Sansevieria_trifasciata_%27Laurentii%27%29.jpg/400px-Snake_Plant_%28Sansevieria_trifasciata_%27Laurentii%27%29.jpg',
  },
  {
    id: 'spathiphyllum',
    commonName: 'Peace Lily',
    commonName_ru: 'Спатифиллум',
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
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Spathiphyllum_cochlearispathum_RTBG.jpg/400px-Spathiphyllum_cochlearispathum_RTBG.jpg',
  },
  {
    id: 'chlorophytum-comosum',
    commonName: 'Spider Plant',
    commonName_ru: 'Хлорофитум',
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
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Hierbabuena_0611_Revised.jpg/400px-Hierbabuena_0611_Revised.jpg',
  },
  {
    id: 'zamioculcas-zamiifolia',
    commonName: 'ZZ Plant',
    commonName_ru: 'Замиокулькас',
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
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Zamioculcas_zamiifolia_1.jpg/400px-Zamioculcas_zamiifolia_1.jpg',
  },
  {
    id: 'aloe-vera',
    commonName: 'Aloe Vera',
    commonName_ru: 'Алоэ вера',
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
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Aloe_vera_flower_inset.png/400px-Aloe_vera_flower_inset.png',
  },
  {
    id: 'crassula-ovata',
    commonName: 'Jade Plant',
    commonName_ru: 'Толстянка',
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
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Crassula_ovata_700.jpg/400px-Crassula_ovata_700.jpg',
  },
  {
    id: 'ficus-lyrata',
    commonName: 'Fiddle-leaf Fig',
    commonName_ru: 'Фикус лировидный',
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
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Starr_031108-0130_Ficus_lyrata.jpg/400px-Starr_031108-0130_Ficus_lyrata.jpg',
  },
  {
    id: 'calathea-orbifolia',
    commonName: 'Calathea',
    commonName_ru: 'Калатея',
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
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Calathea_orbifolia_2.jpg/400px-Calathea_orbifolia_2.jpg',
  },
  {
    id: 'dracaena-marginata',
    commonName: 'Dracaena',
    commonName_ru: 'Драцена',
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
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Dracaena_reflexa.JPG/400px-Dracaena_reflexa.JPG',
  },
]

/** The catalog entry's common name in the given locale (Russian when locale starts with 'ru'). */
export function localizedCommonName(entry: CatalogEntry, locale: string): string {
  return locale.startsWith('ru') ? entry.commonName_ru : entry.commonName
}

/** Bundled local photo URL for a catalog entry (offline-capable). Undefined if none bundled. */
export function catalogPhoto(entry: CatalogEntry): string | undefined {
  return PHOTO_BY_SLUG[entry.id]
}

/** Catalog sorted alphabetically by the localized common name for the given locale. */
export function sortCatalogByName(locale: string): CatalogEntry[] {
  return [...CATALOG].sort((a, b) =>
    localizedCommonName(a, locale).localeCompare(localizedCommonName(b, locale), locale),
  )
}

/**
 * Convert a catalog entry into a CareGuide payload ready for db.careGuides.add().
 *
 * Only language-INDEPENDENT data is copied into the DB (the slug link + numeric ratings +
 * Latin name). The description / care text is intentionally NOT snapshotted: it is rendered
 * live from the bilingual catalog via `catalogId`, so the UI always follows the current
 * language. This is the core of the multilingual data model — see CareGuide.catalogId.
 */
export function catalogEntryToGuideData(entry: CatalogEntry): Omit<CareGuide, 'id'> {
  return {
    catalogId: entry.id,
    species: entry.latinName,
    light: entry.light,
    water: entry.water,
    humidity: entry.humidity,
    difficulty: entry.difficulty,
    tempMin: entry.tempMin,
    tempMax: entry.tempMax,
    perks: entry.perks ? [...entry.perks] : undefined,
    recommendedWateringIntervalDays: entry.recommendedWateringIntervalDays,
    source: 'catalog' as const,
  }
}

/** Resolve the catalog species a saved guide refers to: by stable slug first, then Latin name. */
export function catalogEntryForGuide(
  guide: Pick<CareGuide, 'catalogId' | 'species'> | null | undefined,
): CatalogEntry | undefined {
  if (!guide) return undefined
  if (guide.catalogId) {
    const byId = CATALOG.find((e) => e.id === guide.catalogId)
    if (byId) return byId
  }
  if (guide.species) return CATALOG.find((e) => e.latinName === guide.species)
  return undefined
}

/** The catalog entry's description in the given locale (defaults to English). */
export function localizedDescription(entry: CatalogEntry, locale: string): string {
  return locale.startsWith('ru') ? entry.description_ru : entry.description_en
}
