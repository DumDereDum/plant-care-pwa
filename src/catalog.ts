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
export type PlantCategory =
  | 'flowering'
  | 'decorative'
  | 'succulent'
  | 'edible'
  | 'climbing'
  | 'bulbous'
  | 'palm'
  | 'bromeliad'
  | 'cactus'
  | 'orchid'
  | 'carnivorous'
  | 'fern'

export interface CatalogEntry {
  /** Stable slug used as a key; never rename once shipped. */
  id: string
  /** English common name (default / fallback display name). */
  commonName: string
  /** Russian common name, shown when the UI language is Russian. */
  commonName_ru: string
  latinName: string
  category?: PlantCategory
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
    category: 'climbing',
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
    category: 'decorative',
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
    care: {
      appearance: {
        en: 'A bold, upright tree with large, oval, intensely glossy leaves in deep green or dark burgundy (depending on the cultivar). Indoors it can grow 2–3 m tall on a sturdy single trunk, eventually branching with age.',
        ru: 'Статное прямостоячее деревце с крупными овальными листьями насыщенно-зелёного или тёмно-бордового цвета — в зависимости от сорта. В помещении может вырасти до 2–3 м, со временем ветвясь.',
      },
      watering: {
        en: 'Water when the top 3–5 cm of soil have dried out — roughly every 10 days in summer and every 2–3 weeks in winter. Empty the saucer after 30 minutes. Yellowing lower leaves usually signal overwatering.',
        ru: 'Поливайте, когда верхние 3–5 см грунта просохнут — примерно раз в 10 дней летом и раз в 2–3 недели зимой. Через 30 минут выливайте воду из поддона. Пожелтение нижних листьев — признак переувлажнения.',
      },
      temperature: {
        en: 'Prefers 18–28 °C. Keep above 12 °C and away from cold draughts and radiators. Once it has settled in a spot, avoid moving it — Ficus strongly dislikes relocation.',
        ru: 'Предпочитает 18–28 °C. Не допускайте охлаждения ниже 12 °C, берегите от сквозняков и батарей. Не переставляйте горшок без необходимости — фикус плохо переносит смену места.',
      },
      light: {
        en: 'Thrives in bright indirect light. Burgundy cultivars need more light to maintain their colour. Too little light causes slow growth and pale leaves; direct midday sun can scorch.',
        ru: 'Хорошо развивается при ярком рассеянном свете. Бордовые сорта нуждаются в большем освещении для сохранения цвета. При недостатке света рост замедляется, листья бледнеют; прямое полуденное солнце оставляет ожоги.',
      },
      humidity: {
        en: 'Tolerates average indoor humidity. Wipe the leaves monthly with a damp cloth to keep them glossy and dust-free — clean leaves photosynthesize more efficiently.',
        ru: 'Переносит обычную комнатную влажность. Ежемесячно протирайте листья влажной тканью для блеска и защиты от пыли — чистые листья лучше фотосинтезируют.',
      },
      fertilizer: {
        en: 'Feed every 4 weeks in spring and summer with a balanced liquid fertilizer at half strength. No feeding in autumn and winter when growth slows.',
        ru: 'Подкармливайте каждые 4 недели с весны до конца лета сбалансированным жидким удобрением в половинной дозе. Осенью и зимой, в период покоя, подкормки прекращают.',
      },
      soil: {
        en: 'Well-draining loam-based or general potting mix lightened with perlite (20–30 %). Good drainage is the best protection against root rot.',
        ru: 'Дренированный суглинистый или универсальный грунт с добавлением перлита (20–30 %). Хороший дренаж — лучшая защита от корневой гнили.',
      },
      repotting: {
        en: 'Repot every 2 years in spring, one pot size up. Once the plant is large, simply refresh the top 5 cm of soil annually instead of full repotting.',
        ru: 'Пересаживайте раз в 2 года весной, увеличивая горшок на размер. Когда растение достигнет большого размера, достаточно ежегодно обновлять верхние 5 см грунта.',
      },
      pruning: {
        en: 'Prune in spring by cutting just above a node to control height and encourage branching. Wear gloves — the milky sap (latex) is a skin irritant.',
        ru: 'Обрезайте весной чуть выше узла, чтобы ограничить высоту и стимулировать ветвление. Надевайте перчатки — млечный сок (латекс) раздражает кожу.',
      },
      phytodesign: {
        en: 'A dramatic specimen for living rooms, offices and lofts. The bold, dark-leaved silhouette suits minimalist, Scandinavian and industrial interiors equally well.',
        ru: 'Эффектное акцентное растение для гостиных, офисов и лофтов. Выразительный тёмнолистный силуэт гармонирует с минималистичным, скандинавским и индустриальным интерьером.',
      },
    },
    propagation: [
      {
        id: 'stem-cuttings',
        name: { en: 'Stem cuttings', ru: 'Стеблевые черенки' },
        steps: {
          en: '1. Cut a 10–15 cm tip with 2–3 leaves just below a node.\n2. Let the cut end dry 1–2 hours to reduce latex flow.\n3. Root in moist perlite or potting mix in a warm (22–25 °C), bright spot.\n4. Cover loosely with a bag to hold humidity; roots form in 4–8 weeks.',
          ru: '1. Срежьте верхушечный черенок длиной 10–15 см с 2–3 листьями чуть ниже узла.\n2. Дайте срезу подсохнуть 1–2 часа, чтобы снизить выделение латекса.\n3. Укорените во влажном перлите или грунте в тёплом (22–25 °C) и светлом месте.\n4. Накройте пакетом для сохранения влажности; корни образуются через 4–8 недель.',
        },
      },
      {
        id: 'air-layering',
        name: { en: 'Air layering', ru: 'Воздушные отводки' },
        steps: {
          en: '1. Select a healthy stem and make a shallow upward cut into it.\n2. Pack damp sphagnum moss around the cut and wrap tightly in cling film.\n3. Keep the moss moist; roots will appear within 4–8 weeks.\n4. Cut below the rooted section and pot it up in well-draining mix.',
          ru: '1. Выберите здоровый стебель и сделайте неглубокий надрез снизу вверх.\n2. Обложите надрез влажным сфагнумом и плотно оберните плёнкой.\n3. Поддерживайте мох влажным; корни появятся через 4–8 недель.\n4. Отрежьте укоренившийся участок и посадите в дренированный грунт.',
        },
      },
    ],
    diseases: [
      {
        id: 'root-rot',
        name: { en: 'Root rot', ru: 'Корневая гниль' },
        description: {
          en: 'Caused by overwatering in poorly draining soil. Leaves yellow and drop; the stem base feels soft and smells sour.',
          ru: 'Возникает при переливе в плохо дренированном грунте. Листья желтеют и опадают, основание стебля размягчается и неприятно пахнет.',
        },
        treatment: {
          en: 'Remove the plant, trim all dark mushy roots, dust cuts with activated charcoal, and repot into fresh mix. Water far less going forward.',
          ru: 'Достаньте растение, срежьте все почерневшие и размягчённые корни, присыпьте срезы активированным углём и пересадите в свежий грунт. В дальнейшем значительно сократите полив.',
        },
      },
      {
        id: 'leaf-spot',
        name: { en: 'Leaf spot', ru: 'Пятнистость листьев' },
        description: {
          en: 'Brown or yellow spots — often fungal or bacterial, triggered by wet foliage, poor ventilation or cold water on warm leaves.',
          ru: 'Коричневые или жёлтые пятна — как правило, грибкового или бактериального происхождения; провоцируются намоканием листьев, плохой вентиляцией или поливом холодной водой.',
        },
        treatment: {
          en: 'Remove affected leaves, improve air circulation, avoid wetting foliage, and apply a fungicide if spots keep spreading.',
          ru: 'Удалите поражённые листья, улучшите проветривание, не мочите листву и при необходимости обработайте фунгицидом.',
        },
      },
    ],
    pests: [
      {
        id: 'spider-mites',
        name: { en: 'Spider mites', ru: 'Паутинный клещ' },
        signs: {
          en: 'Fine webbing under leaves, tiny pale speckles on the surface, dull and drying foliage.',
          ru: 'Тонкая паутина на изнанке листьев, мелкие светлые точки на поверхности, тусклая подсыхающая листва.',
        },
        treatment: {
          en: 'Rinse in the shower, raise humidity and apply insecticidal soap or neem oil weekly until clear.',
          ru: 'Промойте под душем, повысьте влажность и еженедельно обрабатывайте инсектицидным мылом или маслом нима до полного исчезновения.',
        },
      },
      {
        id: 'mealybugs',
        name: { en: 'Mealybugs', ru: 'Мучнистый червец' },
        signs: {
          en: 'White cottony tufts in leaf axils and stem joints; sticky honeydew residue on leaves.',
          ru: 'Белые ватообразные комочки в пазухах листьев и узлах стебля; липкий налёт на листьях.',
        },
        treatment: {
          en: 'Dab with alcohol-soaked cotton, then treat with insecticidal soap or neem oil. Quarantine the plant.',
          ru: 'Удалите вредителей ватной палочкой, смоченной в спирте, затем обработайте инсектицидным мылом или маслом нима. Изолируйте растение.',
        },
      },
      {
        id: 'scale',
        name: { en: 'Scale insects', ru: 'Щитовка' },
        signs: {
          en: 'Small brown waxy bumps on stems and leaf undersides; sticky honeydew and sooty mould below.',
          ru: 'Мелкие коричневые восковые бугорки на стеблях и обратной стороне листьев; липкая падь и сажистый гриб ниже.',
        },
        treatment: {
          en: 'Scrape off the shells, wipe with alcohol and apply neem oil or a systemic insecticide. Check weekly for re-infestation.',
          ru: 'Соскоблите щитки, протрите спиртом и обработайте маслом нима или системным инсектицидом. Еженедельно проверяйте на повторное появление.',
        },
      },
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Ficus_elastica',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Ficus_elastica_leaves_02.JPG/400px-Ficus_elastica_leaves_02.JPG',
  },
  {
    id: 'epipremnum-aureum',
    commonName: 'Pothos',
    commonName_ru: 'Эпипремнум',
    latinName: 'Epipremnum aureum',
    category: 'climbing',
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
    care: {
      appearance: {
        en: 'A vigorous trailing or climbing vine with waxy, heart-shaped leaves in various shades of green, yellow and white depending on the cultivar. Stems can trail over 2 m indoors without support.',
        ru: 'Быстрорастущая вьющаяся или ниспадающая лиана с восковыми сердцевидными листьями — зелёными, жёлтыми или белопёстрыми в зависимости от сорта. Без опоры побеги вырастают длиннее 2 м.',
      },
      watering: {
        en: 'Water when the top 2–3 cm of soil dry out — roughly weekly in summer. In dim spots the soil dries more slowly; adjust accordingly. Yellowing leaves signal too much water; brown crispy tips signal too little.',
        ru: 'Поливайте, когда верхние 2–3 см грунта просохнут — примерно раз в неделю летом. В тёмных местах грунт сохнет медленнее — корректируйте частоту. Пожелтение листьев — признак переувлажнения, коричневые кончики — засухи.',
      },
      temperature: {
        en: 'Happy at 15–30 °C. Tolerates mild fluctuations but hates cold draughts and temperatures below 10 °C, which cause dark, water-soaked patches on the leaves.',
        ru: 'Комфортная температура — 15–30 °C. Переносит умеренные перепады, но боится сквозняков и охлаждения ниже 10 °C — от холода листья покрываются тёмными водянистыми пятнами.',
      },
      light: {
        en: 'Adapts to everything from low light to bright indirect light. Avoid prolonged direct sun. In dim conditions variegated leaves may revert to solid green — brighter light brings back the pattern.',
        ru: 'Приспосабливается к любому освещению — от глубокой тени до яркого рассеянного света. Избегайте прямых солнечных лучей. В темноте пёстрые листья могут позеленеть — больше света вернёт рисунок.',
      },
      humidity: {
        en: 'Tolerates low indoor humidity but grows faster and looks lusher at 40–60 %. Mist occasionally or group with other plants.',
        ru: 'Переносит низкую влажность, но быстрее растёт и лучше выглядит при 40–60 %. Периодически опрыскивайте или ставьте рядом с другими растениями.',
      },
      fertilizer: {
        en: 'Feed monthly in spring and summer with a diluted balanced liquid fertilizer. No feeding needed in autumn and winter.',
        ru: 'Подкармливайте раз в месяц с весны до конца лета разведённым сбалансированным удобрением. Осенью и зимой подкормки не нужны.',
      },
      soil: {
        en: 'Any well-draining potting mix works. Add perlite to improve aeration. Pothos also grows indefinitely in a vase of water — change the water weekly.',
        ru: 'Подойдёт любой хорошо дренированный грунт с добавлением перлита. Эпипремнум прекрасно растёт и в вазе с водой — меняйте воду раз в неделю.',
      },
      repotting: {
        en: 'Repot every 1–2 years, or when roots exit the drainage holes. Not fussy about pot size — thrives slightly pot-bound.',
        ru: 'Пересаживайте раз в 1–2 года, когда корни покажутся из дренажных отверстий. Не требователен к объёму горшка — хорошо себя чувствует в тесноватом.',
      },
      pruning: {
        en: 'Trim long trailing vines at any time to maintain shape or encourage bushier growth. Cuttings root effortlessly in water.',
        ru: 'В любое время укорачивайте длинные побеги для поддержания формы и стимуляции ветвления. Срезанные черенки легко укореняются в воде.',
      },
      phytodesign: {
        en: 'Ideal for bookshelves, hanging baskets and tall wardrobes — cascading stems create a lush, easy-care curtain of greenery for any interior.',
        ru: 'Идеален для книжных полок, кашпо и высоких шкафов: ниспадающие побеги создают пышный, непритязательный полог зелени в любом интерьере.',
      },
    },
    propagation: [
      {
        id: 'water-cuttings',
        name: { en: 'Stem cuttings in water', ru: 'Черенки в воде' },
        steps: {
          en: '1. Cut a stem just below a node, keeping 1–2 leaves.\n2. Place in a jar of room-temperature water in bright indirect light.\n3. Change the water every 5–7 days.\n4. Once roots reach 3–5 cm, pot into well-draining mix.',
          ru: '1. Срежьте стебель чуть ниже узла, оставив 1–2 листа.\n2. Поставьте в стакан с водой комнатной температуры при ярком рассеянном свете.\n3. Меняйте воду каждые 5–7 дней.\n4. Когда корни достигнут 3–5 см, пересадите в дренированный грунт.',
        },
      },
      {
        id: 'soil-cuttings',
        name: { en: 'Stem cuttings in soil', ru: 'Черенки в грунте' },
        steps: {
          en: '1. Cut a 10–15 cm stem with 2–3 nodes, remove the lower leaves.\n2. Insert into moist potting mix with perlite.\n3. Cover loosely with a bag to retain humidity.\n4. Roots form in 3–5 weeks; remove the bag once new growth appears.',
          ru: '1. Срежьте черенок длиной 10–15 см с 2–3 узлами, удалите нижние листья.\n2. Заглубите во влажный грунт с перлитом.\n3. Накройте пакетом для сохранения влажности.\n4. Корни образуются за 3–5 недель; снимите пакет после появления новых листьев.',
        },
      },
    ],
    diseases: [
      {
        id: 'root-rot',
        name: { en: 'Root rot', ru: 'Корневая гниль' },
        description: {
          en: 'Caused by persistently wet soil. Leaves yellow rapidly and stems turn dark and mushy near the base.',
          ru: 'Развивается при постоянно переувлажнённом грунте. Листья быстро желтеют, стебли у основания темнеют и размягчаются.',
        },
        treatment: {
          en: 'Remove the plant, trim rotted roots, let them air-dry briefly, and repot in fresh well-draining mix. Reduce watering frequency.',
          ru: 'Достаньте растение, срежьте гнилые корни, дайте им немного подсохнуть на воздухе и пересадите в свежий дренированный грунт. Сократите полив.',
        },
      },
      {
        id: 'bacterial-wilt',
        name: { en: 'Bacterial wilt', ru: 'Бактериальное увядание' },
        description: {
          en: 'Rapid wilting despite adequate watering; stems may show dark streaking inside when cut. Caused by Phytophthora or bacterial pathogens.',
          ru: 'Быстрое увядание несмотря на достаточный полив; на срезе стебля видны тёмные полосы. Вызвано фитофторой или бактериальными патогенами.',
        },
        treatment: {
          en: 'Remove and destroy severely affected parts. Use sterile tools and pots. There is no chemical cure — prevention through proper drainage is key.',
          ru: 'Удалите и уничтожьте сильно поражённые части. Используйте стерильный инструмент и горшки. Химического лечения нет — лучший способ защиты — правильный дренаж.',
        },
      },
    ],
    pests: [
      {
        id: 'spider-mites',
        name: { en: 'Spider mites', ru: 'Паутинный клещ' },
        signs: {
          en: 'Fine webbing on leaf undersides, pale stippling on the upper surface, dull drying foliage.',
          ru: 'Тонкая паутина на изнанке листьев, светлые точки сверху, тусклая подсыхающая листва.',
        },
        treatment: {
          en: 'Rinse with water, raise humidity and apply insecticidal soap or neem oil weekly until clear.',
          ru: 'Промойте водой, повысьте влажность и еженедельно обрабатывайте инсектицидным мылом или маслом нима до исчезновения.',
        },
      },
      {
        id: 'mealybugs',
        name: { en: 'Mealybugs', ru: 'Мучнистый червец' },
        signs: {
          en: 'White cottony clusters in leaf axils and along stems; sticky residue on leaves below.',
          ru: 'Белые ватообразные скопления в пазухах листьев и вдоль стеблей; липкий налёт на листьях ниже.',
        },
        treatment: {
          en: 'Dab with alcohol-soaked cotton, then treat with insecticidal soap or neem oil and quarantine.',
          ru: 'Снимите вредителей ватной палочкой в спирте, затем обработайте инсектицидным мылом или маслом нима и изолируйте растение.',
        },
      },
      {
        id: 'fungus-gnats',
        name: { en: 'Fungus gnats', ru: 'Грибные комарики' },
        signs: {
          en: 'Tiny flies hovering around the soil; larvae in the top layer of potting mix damage fine roots.',
          ru: 'Мелкие мошки над грунтом; личинки в верхнем слое субстрата повреждают тонкие корни.',
        },
        treatment: {
          en: 'Allow the soil to dry between waterings to kill larvae. Use yellow sticky traps for adults and treat with a diluted Bti (Bacillus thuringiensis israelensis) solution.',
          ru: 'Давайте грунту подсыхать между поливами, чтобы уничтожить личинок. Для взрослых особей используйте жёлтые липкие ловушки, а грунт пролейте раствором Bti (Bacillus thuringiensis israelensis).',
        },
      },
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Epipremnum_aureum',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Money_Plant_%28Epipremnum_aureum%29_4.jpg/400px-Money_Plant_%28Epipremnum_aureum%29_4.jpg',
  },
  {
    id: 'sansevieria-trifasciata',
    commonName: 'Snake Plant',
    commonName_ru: 'Сансевиерия',
    latinName: 'Sansevieria trifasciata',
    category: 'decorative',
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
    care: {
      appearance: {
        en: 'Stiff, sword-shaped leaves up to 90 cm tall, banded with grey-green or edged with bright yellow (var. Laurentii). Grows in dense clumping rosettes from underground rhizomes; bold and architectural in any setting.',
        ru: 'Жёсткие мечевидные листья высотой до 90 см с серо-зелёным рисунком или ярко-жёлтой каймой (сорт Laurentii). Образует плотные кустовые розетки из подземных корневищ; выразительный архитектурный силуэт.',
      },
      watering: {
        en: 'Water every 2–4 weeks in summer and once a month (or less) in winter. Let the soil dry out completely between waterings — root rot from overwatering is the plant\'s only serious threat.',
        ru: 'Поливайте раз в 2–4 недели летом и раз в месяц (или реже) зимой. Каждый раз давайте грунту полностью просохнуть — корневая гниль от переувлажнения единственная серьёзная опасность для этого растения.',
      },
      temperature: {
        en: 'Comfortable at 15–30 °C; survives brief dips to 10 °C but not frost. Keep away from cold window panes and draughts in winter.',
        ru: 'Предпочитает 15–30 °C; выдерживает кратковременное снижение до 10 °C, но не мороз. Зимой держите подальше от холодных оконных стёкол и сквозняков.',
      },
      light: {
        en: 'Astonishingly adaptable — grows in deep shade but looks and grows best in bright indirect light. Direct sun is tolerated, but foliage may bleach over time.',
        ru: 'Поразительно адаптивное растение — растёт и в глубокой тени, но лучше всего выглядит при ярком рассеянном свете. Переносит прямое солнце, но листья со временем могут выгореть.',
      },
      humidity: {
        en: 'Tolerates very dry indoor air without complaint. No misting needed — it actually prefers low humidity and dislikes water sitting on its foliage.',
        ru: 'Прекрасно переносит сухой комнатный воздух. Опрыскивание не нужно — растение предпочитает низкую влажность и не любит воду на листьях.',
      },
      fertilizer: {
        en: 'Feed twice during the growing season — once in spring and once in midsummer — with a diluted succulent or general fertilizer. Excess fertiliser causes floppy, weak leaves.',
        ru: 'Подкармливайте дважды за вегетационный сезон — весной и в середине лета — разведённым суккулентным или универсальным удобрением. Избыток питания приводит к образованию мягких, поникающих листьев.',
      },
      soil: {
        en: 'Fast-draining cactus or succulent mix. Standard potting soil retains too much moisture and invites root rot.',
        ru: 'Быстро дренируемый грунт для кактусов и суккулентов. Обычный цветочный грунт удерживает слишком много влаги и провоцирует корневую гниль.',
      },
      repotting: {
        en: 'Every 3–4 years in spring, or when roots lift the plant out of the pot. Sansevierias actually bloom more readily when pot-bound — don\'t rush to repot.',
        ru: 'Раз в 3–4 года весной, или когда корни начнут приподнимать растение. В тесном горшке сансевиерия охотнее зацветает — не спешите с пересадкой.',
      },
      pruning: {
        en: 'Remove entire yellowed or damaged leaves by cutting them at the base. You may trim a leaf tip to control height, but the cut edge will not regenerate — it will simply dry.',
        ru: 'Полностью удаляйте пожелтевшие или повреждённые листья у основания. Можно обрезать кончик листа для ограничения высоты, но он больше не отрастёт — просто подсохнет.',
      },
      phytodesign: {
        en: 'Perfect vertical accent for offices, bedrooms, bathrooms and hallways. Thrives in neglect — ideal for frequently forgotten corners and night-time oxygen in the bedroom.',
        ru: 'Отличный вертикальный акцент для офисов, спален, ванных и коридоров. Процветает при минимальном уходе — идеальное растение для «забываемых» уголков и ночного обогащения воздуха кислородом.',
      },
    },
    propagation: [
      {
        id: 'division',
        name: { en: 'Division', ru: 'Деление куста' },
        steps: {
          en: '1. Remove the plant from its pot in spring.\n2. Separate the rhizome clumps with a clean knife, ensuring each section has roots and at least one leaf.\n3. Let the cut surfaces dry for an hour.\n4. Pot each division into fast-draining succulent mix and water lightly.',
          ru: '1. Достаньте растение из горшка весной.\n2. Разрежьте корневище чистым ножом так, чтобы каждая часть имела корни и хотя бы один лист.\n3. Дайте срезам подсохнуть в течение часа.\n4. Посадите каждую часть в быстродренируемый субстрат для суккулентов и слегка полейте.',
        },
      },
      {
        id: 'leaf-cuttings',
        name: { en: 'Leaf cuttings', ru: 'Листовые черенки' },
        steps: {
          en: '1. Cut a healthy leaf into 5–8 cm sections.\n2. Mark the top of each section (upright orientation matters).\n3. Let the cuts dry for 1–2 days, then insert the bottom end into moist sand or cactus mix.\n4. Roots and small shoots form in 6–10 weeks. Note: variegated edges will not be preserved with this method.',
          ru: '1. Нарежьте здоровый лист на отрезки по 5–8 см.\n2. Отметьте верх каждого отрезка (вертикальная ориентация обязательна).\n3. Дайте срезам подсохнуть 1–2 дня, затем заглубите нижний конец во влажный песок или грунт для кактусов.\n4. Корни и маленькие побеги появятся через 6–10 недель. Важно: пёстрая кайма при таком способе не сохраняется.',
        },
      },
    ],
    diseases: [
      {
        id: 'root-rot',
        name: { en: 'Root rot', ru: 'Корневая гниль' },
        description: {
          en: 'The main risk for sansevierias. Leaves turn yellow and soft at the base; the rhizome feels mushy. Almost always caused by overwatering or poor drainage.',
          ru: 'Главная угроза для сансевиерии. Листья желтеют и размягчаются у основания, корневище становится кашеобразным. Почти всегда вызвано переливом или плохим дренажом.',
        },
        treatment: {
          en: 'Remove, trim all rotted tissue, dust with charcoal, allow to dry for 24 hours and repot in fresh cactus mix. Do not water for 2 weeks afterwards.',
          ru: 'Извлеките растение, срежьте всю гнилую ткань, присыпьте углём, дайте подсохнуть 24 часа и пересадите в свежий грунт для кактусов. Не поливайте 2 недели.',
        },
      },
      {
        id: 'southern-blight',
        name: { en: 'Southern blight', ru: 'Южный фитофтороз (склеротиниоз)' },
        description: {
          en: 'White mycelium and small brown sclerotia appear at the soil line; affected leaves collapse rapidly. Caused by Sclerotium rolfsii in warm, moist conditions.',
          ru: 'У поверхности грунта появляется белый мицелий и мелкие коричневые склероции; поражённые листья быстро падают. Возбудитель — Sclerotium rolfsii в тёплых и влажных условиях.',
        },
        treatment: {
          en: 'Remove affected soil, treat with a broad-spectrum fungicide. Avoid overhead watering and improve drainage.',
          ru: 'Удалите поражённый грунт, обработайте широкоспектральным фунгицидом. Избегайте полива по листьям и улучшите дренаж.',
        },
      },
    ],
    pests: [
      {
        id: 'spider-mites',
        name: { en: 'Spider mites', ru: 'Паутинный клещ' },
        signs: {
          en: 'Fine webbing and pale speckles on leaves, especially in hot dry conditions.',
          ru: 'Тонкая паутина и светлые крапины на листьях, особенно при жаре и сухом воздухе.',
        },
        treatment: {
          en: 'Wipe leaves with a damp cloth, raise humidity slightly and apply neem oil or insecticidal soap.',
          ru: 'Протрите листья влажной тканью, слегка повысьте влажность и обработайте маслом нима или инсектицидным мылом.',
        },
      },
      {
        id: 'mealybugs',
        name: { en: 'Mealybugs', ru: 'Мучнистый червец' },
        signs: {
          en: 'White fluffy deposits at leaf bases or in the heart of the rosette.',
          ru: 'Белые пушистые скопления у основания листьев или в центре розетки.',
        },
        treatment: {
          en: 'Dab with alcohol, then treat with insecticidal soap or neem oil. Repeat every 7–10 days until gone.',
          ru: 'Удалите спиртом, затем обработайте инсектицидным мылом или маслом нима. Повторяйте каждые 7–10 дней до исчезновения.',
        },
      },
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Dracaena_trifasciata',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Snake_Plant_%28Sansevieria_trifasciata_%27Laurentii%27%29.jpg/400px-Snake_Plant_%28Sansevieria_trifasciata_%27Laurentii%27%29.jpg',
  },
  {
    id: 'spathiphyllum',
    commonName: 'Peace Lily',
    commonName_ru: 'Спатифиллум',
    latinName: 'Spathiphyllum wallisii',
    category: 'flowering',
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
    care: {
      appearance: {
        en: 'Graceful, dark green lance-shaped leaves and distinctive white spathes (modified leaves) surrounding a cream spadix. Blooms mainly in spring and sometimes again in autumn; indoors reaches 60–90 cm.',
        ru: 'Изящные тёмно-зелёные ланцетные листья и характерные белые покрывала (видоизменённые листья) вокруг кремового початка. Цветёт преимущественно весной, иногда повторно осенью; в помещении достигает 60–90 см.',
      },
      watering: {
        en: 'Water when the top 2 cm of soil dry out, or as soon as leaves begin to droop slightly — a reliable built-in signal. Empty the saucer promptly; Peace Lily hates waterlogged roots.',
        ru: 'Поливайте, когда верхние 2 см грунта просохнут, или как только листья слегка поникнут — это надёжный природный сигнал. Сразу сливайте воду из поддона: спатифиллум не переносит застоя у корней.',
      },
      temperature: {
        en: 'Comfortable at 18–28 °C. Avoid temperatures below 13 °C and cold draughts — chilled leaves develop blackened edges rapidly.',
        ru: 'Предпочитает 18–28 °C. Не допускайте охлаждения ниже 13 °C и сквозняков — от холода края листьев быстро чернеют.',
      },
      light: {
        en: 'Thrives in medium to bright indirect light; tolerates low light but blooms less. Direct sun scorches the delicate leaves, leaving pale brown patches.',
        ru: 'Хорошо растёт при среднем и ярком рассеянном свете; переносит полутень, но цветёт реже. Прямые лучи обжигают нежные листья, оставляя бледно-коричневые пятна.',
      },
      humidity: {
        en: 'Loves high humidity (50%+). Mist leaves regularly, place the pot on a pebble tray with water or run a humidifier nearby. Brown leaf tips signal air that is too dry.',
        ru: 'Любит высокую влажность (от 50%). Регулярно опрыскивайте листья, поставьте горшок на поддон с мокрой галькой или используйте увлажнитель. Побурение кончиков листьев — признак слишком сухого воздуха.',
      },
      fertilizer: {
        en: 'Feed every 4 weeks in spring and summer with a balanced liquid fertilizer at half strength. A phosphorus-rich bloom booster in spring helps trigger flowering. No feeding in autumn and winter.',
        ru: 'Подкармливайте каждые 4 недели с весны до конца лета сбалансированным удобрением в половинной дозе. Фосфорное удобрение весной стимулирует цветение. Осенью и зимой подкормки прекращают.',
      },
      soil: {
        en: 'Rich, well-draining compost-based mix with added perlite or bark. The soil should stay consistently moist but never waterlogged.',
        ru: 'Богатый, хорошо дренированный торфяной или компостный грунт с добавлением перлита или коры. Грунт должен оставаться равномерно влажным, но не мокрым.',
      },
      repotting: {
        en: 'Every 1–2 years in spring, one pot size up. Peace Lily blooms better when slightly root-bound — avoid over-potting into a much larger container.',
        ru: 'Раз в 1–2 года весной, увеличивая горшок на один размер. В слегка тесноватом горшке спатифиллум цветёт охотнее — не пересаживайте в слишком большую ёмкость.',
      },
      flowering: {
        en: 'White spathes appear in spring (and sometimes autumn) in bright indirect light with regular feeding. When spathes turn green, cut the entire stem at the base to encourage new blooms.',
        ru: 'Белые покрывала появляются весной (иногда повторно осенью) при ярком рассеянном свете и регулярных подкормках. Когда покрывала зеленеют, срезайте цветонос полностью у основания — это стимулирует новые бутоны.',
      },
      phytodesign: {
        en: 'Elegant choice for living rooms, bedrooms and offices with moderate light. The white blooms brighten shaded corners and the plant doubles as an excellent air purifier.',
        ru: 'Изящное решение для гостиных, спален и офисов с умеренным освещением. Белые цветы освежают затенённые уголки, а растение эффективно очищает воздух.',
      },
    },
    propagation: [
      {
        id: 'division',
        name: { en: 'Division', ru: 'Деление куста' },
        steps: {
          en: '1. Remove the plant from its pot in spring.\n2. Gently pull apart the clump into sections, each with several leaves and healthy roots.\n3. Pot each section in fresh moist potting mix.\n4. Keep in a warm, humid spot and water moderately until established.',
          ru: '1. Достаньте растение из горшка весной.\n2. Аккуратно разделите куст на части, каждая из которых должна иметь несколько листьев и здоровые корни.\n3. Посадите каждую часть в свежий влажный грунт.\n4. Держите в тёплом влажном месте, умеренно поливая до приживания.',
        },
      },
    ],
    diseases: [
      {
        id: 'root-rot',
        name: { en: 'Root rot', ru: 'Корневая гниль' },
        description: {
          en: 'Overwatering leads to dark, mushy roots; leaves yellow, wilt even after watering and the stem base softens.',
          ru: 'При переувлажнении корни темнеют и размягчаются; листья желтеют, вянут даже после полива, основание стебля размягчается.',
        },
        treatment: {
          en: 'Trim all rotted roots, treat with charcoal, repot into fresh well-draining mix and adjust the watering schedule.',
          ru: 'Срежьте все сгнившие корни, обработайте углём, пересадите в свежий дренированный грунт и скорректируйте режим полива.',
        },
      },
      {
        id: 'cylindrocladium-leaf-spot',
        name: { en: 'Cylindrocladium leaf spot', ru: 'Пятнистость листьев (цилиндрокладиум)' },
        description: {
          en: 'Brown to tan spots with yellow halos on the leaves, often merging in humid conditions. Caused by Cylindrocladium spathiphylli fungus.',
          ru: 'Коричневые или бежевые пятна с жёлтым ореолом на листьях, сливающиеся при высокой влажности. Вызвано грибком Cylindrocladium spathiphylli.',
        },
        treatment: {
          en: 'Remove affected leaves, improve air circulation, avoid wetting the foliage and apply a copper-based fungicide.',
          ru: 'Удалите поражённые листья, улучшите вентиляцию, избегайте намокания листвы и обработайте медьсодержащим фунгицидом.',
        },
      },
    ],
    pests: [
      {
        id: 'spider-mites',
        name: { en: 'Spider mites', ru: 'Паутинный клещ' },
        signs: {
          en: 'Fine webbing on the undersides of leaves, pale stippling and dull, drooping foliage.',
          ru: 'Тонкая паутина на изнанке листьев, светлые крапины и тусклая поникающая листва.',
        },
        treatment: {
          en: 'Rinse the plant, raise humidity and apply insecticidal soap or neem oil weekly for 3–4 weeks.',
          ru: 'Промойте растение, повысьте влажность и обрабатывайте инсектицидным мылом или маслом нима еженедельно в течение 3–4 недель.',
        },
      },
      {
        id: 'mealybugs',
        name: { en: 'Mealybugs', ru: 'Мучнистый червец' },
        signs: {
          en: 'White cottony tufts at leaf bases and in the crown; slow growth and sticky honeydew residue.',
          ru: 'Белые ватообразные скопления у основания листьев и в центре розетки; замедление роста и липкий налёт.',
        },
        treatment: {
          en: 'Remove with an alcohol-soaked cotton swab and treat with neem oil or insecticidal soap; quarantine the plant.',
          ru: 'Удалите ватной палочкой в спирте и обработайте маслом нима или инсектицидным мылом; изолируйте растение.',
        },
      },
      {
        id: 'aphids',
        name: { en: 'Aphids', ru: 'Тля' },
        signs: {
          en: 'Clusters of small green or black insects on new growth and flower stems; sticky leaves and distorted buds.',
          ru: 'Скопления мелких зелёных или чёрных насекомых на молодых побегах и цветоносах; липкие листья и деформированные бутоны.',
        },
        treatment: {
          en: 'Knock off with a strong water spray, then apply insecticidal soap or neem oil. Repeat every 5–7 days.',
          ru: 'Смойте сильной струёй воды, затем обработайте инсектицидным мылом или маслом нима. Повторяйте каждые 5–7 дней.',
        },
      },
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Spathiphyllum',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Spathiphyllum_cochlearispathum_RTBG.jpg/400px-Spathiphyllum_cochlearispathum_RTBG.jpg',
  },
  {
    id: 'chlorophytum-comosum',
    commonName: 'Spider Plant',
    commonName_ru: 'Хлорофитум',
    latinName: 'Chlorophytum comosum',
    category: 'decorative',
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
    care: {
      appearance: {
        en: 'Arching, strap-like leaves with a white or cream central stripe (cv. Vittatum) or white leaf margins (cv. Variegatum). Sends out long runners bearing small plantlets (spiderettes) at the tips — one of its most charming features.',
        ru: 'Дугообразные ремневидные листья с белой или кремовой центральной полосой (сорт Vittatum) или белыми краями (сорт Variegatum). Выпускает длинные усы с маленькими «паучками» на концах — одна из самых привлекательных его особенностей.',
      },
      watering: {
        en: 'Water when the top 2 cm of soil dry out — roughly every 7 days in summer. Allow slightly longer drying time in winter. The fleshy roots store water and tolerate short drought.',
        ru: 'Поливайте, когда верхние 2 см грунта просохнут — примерно раз в 7 дней летом. Зимой давайте грунту просыхать чуть дольше. Мясистые корни запасают воду и переносят кратковременную засуху.',
      },
      temperature: {
        en: 'Adapts well to 10–30 °C, making it one of the hardiest houseplants for cool hallways, conservatories and unheated rooms.',
        ru: 'Отлично приспосабливается к диапазону 10–30 °C — одно из самых неприхотливых растений для прохладных прихожих, зимних садов и нетопленых помещений.',
      },
      light: {
        en: 'Prefers bright indirect light to maintain leaf colour and variegation. Tolerates moderate shade but variegation may fade; avoid prolonged direct sun which scorches the tips.',
        ru: 'Предпочитает яркий рассеянный свет для сохранения окраски листьев. Переносит полутень, но пёстрость может поблекнуть; избегайте продолжительного прямого солнца — от него кончики листьев обгорают.',
      },
      humidity: {
        en: 'Tolerates ordinary indoor air. High fluoride or chlorine in tap water causes persistent brown leaf tips — switch to filtered or overnight-rested water.',
        ru: 'Переносит обычный комнатный воздух. Избыток фтора или хлора в водопроводной воде вызывает хроническое побурение кончиков листьев — используйте отфильтрованную или отстоявшуюся воду.',
      },
      fertilizer: {
        en: 'Feed every 2–4 weeks in spring and summer with a balanced liquid fertilizer at half strength. Excess fertiliser quickly causes brown tips — less is more.',
        ru: 'Подкармливайте каждые 2–4 недели с весны до конца лета сбалансированным удобрением в половинной дозе. Избыток питания вызывает побурение кончиков — лучше меньше да лучше.',
      },
      soil: {
        en: 'Any free-draining potting mix. The fleshy roots rot in permanently wet soil — good drainage holes are essential.',
        ru: 'Любой хорошо дренированный грунт. Мясистые корни загнивают при постоянном переувлажнении — наличие дренажных отверстий обязательно.',
      },
      repotting: {
        en: 'Every 1–2 years in spring. Overcrowded fleshy roots can crack plastic pots — check the pot annually and repot when roots push through the drainage holes.',
        ru: 'Раз в 1–2 года весной. Разросшиеся мясистые корни способны расколоть пластиковый горшок — ежегодно проверяйте и пересаживайте, когда корни покажутся из отверстий.',
      },
      pruning: {
        en: 'Cut back dead or heavily brown-tipped leaves at the base. Trim runners once you have enough spiderettes — the plantlets can be potted up or simply removed.',
        ru: 'Срезайте засохшие или сильно побуревшие листья у основания. Обрезайте усы, когда наберётся достаточно «паучков» — детки можно укоренить или просто удалить.',
      },
      phytodesign: {
        en: 'Excellent in hanging baskets where runners can cascade freely; also charming on shelves or windowsills. Fast-growing, easy to divide and a popular "starter" gift plant.',
        ru: 'Прекрасно смотрится в кашпо, где усы с «паучками» свободно свисают; эффектен и на полках или подоконниках. Быстро растёт, легко делится — отличный подарок для начинающих.',
      },
    },
    propagation: [
      {
        id: 'spiderettes',
        name: { en: 'Spiderette plantlets', ru: 'Дочерние розетки («паучки»)' },
        steps: {
          en: '1. Select a spiderette with visible aerial roots on a runner.\n2. Pin it gently into a small pot of moist soil while still attached, or snip it off with a short piece of the runner.\n3. Keep the soil moist; roots anchor within 2–4 weeks.\n4. Sever the runner once the new plant is growing on its own.',
          ru: '1. Выберите «паучка» с заметными воздушными корешками на усе.\n2. Пришпильте его в маленький горшок с влажным грунтом, не отрезая, или срежьте с небольшим отрезком уса.\n3. Поддерживайте грунт влажным; укоренение за 2–4 недели.\n4. Отделите ус, когда новое растение тронется в рост.',
        },
      },
      {
        id: 'division',
        name: { en: 'Division', ru: 'Деление куста' },
        steps: {
          en: '1. Remove the plant from its pot in spring.\n2. Divide the root clump into sections with a clean knife, ensuring each has several leaves and roots.\n3. Pot each section in fresh potting mix and water moderately until established.',
          ru: '1. Достаньте растение из горшка весной.\n2. Разделите корневой ком чистым ножом на части — у каждой должны быть листья и корни.\n3. Посадите каждую часть в свежий грунт и умеренно поливайте до укоренения.',
        },
      },
    ],
    diseases: [
      {
        id: 'root-rot',
        name: { en: 'Root rot', ru: 'Корневая гниль' },
        description: {
          en: 'Caused by consistently wet soil. Leaves turn yellow and the fleshy roots become dark and mushy.',
          ru: 'Возникает при постоянно переувлажнённом грунте. Листья желтеют, мясистые корни темнеют и размягчаются.',
        },
        treatment: {
          en: 'Remove the plant, trim rotted roots, repot in fresh well-draining mix and reduce watering frequency.',
          ru: 'Достаньте растение, срежьте гнилые корни, пересадите в свежий дренированный грунт и сократите полив.',
        },
      },
      {
        id: 'tip-burn',
        name: { en: 'Tip burn', ru: 'Побурение кончиков (физиологическое)' },
        description: {
          en: 'Brown, dry leaf tips — not a disease but a physiological response to fluoride or chlorine in tap water, low humidity or over-fertilising.',
          ru: 'Коричневые сухие кончики листьев — не болезнь, а физиологическая реакция на фтор и хлор в водопроводной воде, сухой воздух или избыток удобрений.',
        },
        treatment: {
          en: 'Switch to filtered or rain water, trim brown tips with scissors, lower fertiliser doses and raise humidity slightly.',
          ru: 'Перейдите на фильтрованную или дождевую воду, обрежьте коричневые кончики ножницами, снизьте дозу удобрений и немного повысьте влажность.',
        },
      },
    ],
    pests: [
      {
        id: 'spider-mites',
        name: { en: 'Spider mites', ru: 'Паутинный клещ' },
        signs: {
          en: 'Fine webbing and pale speckles on leaves, especially in dry air.',
          ru: 'Тонкая паутина и светлые крапины на листьях, особенно в сухом воздухе.',
        },
        treatment: {
          en: 'Rinse the plant, raise humidity and treat with insecticidal soap or neem oil weekly.',
          ru: 'Промойте растение, повысьте влажность и еженедельно обрабатывайте инсектицидным мылом или маслом нима.',
        },
      },
      {
        id: 'aphids',
        name: { en: 'Aphids', ru: 'Тля' },
        signs: {
          en: 'Clusters of small insects on young leaves and runners; sticky honeydew and leaf curling.',
          ru: 'Скопления мелких насекомых на молодых листьях и усах; липкая падь и скручивание листьев.',
        },
        treatment: {
          en: 'Knock off with water, then apply insecticidal soap or neem oil. Repeat every 5 days until clear.',
          ru: 'Смойте водой, затем обработайте инсектицидным мылом или маслом нима. Повторяйте каждые 5 дней до исчезновения.',
        },
      },
      {
        id: 'fungus-gnats',
        name: { en: 'Fungus gnats', ru: 'Грибные комарики' },
        signs: {
          en: 'Small flies around the soil surface; larvae damage fine roots causing wilting and yellowing.',
          ru: 'Мелкие мошки у поверхности грунта; личинки повреждают тонкие корни, вызывая увядание и пожелтение.',
        },
        treatment: {
          en: 'Let the soil dry fully between waterings, use yellow sticky traps for adults, and drench with a Bti solution.',
          ru: 'Давайте грунту полностью просыхать между поливами, используйте жёлтые липкие ловушки для взрослых особей и пролейте грунт раствором Bti.',
        },
      },
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Chlorophytum_comosum',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Hierbabuena_0611_Revised.jpg/400px-Hierbabuena_0611_Revised.jpg',
  },
  {
    id: 'zamioculcas-zamiifolia',
    commonName: 'ZZ Plant',
    commonName_ru: 'Замиокулькас',
    latinName: 'Zamioculcas zamiifolia',
    category: 'decorative',
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
    care: {
      appearance: {
        en: 'Upright, pinnate stems bearing pairs of small, rounded, intensely glossy dark-green leaflets. Grows from large underground rhizomes that store water; reaches 60–90 cm indoors with a tidy, symmetrical form.',
        ru: 'Прямостоячие перистые стебли с парами маленьких, округлых, интенсивно блестящих тёмно-зелёных листочков. Растёт из крупных подземных корневищ, запасающих воду; в помещении достигает 60–90 см, сохраняя аккуратную симметричную форму.',
      },
      watering: {
        en: 'Water only when the soil has dried out completely — every 2–4 weeks in summer, monthly or less in winter. The rhizomes store enough water to survive weeks of neglect; soggy soil is the main killer.',
        ru: 'Поливайте только когда грунт полностью просохнет — раз в 2–4 недели летом, раз в месяц или реже зимой. Корневища накапливают достаточно воды, чтобы пережить недели без полива; переувлажнённый грунт — главная угроза.',
      },
      temperature: {
        en: 'Comfortable at 15–30 °C. Tolerates brief dips to 10 °C but must not experience frost or prolonged contact with cold window panes.',
        ru: 'Комфортная температура — 15–30 °C. Переносит кратковременное снижение до 10 °C, но не мороз и длительный контакт с холодным стеклом.',
      },
      light: {
        en: 'Tolerates low light better than almost any other glossy-leaved plant, but grows faster and looks more lush in bright indirect light. Avoid direct midday sun which can yellow the leaves.',
        ru: 'Переносит слабое освещение лучше почти любого другого глянцелистного растения, но при ярком рассеянном свете растёт быстрее и выглядит пышнее. Избегайте прямого полуденного солнца — оно может пожелтить листья.',
      },
      humidity: {
        en: 'Perfectly happy in dry indoor air. No misting required — its succulent stems and rhizomes handle low humidity with ease.',
        ru: 'Прекрасно чувствует себя в сухом комнатном воздухе. Опрыскивание не требуется — суккулентные стебли и корневища легко справляются с низкой влажностью.',
      },
      fertilizer: {
        en: 'Feed once a month in spring and summer with a diluted balanced liquid fertilizer. Very little is enough — the rhizomes already provide substantial reserves.',
        ru: 'Подкармливайте раз в месяц с весны до конца лета разведённым сбалансированным удобрением. Совсем небольшая доза достаточна — корневища уже снабжают растение питательными веществами.',
      },
      soil: {
        en: 'Cactus or succulent mix, or regular potting soil with 20–30% perlite added. Fast drainage is essential to prevent rhizome rot.',
        ru: 'Грунт для кактусов и суккулентов или универсальный грунт с добавлением 20–30% перлита. Быстрый дренаж необходим для защиты корневищ от гнили.',
      },
      repotting: {
        en: 'Every 2–3 years; the expanding rhizomes may crack thin plastic pots. Repot in spring into a heavy pot for stability.',
        ru: 'Раз в 2–3 года; разросшиеся корневища могут расколоть тонкий пластик. Пересаживайте весной в устойчивый, желательно тяжёлый горшок.',
      },
      pruning: {
        en: 'Remove individual yellowed stems at the base with a clean cut. Do not cut in the middle of a stem — it will not regrow from the cut point.',
        ru: 'Удаляйте пожелтевшие стебли чистым срезом у основания. Не обрезайте стебель посередине — от места среза он не отрастёт.',
      },
      phytodesign: {
        en: 'Ideal low-maintenance statement plant for offices, hotel lobbies and dim hallways. Its symmetrical glossy stems suit contemporary, Scandi and mid-century modern interiors equally well.',
        ru: 'Идеальное неприхотливое акцентное растение для офисов, лобби и тёмных коридоров. Симметричные глянцевые стебли органично вписываются в современный, скандинавский и ретро-модернистский интерьер.',
      },
    },
    propagation: [
      {
        id: 'division',
        name: { en: 'Rhizome division', ru: 'Деление корневища' },
        steps: {
          en: '1. Remove the plant in spring and shake off the soil to expose the rhizomes.\n2. Cut the clump with a sharp, clean knife into sections each with at least one stem.\n3. Allow the cuts to callus for a day.\n4. Pot into fast-draining mix and withhold water for 1–2 weeks to encourage rooting.',
          ru: '1. Достаньте растение весной и стряхните грунт, обнажив корневища.\n2. Разрежьте ком острым чистым ножом на части — у каждой должен быть хотя бы один стебель.\n3. Дайте срезам затянуться сутки.\n4. Посадите в быстродренируемый грунт и воздержитесь от полива 1–2 недели для стимуляции корнеобразования.',
        },
      },
      {
        id: 'leaf-cuttings',
        name: { en: 'Leaf cuttings', ru: 'Листовые черенки' },
        steps: {
          en: '1. Remove a healthy leaf with its petiole and allow the base to dry for a few hours.\n2. Insert the petiole into moist well-draining mix.\n3. Keep in a warm spot (22–25 °C) with indirect light.\n4. A tiny rhizome and new shoots form after 9–12 months — this method is slow but works.',
          ru: '1. Срежьте здоровый лист с черешком и дайте основанию подсохнуть несколько часов.\n2. Заглубите черешок во влажный дренированный грунт.\n3. Держите в тёплом месте (22–25 °C) при рассеянном свете.\n4. Маленькое корневище и новые побеги появятся через 9–12 месяцев — метод медленный, но работает.',
        },
      },
    ],
    diseases: [
      {
        id: 'root-rot',
        name: { en: 'Root rot / Rhizome rot', ru: 'Гниль корней и корневищ' },
        description: {
          en: 'The primary disease risk. Caused by overwatering: rhizomes and roots turn brown and mushy, stems yellow and collapse.',
          ru: 'Главная болезненная угроза. Вызвана переливом: корневища и корни буреют и размягчаются, стебли желтеют и падают.',
        },
        treatment: {
          en: 'Remove the plant, trim all affected tissue, dust with charcoal, allow to dry for 24 hours and repot in fresh cactus mix. Do not water for 2 weeks.',
          ru: 'Достаньте растение, срежьте всю поражённую ткань, присыпьте углём, дайте подсохнуть 24 часа и пересадите в свежий грунт для кактусов. Не поливайте 2 недели.',
        },
      },
    ],
    pests: [
      {
        id: 'mealybugs',
        name: { en: 'Mealybugs', ru: 'Мучнистый червец' },
        signs: {
          en: 'White cottony deposits at the base of stems or hidden among the rhizomes; slow growth and sticky residue.',
          ru: 'Белые ватообразные скопления у основания стеблей или среди корневищ; замедление роста и липкий налёт.',
        },
        treatment: {
          en: 'Dab with alcohol, apply neem oil or insecticidal soap and quarantine the plant. Check rhizomes carefully when repotting.',
          ru: 'Обработайте спиртом, нанесите масло нима или инсектицидное мыло и изолируйте растение. При пересадке тщательно проверьте корневища.',
        },
      },
      {
        id: 'scale',
        name: { en: 'Scale insects', ru: 'Щитовка' },
        signs: {
          en: 'Brown waxy bumps along stems that are difficult to remove, with sticky honeydew below.',
          ru: 'Коричневые восковые бугорки на стеблях, которые трудно стереть, и липкая падь ниже.',
        },
        treatment: {
          en: 'Scrape off the shells with a soft brush, wipe with alcohol and apply neem oil or a systemic insecticide.',
          ru: 'Соскоблите щитки мягкой щёткой, протрите спиртом и обработайте маслом нима или системным инсектицидом.',
        },
      },
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Zamioculcas',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Zamioculcas_zamiifolia_1.jpg/400px-Zamioculcas_zamiifolia_1.jpg',
  },
  {
    id: 'aloe-vera',
    commonName: 'Aloe Vera',
    commonName_ru: 'Алоэ вера',
    latinName: 'Aloe vera',
    category: 'succulent',
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
    care: {
      appearance: {
        en: 'A stemless or short-stemmed succulent forming dense rosettes of thick, fleshy, grey-green lance-shaped leaves edged with small whitish teeth. Leaves contain a clear gel used medicinally for burns and skin care. Reaches 60–90 cm at maturity.',
        ru: 'Бесстебельный или короткостебельный суккулент, образующий плотные розетки из толстых мясистых серо-зелёных листьев с мелкими беловатыми зубцами. Листья содержат прозрачный гель, веками применяемый при ожогах и уходе за кожей. Достигает 60–90 см.',
      },
      watering: {
        en: 'Water deeply every 2–3 weeks in summer, letting the soil dry out completely between sessions. In winter, once a month is usually sufficient. Tip any excess water from the saucer — aloe rots quickly in standing water.',
        ru: 'Обильно поливайте раз в 2–3 недели летом, давая грунту полностью просыхать между поливами. Зимой обычно достаточно раз в месяц. Сливайте воду из поддона — алоэ быстро загнивает от застоя.',
      },
      temperature: {
        en: 'Thrives at 18–35 °C; tolerates brief dips to 10 °C but is frost-sensitive. Move indoors before the first frost in temperate climates.',
        ru: 'Хорошо развивается при 18–35 °C; переносит кратковременное снижение до 10 °C, но не мороз. В умеренном климате убирайте в помещение до первых заморозков.',
      },
      light: {
        en: 'Needs several hours of direct or very bright indirect sunlight daily. South- or west-facing windows are ideal. Insufficient light produces tall, floppy, pale leaves leaning towards the window.',
        ru: 'Требует нескольких часов прямого или очень яркого рассеянного солнца в день. Лучшее место — подоконник южного или западного окна. При недостатке света листья вытягиваются, бледнеют и клонятся к свету.',
      },
      humidity: {
        en: 'Requires low humidity typical of desert conditions. Do not mist the foliage and avoid placing near kitchen steam or humidifiers.',
        ru: 'Требует низкой влажности, характерной для пустынного климата. Не опрыскивайте листья и не ставьте рядом с кухонным паром или увлажнителями.',
      },
      fertilizer: {
        en: 'Feed once or twice a year — in spring and midsummer — with a diluted succulent fertilizer. Over-fertilising causes rapid, weak growth. No feeding in autumn and winter.',
        ru: 'Подкармливайте один-два раза в год — весной и в середине лета — разведённым удобрением для суккулентов. Избыток питания приводит к быстрому, но слабому росту. Осенью и зимой не подкармливают.',
      },
      soil: {
        en: 'Well-draining cactus or succulent mix; add extra coarse sand or grit for optimal drainage. Never use moisture-retaining compost.',
        ru: 'Хорошо дренированный грунт для кактусов или суккулентов; добавьте крупный песок или гравий для оптимального дренажа. Никогда не используйте влагоудерживающий торф.',
      },
      repotting: {
        en: 'Every 2–3 years in spring, or when offsets crowd the pot. Use a terracotta pot — the porous walls help the soil dry faster and prevent root rot.',
        ru: 'Раз в 2–3 года весной, или когда дочерние розетки загромождают горшок. Используйте терракотовый горшок — пористые стенки помогают грунту быстрее просыхать.',
      },
      pruning: {
        en: 'Remove old or damaged outer leaves close to the stem. Harvest the gel from the lower outer leaves as needed by cutting the leaf at the base.',
        ru: 'Удаляйте старые или повреждённые нижние листья близко к стеблю. Гель получают, срезая нижние листья у основания.',
      },
      phytodesign: {
        en: 'Practical and sculptural — suits sunny windowsills, kitchen counters (handy for minor burns) and minimal or desert-themed interiors.',
        ru: 'Практичное и sculptural растение — украсит солнечный подоконник, кухонную столешницу (пригодится при лёгких ожогах) и минималистичный или пустынный интерьер.',
      },
    },
    propagation: [
      {
        id: 'offsets',
        name: { en: 'Offsets (pups)', ru: 'Дочерние розетки (отпрыски)' },
        steps: {
          en: '1. Wait until the offset reaches 5–7 cm and has its own roots.\n2. Ease the plant out of the pot and gently separate the offset with a clean knife.\n3. Let the cut callus for 1–2 days in a dry shaded spot.\n4. Pot into cactus mix and withhold water for a week to encourage rooting.',
          ru: '1. Дождитесь, пока отпрыск достигнет 5–7 см и пустит собственные корни.\n2. Достаньте растение из горшка и аккуратно отделите детку чистым ножом.\n3. Дайте срезу затянуться 1–2 дня в сухом притенённом месте.\n4. Посадите в грунт для кактусов и воздержитесь от полива неделю для укоренения.',
        },
      },
    ],
    diseases: [
      {
        id: 'root-rot',
        name: { en: 'Root rot', ru: 'Корневая гниль' },
        description: {
          en: 'Caused by overwatering. Leaves turn yellow-brown and mushy at the base; roots are dark and slimy.',
          ru: 'Вызвана переливом. Листья желтеют и размягчаются у основания, корни тёмные и слизистые.',
        },
        treatment: {
          en: 'Remove, trim all rotted tissue, let dry for 24 hours, and repot in fresh cactus mix. Water only after 2 weeks.',
          ru: 'Достаньте, срежьте всю гнилую ткань, дайте подсохнуть 24 часа и пересадите в свежий грунт для кактусов. Не поливайте 2 недели.',
        },
      },
      {
        id: 'aloe-rust',
        name: { en: 'Aloe rust', ru: 'Ржавчина алоэ' },
        description: {
          en: 'Orange-yellow pustules on the leaf surface caused by the fungus Phakopsora pachyrhizi; common in humid outdoor conditions.',
          ru: 'Оранжево-жёлтые пустулы на поверхности листьев, вызванные грибком Phakopsora pachyrhizi; чаще встречается при влажном уличном содержании.',
        },
        treatment: {
          en: 'Remove affected leaves, reduce humidity around the plant and apply a copper-based or sulphur fungicide.',
          ru: 'Удалите поражённые листья, снизьте влажность вокруг растения и обработайте медьсодержащим или серным фунгицидом.',
        },
      },
    ],
    pests: [
      {
        id: 'mealybugs',
        name: { en: 'Mealybugs', ru: 'Мучнистый червец' },
        signs: {
          en: 'White fluffy deposits in the rosette heart and between leaf bases; slow growth.',
          ru: 'Белые пушистые скопления в центре розетки и между основаниями листьев; замедление роста.',
        },
        treatment: {
          en: 'Remove with an alcohol-soaked cotton swab and treat with neem oil; repeat every 7–10 days.',
          ru: 'Удалите ватной палочкой в спирте и обработайте маслом нима; повторяйте каждые 7–10 дней.',
        },
      },
      {
        id: 'scale',
        name: { en: 'Scale insects', ru: 'Щитовка' },
        signs: {
          en: 'Hard brown bumps on the undersides of leaves; sticky honeydew and sooty mould below.',
          ru: 'Твёрдые коричневые бугорки на обратной стороне листьев; липкая падь и сажистый гриб ниже.',
        },
        treatment: {
          en: 'Scrape off with a soft brush, wipe with diluted alcohol and apply neem oil or a systemic insecticide.',
          ru: 'Соскоблите мягкой щёткой, протрите разбавленным спиртом и обработайте маслом нима или системным инсектицидом.',
        },
      },
      {
        id: 'fungus-gnats',
        name: { en: 'Fungus gnats', ru: 'Грибные комарики' },
        signs: {
          en: 'Small flies near the soil; larvae damage roots if the soil stays moist too long.',
          ru: 'Мелкие мошки у грунта; личинки повреждают корни, если грунт остаётся влажным слишком долго.',
        },
        treatment: {
          en: 'Let the soil dry completely between waterings. Use yellow sticky traps and a Bti drench for persistent infestations.',
          ru: 'Давайте грунту полностью просыхать между поливами. Используйте жёлтые ловушки; при стойком заражении пролейте Bti.',
        },
      },
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Aloe_vera',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Aloe_vera_flower_inset.png/400px-Aloe_vera_flower_inset.png',
  },
  {
    id: 'crassula-ovata',
    commonName: 'Jade Plant',
    commonName_ru: 'Толстянка',
    latinName: 'Crassula ovata',
    category: 'succulent',
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
    care: {
      appearance: {
        en: 'Develops a thick, woody trunk with oval, jade-green, fleshy leaves that may develop red edges in bright sunlight. Over decades it becomes a small tree reaching 1–1.5 m — a long-lived plant often passed between generations as a good-luck charm.',
        ru: 'Формирует толстый деревянистый ствол с овальными мясистыми листьями нефритово-зелёного цвета, которые на ярком свету приобретают красноватую кайму. За десятилетия превращается в небольшое деревце высотой 1–1,5 м — традиционный символ удачи.',
      },
      watering: {
        en: 'Water thoroughly every 2–3 weeks in spring and summer, letting the soil dry fully between waterings. In autumn and winter reduce to once a month. The thick leaves act as water reservoirs — err on the side of drought over flood.',
        ru: 'Обильно поливайте раз в 2–3 недели весной и летом, давая грунту полностью просыхать. Осенью и зимой сократите до раза в месяц. Мясистые листья — природный резервуар воды: лучше недолить, чем перелить.',
      },
      temperature: {
        en: 'Best at 18–28 °C in summer; a cool winter rest at 10–15 °C actually triggers spring flowering in mature plants. Protect from frost at all times.',
        ru: 'Летом предпочитает 18–28 °C; прохладная зимовка при 10–15 °C стимулирует весеннее цветение у взрослых растений. Берегите от мороза в любое время года.',
      },
      light: {
        en: 'Needs 4–6 hours of direct sun daily for compact, richly coloured growth. A south or west window is ideal. In lower light the stems etiolate (stretch and weaken) and leaves lose their green intensity.',
        ru: 'Требует 4–6 часов прямого солнца в день для компактного, хорошо окрашенного роста. Идеально — южный или западный подоконник. При недостатке света стебли вытягиваются и слабеют, листья теряют насыщенность.',
      },
      humidity: {
        en: 'Prefers dry to average indoor air. Do not mist — wet foliage promotes fungal rot. Good ventilation is important.',
        ru: 'Предпочитает сухой или умеренный комнатный воздух. Не опрыскивайте — влажная листва провоцирует грибковую гниль. Важна хорошая вентиляция.',
      },
      fertilizer: {
        en: 'Feed every 4–6 weeks in spring and summer with a diluted succulent fertilizer. No feeding in autumn and winter. Excess nitrogen causes rapid, leggy growth prone to toppling.',
        ru: 'Подкармливайте каждые 4–6 недель с весны до конца лета разведённым удобрением для суккулентов. Осенью и зимой не подкармливают. Избыток азота даёт быстрый, но неустойчивый рост.',
      },
      soil: {
        en: 'Gritty, fast-draining succulent or cactus mix with 30–50% perlite or coarse sand. Standard potting mix retains too much moisture and leads to root rot.',
        ru: 'Зернистый, быстродренируемый грунт для суккулентов или кактусов с 30–50% перлита или крупного песка. Обычный грунт удерживает слишком много влаги и провоцирует гниль.',
      },
      repotting: {
        en: 'Every 2–3 years in spring, using a pot only slightly larger than the root ball. Heavy terracotta pots provide stability for the increasingly heavy top growth.',
        ru: 'Раз в 2–3 года весной, увеличивая горшок незначительно. Тяжёлый терракотовый горшок обеспечит устойчивость постепенно тяжелеющего растения.',
      },
      pruning: {
        en: 'Trim in spring to shape; cutting back stems encourages branching. Remove dead or shrivelled leaves regularly. The plant can also be trained as a bonsai.',
        ru: 'Обрезайте весной для формирования кроны — укорачивание стеблей стимулирует ветвление. Регулярно удаляйте засохшие или сморщенные листья. Растение поддаётся формированию в стиле бонсай.',
      },
      flowering: {
        en: 'Small star-shaped white to pale pink flowers appear in late winter or early spring on mature plants after a cool, dry winter rest with reduced watering.',
        ru: 'Небольшие звёздчатые белые или бледно-розовые цветки появляются в конце зимы или начале весны у взрослых растений после прохладной сухой зимовки с редким поливом.',
      },
      phytodesign: {
        en: 'Iconic bonsai-like specimen for sunny windowsills, desks and shelves. The woody trunk gives it a sculptural quality that suits minimalist, Japanese and natural interiors.',
        ru: 'Культовое деревце-бонсай для солнечных подоконников, рабочих столов и полок. Деревянистый ствол придаёт ему скульптурный вид — идеально для минималистичного, японского и природного интерьера.',
      },
    },
    propagation: [
      {
        id: 'leaf-cuttings',
        name: { en: 'Leaf cuttings', ru: 'Листовые черенки' },
        steps: {
          en: '1. Gently twist a healthy leaf off the stem, ensuring a clean break.\n2. Allow the base to callus for 1–3 days in a dry shaded spot.\n3. Lay on top of or barely insert into moist cactus mix.\n4. New rosettes sprout from the base in 3–6 weeks; water sparingly.',
          ru: '1. Осторожно скрутите здоровый лист со стебля, чтобы получить чистый отрыв.\n2. Дайте основанию затянуться 1–3 дня в сухом притенённом месте.\n3. Положите на поверхность или слегка заглубите во влажный грунт для кактусов.\n4. Новые розетки появятся у основания через 3–6 недель; поливайте скудно.',
        },
      },
      {
        id: 'stem-cuttings',
        name: { en: 'Stem cuttings', ru: 'Стеблевые черенки' },
        steps: {
          en: '1. Cut a 5–10 cm stem tip in spring or summer.\n2. Remove the lower leaves and allow the cut to callus for 1–2 days.\n3. Insert into dry cactus mix and do not water for 1 week.\n4. Roots form in 4–6 weeks; resume light watering.',
          ru: '1. Весной или летом срежьте верхушечный черенок длиной 5–10 см.\n2. Удалите нижние листья и дайте срезу подсохнуть 1–2 дня.\n3. Заглубите в сухой грунт для кактусов и не поливайте неделю.\n4. Корни образуются за 4–6 недель; возобновите скудный полив.',
        },
      },
    ],
    diseases: [
      {
        id: 'root-rot',
        name: { en: 'Root rot', ru: 'Корневая гниль' },
        description: {
          en: 'Overwatering is the main cause. Stems and leaf bases turn soft and brown; the plant may collapse despite looking healthy above soil level.',
          ru: 'Главная причина — перелив. Стебли и основания листьев размягчаются и буреют; растение может упасть, несмотря на здоровый вид надземной части.',
        },
        treatment: {
          en: 'Remove, trim all mushy tissue, dust with charcoal, dry for 1–2 days and repot into fresh gritty mix. Drastically reduce watering.',
          ru: 'Извлеките, срежьте всю мягкую ткань, присыпьте углём, подсушите 1–2 дня и пересадите в свежий зернистый грунт. Резко сократите полив.',
        },
      },
      {
        id: 'powdery-mildew',
        name: { en: 'Powdery mildew', ru: 'Мучнистая роса' },
        description: {
          en: 'White floury coating on the leaves caused by fungus in poorly ventilated, humid conditions.',
          ru: 'Белый мучнистый налёт на листьях — грибок, развивающийся при плохой вентиляции и повышенной влажности.',
        },
        treatment: {
          en: 'Wipe off the coating, improve air circulation and apply a sulphur-based or systemic fungicide.',
          ru: 'Удалите налёт, улучшите вентиляцию и обработайте серосодержащим или системным фунгицидом.',
        },
      },
    ],
    pests: [
      {
        id: 'mealybugs',
        name: { en: 'Mealybugs', ru: 'Мучнистый червец' },
        signs: {
          en: 'White cottony fluff at leaf joints and stem crevices; sticky residue and slow growth.',
          ru: 'Белый пушистый налёт в пазухах листьев и щелях стебля; липкий налёт и замедление роста.',
        },
        treatment: {
          en: 'Remove with an alcohol-soaked cotton swab and treat with neem oil or insecticidal soap. Repeat every 10 days.',
          ru: 'Удалите ватной палочкой в спирте и обработайте маслом нима или инсектицидным мылом. Повторяйте каждые 10 дней.',
        },
      },
      {
        id: 'spider-mites',
        name: { en: 'Spider mites', ru: 'Паутинный клещ' },
        signs: {
          en: 'Fine webbing on the plant, pale stippling on leaf surfaces, especially in hot dry conditions.',
          ru: 'Тонкая паутина на растении, светлые точки на поверхности листьев, особенно в жару и сухом воздухе.',
        },
        treatment: {
          en: 'Rinse well, raise humidity slightly and apply neem oil or insecticidal soap weekly until clear.',
          ru: 'Хорошо промойте, слегка повысьте влажность и еженедельно обрабатывайте маслом нима или инсектицидным мылом до исчезновения.',
        },
      },
      {
        id: 'scale',
        name: { en: 'Scale insects', ru: 'Щитовка' },
        signs: {
          en: 'Brown waxy lumps on stems; sticky honeydew causing sooty mould on lower leaves.',
          ru: 'Коричневые восковые наросты на стеблях; липкая падь вызывает появление сажистого гриба на нижних листьях.',
        },
        treatment: {
          en: 'Scrape off the shells, wipe with diluted alcohol and apply neem oil or a systemic insecticide.',
          ru: 'Соскоблите щитки, протрите разведённым спиртом и обработайте маслом нима или системным инсектицидом.',
        },
      },
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Crassula_ovata',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Crassula_ovata_700.jpg/400px-Crassula_ovata_700.jpg',
  },
  {
    id: 'ficus-lyrata',
    commonName: 'Fiddle-leaf Fig',
    commonName_ru: 'Фикус лировидный',
    latinName: 'Ficus lyrata',
    category: 'decorative',
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
    care: {
      appearance: {
        en: 'Large, violin-shaped, leathery leaves with prominent pale veining, borne on an upright trunk. One of the most architecturally striking houseplants; can reach 1.5–2.5 m indoors and beyond, often branching in mature specimens.',
        ru: 'Крупные листья в форме скрипки с рельефными светлыми жилками на прямом стволе. Одно из самых архитектурно выразительных комнатных растений; в помещении достигает 1,5–2,5 м и выше, у взрослых экземпляров ветвится.',
      },
      watering: {
        en: 'Water when the top 3–4 cm of soil have dried out — roughly every 7–10 days. Consistent, moderate moisture is key: underwatering causes brown crispy leaf edges while overwatering produces dark soft spots on the leaves.',
        ru: 'Поливайте, когда верхние 3–4 см грунта просохнут — примерно раз в 7–10 дней. Главное — постоянство: от недолива появляются коричневые сухие края, от перелива — тёмные мягкие пятна на листьях.',
      },
      temperature: {
        en: 'Needs 18–30 °C and dislikes temperature fluctuations. Cold draughts, open windows or air-conditioning vents trigger leaf drop — once settled, do not move it.',
        ru: 'Требует 18–30 °C и не переносит перепадов. Сквозняки, открытые окна или потоки от кондиционера провоцируют листопад — найдите постоянное место и не переставляйте.',
      },
      light: {
        en: 'Requires bright indirect light for several hours daily — a few metres from a south or east window is ideal. Insufficient light causes slow growth and brown spots; direct midday sun scorches the leaves.',
        ru: 'Требует яркого рассеянного света несколько часов в день — идеально в нескольких метрах от южного или восточного окна. Недостаток света — медленный рост и бурые пятна; прямое полуденное солнце оставляет ожоги.',
      },
      humidity: {
        en: 'Prefers moderate to high humidity (40–60 %). Mist the leaves or use a humidifier; dry air causes brown, crispy leaf edges even with proper watering.',
        ru: 'Предпочитает умеренную и высокую влажность (40–60 %). Опрыскивайте листья или используйте увлажнитель; сухой воздух вызывает коричневые сухие края даже при правильном поливе.',
      },
      fertilizer: {
        en: 'Feed every 4 weeks in spring and summer with a balanced liquid fertilizer. During autumn and winter no feeding is needed.',
        ru: 'Подкармливайте каждые 4 недели с весны до конца лета сбалансированным жидким удобрением. Осенью и зимой подкормки не нужны.',
      },
      soil: {
        en: 'Rich, well-draining potting mix with 20% perlite. Good drainage prevents root rot, which is the most common cause of dark spots and leaf drop.',
        ru: 'Богатый, хорошо дренированный грунт с добавлением 20% перлита. Хороший дренаж предотвращает корневую гниль — наиболее частую причину тёмных пятен и листопада.',
      },
      repotting: {
        en: 'Every 1–2 years in spring, moving up one pot size. Repot carefully — root disturbance combined with a change of location is the most common trigger for a dramatic leaf drop.',
        ru: 'Раз в 1–2 года весной, увеличивая горшок на один размер. Пересаживайте осторожно — нарушение корней в сочетании со сменой места чаще всего вызывает массовый листопад.',
      },
      pruning: {
        en: 'Shape in spring by cutting just above a node. Pruning the top of a single-stemmed plant encourages branching. Wear gloves — the milky sap is a skin and eye irritant.',
        ru: 'Формируйте весной, срезая чуть выше узла. Обрезка верхушки у одноствольного экземпляра стимулирует ветвление. Надевайте перчатки — млечный сок раздражает кожу и глаза.',
      },
      phytodesign: {
        en: 'A design icon for living rooms, reception areas and creative studios. Best displayed alone as a focal-point specimen in a bright corner where it will not be disturbed.',
        ru: 'Культовое растение для гостиных, ресепшена и творческих студий. Лучше всего смотрится как одиночный акцентный экземпляр в ярком, спокойном углу, где его не будут тревожить.',
      },
    },
    propagation: [
      {
        id: 'stem-cuttings',
        name: { en: 'Stem cuttings', ru: 'Стеблевые черенки' },
        steps: {
          en: '1. Cut a 15–20 cm tip with 2–3 leaves in spring or summer.\n2. Allow the milky sap to dry for 1 hour, then remove the lower leaf.\n3. Root in moist perlite or water at 22–26 °C in a bright spot.\n4. Roots form slowly — expect 4–10 weeks. Pot up once roots are 3–5 cm long.',
          ru: '1. Весной или летом срежьте верхушечный черенок 15–20 см с 2–3 листьями.\n2. Дайте млечному соку подсохнуть час, затем удалите нижний лист.\n3. Укорените во влажном перлите или воде при 22–26 °C на ярком свету.\n4. Укоренение идёт медленно — ожидайте 4–10 недель. Пересадите, когда корни достигнут 3–5 см.',
        },
      },
      {
        id: 'air-layering',
        name: { en: 'Air layering', ru: 'Воздушные отводки' },
        steps: {
          en: '1. Make a shallow upward cut into a healthy stem below a node.\n2. Insert a toothpick to keep the cut open; pack with moist sphagnum and wrap in cling film.\n3. Keep the moss damp; roots appear in 4–8 weeks.\n4. Cut below the root ball and pot into well-draining mix.',
          ru: '1. Сделайте неглубокий надрез снизу вверх на здоровом стебле ниже узла.\n2. Вставьте зубочистку, чтобы надрез не закрылся; обложите влажным сфагнумом и оберните плёнкой.\n3. Поддерживайте мох влажным; корни появятся через 4–8 недель.\n4. Срежьте ниже корневого кома и посадите в дренированный грунт.',
        },
      },
    ],
    diseases: [
      {
        id: 'root-rot',
        name: { en: 'Root rot', ru: 'Корневая гниль' },
        description: {
          en: 'The most common problem. Overwatering in poorly draining soil causes dark, mushy roots; dark spots appear on leaves and they drop rapidly.',
          ru: 'Наиболее частая проблема. Перелив в плохо дренированном грунте вызывает тёмные размягчённые корни; на листьях появляются тёмные пятна и они массово опадают.',
        },
        treatment: {
          en: 'Remove, trim all dark roots, repot in fresh mix with extra perlite and adjust watering. Avoid moving the plant afterwards.',
          ru: 'Достаньте, срежьте все тёмные корни, пересадите в свежий грунт с добавлением перлита и скорректируйте полив. Не переставляйте растение после пересадки.',
        },
      },
      {
        id: 'bacterial-leaf-spot',
        name: { en: 'Bacterial leaf spot', ru: 'Бактериальная пятнистость листьев' },
        description: {
          en: 'Irregular dark-brown spots with yellow halos, often appearing near the leaf edges. Caused by Xanthomonas bacteria in moist, warm conditions.',
          ru: 'Неправильной формы тёмно-коричневые пятна с жёлтым ореолом, чаще у краёв листьев. Вызваны бактериями Xanthomonas во влажных тёплых условиях.',
        },
        treatment: {
          en: 'Remove infected leaves, avoid wetting foliage when watering and apply a copper-based bactericide if spreading.',
          ru: 'Удалите заражённые листья, не мочите листву при поливе и при распространении обработайте медьсодержащим бактерицидом.',
        },
      },
    ],
    pests: [
      {
        id: 'spider-mites',
        name: { en: 'Spider mites', ru: 'Паутинный клещ' },
        signs: {
          en: 'Fine webbing on leaf undersides, pale stippling on the upper surface; foliage looks dull and dusty.',
          ru: 'Тонкая паутина на изнанке листьев, светлые крапины на верхней стороне; листья выглядят тускло и запылённо.',
        },
        treatment: {
          en: 'Rinse thoroughly in the shower, raise humidity and apply insecticidal soap or neem oil weekly.',
          ru: 'Тщательно промойте под душем, повысьте влажность и еженедельно обрабатывайте инсектицидным мылом или маслом нима.',
        },
      },
      {
        id: 'mealybugs',
        name: { en: 'Mealybugs', ru: 'Мучнистый червец' },
        signs: {
          en: 'White cottony tufts in leaf axils; honeydew residue and leaf yellowing.',
          ru: 'Белые ватообразные комочки в пазухах листьев; липкий налёт и пожелтение листьев.',
        },
        treatment: {
          en: 'Remove with alcohol-soaked cotton, then apply neem oil or insecticidal soap; quarantine the plant.',
          ru: 'Удалите ватной палочкой в спирте, затем обработайте маслом нима или инсектицидным мылом; изолируйте растение.',
        },
      },
      {
        id: 'scale',
        name: { en: 'Scale insects', ru: 'Щитовка' },
        signs: {
          en: 'Brown waxy bumps along the midrib and stems; sticky honeydew, sooty mould and weakened leaves.',
          ru: 'Коричневые восковые бугорки вдоль центральной жилки и стеблей; липкая падь, сажистый гриб и ослабление листьев.',
        },
        treatment: {
          en: 'Scrape off shells with a soft brush, wipe with alcohol and apply neem oil or a systemic insecticide.',
          ru: 'Соскоблите щитки мягкой щёткой, протрите спиртом и обработайте маслом нима или системным инсектицидом.',
        },
      },
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Ficus_lyrata',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Starr_031108-0130_Ficus_lyrata.jpg/400px-Starr_031108-0130_Ficus_lyrata.jpg',
  },
  {
    id: 'calathea-orbifolia',
    commonName: 'Calathea',
    commonName_ru: 'Калатея',
    latinName: 'Calathea orbifolia',
    category: 'decorative',
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
    care: {
      appearance: {
        en: 'Large, rounded leaves with striking silver-green stripes on a mid-green background; undersides are pale silver-green. Part of the "prayer plant" group — leaves fold up at dusk and reopen at dawn. Typically 50–70 cm tall indoors.',
        ru: 'Крупные округлые листья с выразительными серебристо-зелёными полосами на среднезелёном фоне; обратная сторона бледно-серебристая. Принадлежит к группе «молитвенных растений» — листья складываются на ночь и раскрываются с рассветом. В комнатных условиях обычно 50–70 см.',
      },
      watering: {
        en: 'Keep the soil evenly moist but never waterlogged. Water when the top 1–2 cm feel dry — roughly every 5–7 days in warm weather. Always use room-temperature distilled, filtered or rain water; tap water causes chronic brown leaf tips.',
        ru: 'Поддерживайте грунт равномерно влажным, но не переувлажнённым. Поливайте, когда верхние 1–2 см подсохнут — примерно каждые 5–7 дней в тёплое время. Используйте только воду комнатной температуры — дистиллированную, отфильтрованную или дождевую; водопроводная вызывает хроническое побурение кончиков.',
      },
      temperature: {
        en: 'Needs stable warmth: 18–28 °C. Does not tolerate cold draughts, air-conditioning or temperatures below 15 °C. Even a brief cold shock causes leaf curl and browning.',
        ru: 'Требует стабильного тепла: 18–28 °C. Не переносит сквозняков, кондиционеров и температуры ниже 15 °C. Даже кратковременный холодовой шок вызывает скручивание и побурение листьев.',
      },
      light: {
        en: 'Medium to bright indirect light is ideal. Never direct sun — it bleaches the patterns and dries out the leaf edges quickly. Tolerates lower light but growth slows markedly.',
        ru: 'Оптимально — среднее или яркое рассеянное освещение. Прямое солнце никогда: оно обесцвечивает рисунок и быстро пересушивает края. Переносит более слабое освещение, но рост заметно замедляется.',
      },
      humidity: {
        en: 'Demands high humidity — 60%+ is ideal. Place on a pebble tray filled with water, group with other plants or run a humidifier. Dry air causes brown, crispy leaf edges within days.',
        ru: 'Требует высокой влажности — идеально от 60%. Ставьте на поддон с галькой и водой, группируйте с другими растениями или используйте увлажнитель. Сухой воздух в течение нескольких дней приводит к коричневым, хрустящим краям листьев.',
      },
      fertilizer: {
        en: 'Feed every 4 weeks in spring and summer with a diluted, balanced liquid fertilizer at quarter-to-half strength. Over-feeding causes leaf burn and salt build-up in the soil.',
        ru: 'Подкармливайте каждые 4 недели с весны до конца лета разведённым сбалансированным удобрением в четверть или половину нормы. Избыток питания вызывает ожоги листьев и засоление грунта.',
      },
      soil: {
        en: 'Peat-free, moisture-retentive but well-aerated mix — a blend of quality potting compost, perlite and orchid bark works well. Needs to hold some moisture without becoming compacted.',
        ru: 'Безторфяной, влагоудерживающий, но хорошо аэрированный субстрат — смесь качественного компоста, перлита и коры орхидей. Должен удерживать умеренную влагу, не слёживаясь.',
      },
      repotting: {
        en: 'Every 1–2 years in spring; choose a pot only slightly larger with drainage holes. Avoid disturbing the roots — even minor damage can cause weeks of stressed-looking leaves.',
        ru: 'Раз в 1–2 года весной, в горшок незначительно большего размера с дренажными отверстиями. Не тревожьте корни без нужды — даже небольшое повреждение может вызвать недели стресса.',
      },
      pruning: {
        en: 'Remove individual damaged or brown leaves at the base. Trim brown leaf edges with scissors shaped to the leaf curve for a natural look — this is cosmetic and does not harm the plant.',
        ru: 'Удаляйте повреждённые или побуревшие листья у основания. Обрезайте коричневые края ножницами, повторяя изгиб листа, — это косметическая процедура, не вредящая растению.',
      },
      phytodesign: {
        en: 'A showpiece for shaded spots that need colour — bathrooms with natural light, humid kitchens and living rooms far from direct sun. The nightly leaf movement adds a living, dynamic quality.',
        ru: 'Украшение для затенённых пространств, которым нужна жизнь и цвет — ванные комнаты с естественным светом, влажные кухни, гостиные вдали от прямого солнца. Ночное движение листьев добавляет динамику.',
      },
    },
    propagation: [
      {
        id: 'division',
        name: { en: 'Division at repotting', ru: 'Деление при пересадке' },
        steps: {
          en: '1. Remove the plant from its pot in spring and gently shake off the soil.\n2. Separate the root clump into sections, each with several leaves and healthy roots — use hands rather than a knife to minimise trauma.\n3. Pot each section in fresh moist potting mix.\n4. Keep in a warm, humid location and mist daily for the first 2 weeks.',
          ru: '1. Достаньте растение весной и осторожно стряхните грунт.\n2. Разделите ком руками, а не ножом — чтобы минимизировать стресс; каждая часть должна иметь листья и здоровые корни.\n3. Посадите каждую часть в свежий влажный субстрат.\n4. Держите в тёплом влажном месте и ежедневно опрыскивайте первые 2 недели.',
        },
      },
    ],
    diseases: [
      {
        id: 'root-rot',
        name: { en: 'Root rot', ru: 'Корневая гниль' },
        description: {
          en: 'Caused by waterlogged soil. Leaves wilt despite moist soil, turn yellow and the roots are dark and mushy.',
          ru: 'Вызвана переувлажнённым грунтом. Листья вянут несмотря на влажность, желтеют, корни тёмные и размягчённые.',
        },
        treatment: {
          en: 'Remove, trim all rotted roots, repot in a fresh aerated mix and reduce watering frequency considerably.',
          ru: 'Достаньте, обрежьте все гнилые корни, пересадите в свежий аэрированный субстрат и существенно сократите полив.',
        },
      },
      {
        id: 'pseudomonas-leaf-spot',
        name: { en: 'Pseudomonas leaf spot', ru: 'Бактериальная пятнистость (псевдомонас)' },
        description: {
          en: 'Water-soaked, then brown spots surrounded by yellow halos; common when foliage stays wet. Caused by Pseudomonas bacteria.',
          ru: 'Водянистые, затем коричневые пятна с жёлтым ореолом; возникают при постоянно влажной листве. Возбудитель — бактерии Pseudomonas.',
        },
        treatment: {
          en: 'Remove affected leaves, avoid wetting the foliage and improve air circulation. A copper-based spray helps contain the spread.',
          ru: 'Удалите поражённые листья, избегайте намокания листвы и улучшите вентиляцию. Медьсодержащий препарат помогает сдержать распространение.',
        },
      },
    ],
    pests: [
      {
        id: 'spider-mites',
        name: { en: 'Spider mites', ru: 'Паутинный клещ' },
        signs: {
          en: 'Fine webbing on leaf undersides; pale speckles and curling leaf edges — typically in low humidity.',
          ru: 'Тонкая паутина на изнанке листьев; светлые крапины и скручивание краёв — обычно при низкой влажности.',
        },
        treatment: {
          en: 'Raise humidity immediately, rinse the plant and apply insecticidal soap or neem oil weekly for 3–4 weeks.',
          ru: 'Немедленно повысьте влажность, промойте растение и еженедельно обрабатывайте инсектицидным мылом или маслом нима 3–4 недели.',
        },
      },
      {
        id: 'mealybugs',
        name: { en: 'Mealybugs', ru: 'Мучнистый червец' },
        signs: {
          en: 'White cottony clusters at leaf bases and in the crown; sticky honeydew residue.',
          ru: 'Белые ватообразные скопления у основания листьев и в центре розетки; липкий налёт.',
        },
        treatment: {
          en: 'Remove with alcohol-soaked cotton and treat with neem oil or insecticidal soap. Quarantine and inspect nearby plants.',
          ru: 'Удалите ватной палочкой в спирте и обработайте маслом нима или инсектицидным мылом. Изолируйте и осмотрите соседние растения.',
        },
      },
      {
        id: 'fungus-gnats',
        name: { en: 'Fungus gnats', ru: 'Грибные комарики' },
        signs: {
          en: 'Tiny flies near the soil surface; larvae in the top mix damage roots causing wilting.',
          ru: 'Мелкие мошки у поверхности грунта; личинки в верхнем слое повреждают корни, вызывая увядание.',
        },
        treatment: {
          en: 'Allow the top 2 cm of soil to dry between waterings, use sticky traps for adults and apply a Bti drench to kill larvae.',
          ru: 'Давайте верхним 2 см грунта подсыхать между поливами; используйте липкие ловушки для взрослых и пролейте Bti для уничтожения личинок.',
        },
      },
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Calathea_orbifolia',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Calathea_orbifolia_2.jpg/400px-Calathea_orbifolia_2.jpg',
  },
  {
    id: 'dracaena-marginata',
    commonName: 'Dracaena',
    commonName_ru: 'Драцена',
    latinName: 'Dracaena marginata',
    category: 'decorative',
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
    care: {
      appearance: {
        en: 'Slender, arching leaves with dark red-purple margins grow in dense rosettes atop bare, sculptural canes. With age it develops an attractive branched trunk reaching 1.5–3 m; often sold in multi-stem configurations for a palm-like silhouette.',
        ru: 'Тонкие дугообразные листья с тёмно-красно-фиолетовой каймой растут плотными розетками на оголённых декоративных стеблях. С возрастом формирует ветвистый ствол высотой 1,5–3 м; часто продаётся в многоствольных компоновках с силуэтом пальмы.',
      },
      watering: {
        en: 'Water when the top 3–5 cm of soil have dried out — every 10–14 days in summer, every 3–4 weeks in winter. Always empty the saucer. Dracaena is far more drought-tolerant than overwatering-tolerant.',
        ru: 'Поливайте, когда верхние 3–5 см грунта просохнут — раз в 10–14 дней летом и раз в 3–4 недели зимой. Обязательно сливайте воду из поддона. Драцена гораздо лучше переносит засуху, чем переувлажнение.',
      },
      temperature: {
        en: 'Comfortable at 18–30 °C. Tolerates brief dips to 13 °C but will drop leaves if exposed to cold draughts or sudden temperature changes.',
        ru: 'Предпочитает 18–30 °C. Переносит кратковременное снижение до 13 °C, но сбрасывает листья при сквозняках и резких перепадах температуры.',
      },
      light: {
        en: 'Adaptable — grows in low to bright indirect light. Deepest red-purple leaf margins develop in brighter conditions. Avoid direct midday sun through hot glass in summer.',
        ru: 'Неприхотлива к освещению — растёт от слабого до яркого рассеянного. Наиболее насыщенная красно-фиолетовая кайма формируется при хорошем освещении. Летом избегайте прямого полуденного солнца через стекло.',
      },
      humidity: {
        en: 'Tolerates average indoor humidity (30–50%) but appreciates occasional misting. Fluoride in tap water causes brown leaf tips and necrosis — use filtered or rain water.',
        ru: 'Переносит обычную комнатную влажность (30–50%), но благодарно реагирует на периодическое опрыскивание. Фтор в водопроводной воде вызывает побурение кончиков и некроз листьев — используйте фильтрованную или дождевую воду.',
      },
      fertilizer: {
        en: 'Feed every 4–6 weeks in spring and summer with a diluted balanced fertilizer. No feeding in autumn and winter. Excess fertiliser causes brown tip burn.',
        ru: 'Подкармливайте каждые 4–6 недель с весны до конца лета разведённым сбалансированным удобрением. Осенью и зимой не подкармливают. Избыток удобрения вызывает побурение кончиков листьев.',
      },
      soil: {
        en: 'Free-draining general potting mix with added perlite (20–30%). Good drainage is essential to prevent root rot in the fleshy cane base.',
        ru: 'Хорошо дренированный универсальный грунт с добавлением перлита (20–30%). Дренаж необходим для защиты мясистого основания стебля от гнили.',
      },
      repotting: {
        en: 'Every 2–3 years in spring. Mature plants can be maintained by replacing the top 5 cm of soil annually instead of full repotting.',
        ru: 'Раз в 2–3 года весной. Взрослые растения можно поддерживать ежегодной заменой верхних 5 см грунта вместо полной пересадки.',
      },
      pruning: {
        en: 'Cut stems back to the desired height at any time — new rosettes sprout from the cut points within weeks. Trim individual yellowing leaves at the base.',
        ru: 'Укорачивайте стебли в любое время до нужной высоты — из точек среза за несколько недель вырастут новые розетки. Удаляйте отдельные пожелтевшие листья у основания.',
      },
      phytodesign: {
        en: 'Structural statement plant for living rooms, offices and hotel lobbies. Single or multi-stem arrangements suit modern, tropical and minimalist interiors with equal elegance.',
        ru: 'Структурное акцентное растение для гостиных, офисов и гостиничных лобби. Одноствольные и многоствольные композиции одинаково органичны в современном, тропическом и минималистичном интерьере.',
      },
    },
    propagation: [
      {
        id: 'stem-tip-cuttings',
        name: { en: 'Stem tip cuttings', ru: 'Верхушечные черенки' },
        steps: {
          en: '1. Cut a 15–20 cm tip with a rosette of leaves.\n2. Remove the lower leaves to expose 5 cm of bare stem.\n3. Allow the cut to dry for an hour, then root in moist perlite or water at 22–25 °C.\n4. Roots form in 4–8 weeks; pot up in well-draining mix once established.',
          ru: '1. Срежьте верхушечный черенок 15–20 см с розеткой листьев.\n2. Удалите нижние листья, оголив 5 см стебля.\n3. Дайте срезу подсохнуть час, затем укорените во влажном перлите или воде при 22–25 °C.\n4. Корни образуются за 4–8 недель; после укоренения пересадите в дренированный грунт.',
        },
      },
      {
        id: 'cane-cuttings',
        name: { en: 'Cane cuttings', ru: 'Черенки из стеблевых секций' },
        steps: {
          en: '1. Cut the bare stem into 5–8 cm sections, each with at least one node.\n2. Lay the sections horizontally on moist perlite or potting mix, pressing lightly.\n3. Cover with a clear bag to hold humidity and place in a warm (22–25 °C) bright spot.\n4. Shoots and roots emerge from the nodes in 6–10 weeks.',
          ru: '1. Нарежьте оголённый стебель на секции по 5–8 см, каждая должна иметь хотя бы один узел.\n2. Уложите секции горизонтально на влажный перлит или грунт, слегка вдавив.\n3. Накройте прозрачным пакетом и поставьте в тёплое (22–25 °C) и светлое место.\n4. Побеги и корни появятся из узлов за 6–10 недель.',
        },
      },
    ],
    diseases: [
      {
        id: 'root-rot',
        name: { en: 'Root rot', ru: 'Корневая гниль' },
        description: {
          en: 'Caused by overwatering. Cane base becomes soft and brown; leaves yellow and drop in quantity.',
          ru: 'Вызвана переливом. Основание стебля размягчается и буреет; листья массово желтеют и опадают.',
        },
        treatment: {
          en: 'Remove, trim all soft rotted tissue, dry for 24 hours and repot into fresh well-draining mix. Hold watering for 2 weeks.',
          ru: 'Достаньте, срежьте всю мягкую гнилую ткань, подсушите 24 часа и пересадите в свежий дренированный грунт. Не поливайте 2 недели.',
        },
      },
      {
        id: 'fusarium-leaf-spot',
        name: { en: 'Fusarium leaf spot', ru: 'Пятнистость листьев (фузариум)' },
        description: {
          en: 'Tan to reddish-brown oval spots with yellow halos on the leaves, caused by Fusarium moniliforme in warm, wet conditions.',
          ru: 'Бежевато-красно-коричневые овальные пятна с жёлтым ореолом на листьях; вызваны Fusarium moniliforme в тёплых влажных условиях.',
        },
        treatment: {
          en: 'Remove affected leaves, improve ventilation, avoid wetting the foliage and apply a systemic fungicide if spreading.',
          ru: 'Удалите поражённые листья, улучшите вентиляцию, избегайте намокания листвы и при распространении обработайте системным фунгицидом.',
        },
      },
    ],
    pests: [
      {
        id: 'spider-mites',
        name: { en: 'Spider mites', ru: 'Паутинный клещ' },
        signs: {
          en: 'Fine webbing between leaf bases, pale stippling and dry-looking foliage — especially in low humidity.',
          ru: 'Тонкая паутина между основаниями листьев, светлые крапины и иссушённая листва — особенно при низкой влажности.',
        },
        treatment: {
          en: 'Mist the plant, raise ambient humidity and apply insecticidal soap or neem oil weekly until clear.',
          ru: 'Опрыскайте растение, повысьте влажность воздуха и еженедельно обрабатывайте инсектицидным мылом или маслом нима до исчезновения.',
        },
      },
      {
        id: 'mealybugs',
        name: { en: 'Mealybugs', ru: 'Мучнистый червец' },
        signs: {
          en: 'White cottony deposits at leaf bases, in the rosette heart and along the canes.',
          ru: 'Белые ватообразные скопления у основания листьев, в центре розетки и вдоль стеблей.',
        },
        treatment: {
          en: 'Dab with alcohol, apply neem oil or insecticidal soap and quarantine. Check carefully along the canes.',
          ru: 'Обработайте спиртом, нанесите масло нима или инсектицидное мыло и изолируйте. Тщательно осмотрите стебли.',
        },
      },
      {
        id: 'scale',
        name: { en: 'Scale insects', ru: 'Щитовка' },
        signs: {
          en: 'Brown bumps along canes and the undersides of leaves; sticky honeydew and sooty mould.',
          ru: 'Коричневые бугорки вдоль стеблей и на обратной стороне листьев; липкая падь и сажистый гриб.',
        },
        treatment: {
          en: 'Scrape off shells, wipe with diluted alcohol and apply neem oil or a systemic insecticide. Check weekly.',
          ru: 'Соскоблите щитки, протрите разведённым спиртом и обработайте маслом нима или системным инсектицидом. Проверяйте еженедельно.',
        },
      },
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Dracaena_marginata',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Dracaena_reflexa.JPG/400px-Dracaena_reflexa.JPG',
  },
  {
    id: 'kalanchoe-blossfeldiana',
    commonName: 'Kalanchoe',
    commonName_ru: 'Каланхоэ',
    latinName: 'Kalanchoe blossfeldiana',
    category: 'flowering',
    light: 4,
    water: 2,
    humidity: 2,
    difficulty: 1,
    tempMin: 15,
    tempMax: 28,
    perks: ['toxicCats', 'toxicDogs'],
    recommendedWateringIntervalDays: 10,
    fertilizeIntervalDays: 14,
    description_en:
      'A cheerful succulent-leaved flowering plant that produces dense clusters of small blooms in red, orange, yellow, pink or white. Incredibly easy to grow and forgiving of occasional neglect, it is one of the best-selling houseplants worldwide.',
    description_ru:
      'Жизнерадостное растение с суккулентными листьями и плотными соцветиями мелких цветков красного, оранжевого, жёлтого, розового или белого цвета. Одно из самых продаваемых комнатных растений в мире — неприхотливое и терпимое к эпизодическим забывчивостям хозяев.',
    care: {
      appearance: {
        en: 'A compact, bushy plant reaching 20–40 cm with glossy, scallop-edged dark-green leaves. Flower clusters (cymes) sit atop upright stems in a wide palette of warm colours; each individual flower lasts several weeks and the whole display can persist for 2–4 months.',
        ru: 'Компактное, густоветвящееся растение высотой 20–40 см с блестящими тёмно-зелёными листьями с городчатым краем. Соцветия на прямых стеблях окрашены в широкую палитру тёплых цветов; каждый цветок держится несколько недель, а всё цветение длится 2–4 месяца.',
      },
      watering: {
        en: 'Water thoroughly when the top 2–3 cm of soil is dry, then let the pot drain and empty the saucer. As a semi-succulent it stores water in its leaves, so erring on the dry side is far safer than overwatering — soggy roots rot quickly.',
        ru: 'Поливайте обильно, когда верхние 2–3 см почвы высохнут, давайте горшку стечь и сливайте воду из поддона. Как полусуккулент, каланхоэ запасает воду в листьях, поэтому лёгкое пересыхание гораздо безопаснее переувлажнения — мокрые корни быстро гниют.',
      },
      temperature: {
        en: 'Grows well at 15–28 °C. Brief dips to 10 °C are tolerated, but frost will kill it. Keep it away from cold draughts near windows in winter.',
        ru: 'Хорошо растёт при 15–28 °C. Кратковременное понижение до 10 °C переносит, но мороз губителен. Зимой держите подальше от холодных сквозняков у окон.',
      },
      light: {
        en: 'Needs bright light, including several hours of direct morning or evening sun. A south- or east-facing windowsill is ideal. Low light prolongs vegetative growth and delays or prevents flowering.',
        ru: 'Нуждается в ярком освещении с несколькими часами прямого утреннего или вечернего солнца. Лучшее место — южный или восточный подоконник. При слабом освещении растение вытягивается и не зацветает.',
      },
      humidity: {
        en: 'Tolerates low household humidity (30–50%) without complaint. There is no need to mist the leaves; good air circulation around the plant is more important.',
        ru: 'Спокойно переносит обычную комнатную влажность (30–50%). Опрыскивать листья не нужно; важнее обеспечить хорошую циркуляцию воздуха вокруг растения.',
      },
      fertilizer: {
        en: 'Feed every 2 weeks during active growth and flowering with a liquid fertilizer high in phosphorus and potassium (e.g. a tomato feed or bloom booster). Avoid high-nitrogen feeds that promote leafy growth at the expense of flowers. Do not fertilise in winter.',
        ru: 'Каждые 2 недели в период активного роста и цветения вносите жидкое удобрение с высоким содержанием фосфора и калия (например, для томатов или стимулятор цветения). Избегайте удобрений с высоким азотом — они усиливают рост листьев в ущерб цветению. Зимой не подкармливайте.',
      },
      soil: {
        en: 'Well-draining cactus or succulent mix is ideal. If using standard potting soil, add 20–30% perlite or coarse sand to improve drainage. A terracotta pot helps excess moisture evaporate.',
        ru: 'Идеально подходит хорошо дренированный субстрат для кактусов или суккулентов. Если используете универсальный грунт, добавьте 20–30% перлита или крупного песка для улучшения дренажа. Терракотовый горшок поможет излишней влаге испаряться.',
      },
      repotting: {
        en: 'Repot only when roots are visibly cramped — usually every 2 years in spring. Move up just one pot size, as a large pot holds excess moisture. Fresh soil provides enough nutrients for the season.',
        ru: 'Пересаживайте только когда корни явно стеснены — обычно раз в 2 года весной. Увеличивайте горшок лишь на один размер: большой горшок удерживает лишнюю влагу. Свежий грунт обеспечит растение питательными веществами на весь сезон.',
      },
      flowering: {
        en: 'Kalanchoe blooms in response to short days (less than 12 hours of light). To rebloom a plant that has finished flowering, cut off the spent flower stalks and give it 6–8 weeks of shortened days (14 hours of darkness per day) by covering it with a box or moving it to a dark room each evening.',
        ru: 'Каланхоэ цветёт в ответ на короткий световой день (менее 12 часов). Чтобы добиться повторного цветения, срежьте отцветшие стебли и в течение 6–8 недель обеспечивайте укороченный день (14 часов темноты): накрывайте растение коробкой или убирайте в тёмную комнату по вечерам.',
      },
    },
    propagation: [
      {
        id: 'stem-cuttings',
        name: { en: 'Stem cuttings', ru: 'Стеблевые черенки' },
        steps: {
          en: '1. Cut a healthy non-flowering stem 5–8 cm long just below a node.\n2. Let the cut end dry for 1–2 days to callous over.\n3. Insert into barely moist cactus mix and place in bright indirect light.\n4. Roots form in 2–4 weeks; water sparingly until well rooted.',
          ru: '1. Срежьте здоровый невегетирующий стебель длиной 5–8 см чуть ниже узла.\n2. Дайте срезу подсохнуть 1–2 дня, чтобы образовалась каллюс.\n3. Воткните в слегка влажный субстрат для кактусов и поставьте в яркое рассеянное место.\n4. Корни появятся через 2–4 недели; поливайте умеренно до укоренения.',
        },
      },
      {
        id: 'leaf-cuttings',
        name: { en: 'Leaf cuttings', ru: 'Листовые черенки' },
        steps: {
          en: '1. Remove a healthy leaf with its petiole and let it dry for a day.\n2. Lay it on the surface of moist cactus mix or insert the petiole shallowly.\n3. Keep in bright indirect light; small plantlets emerge at the leaf base in 4–6 weeks.\n4. Once plantlets have a few leaves, separate and pot individually.',
          ru: '1. Оторвите здоровый лист с черешком и дайте ему подсохнуть сутки.\n2. Положите на поверхность влажного субстрата для кактусов или слегка вставьте черешок.\n3. Поставьте в яркое рассеянное место; маленькие ростки появятся у основания листа через 4–6 недель.\n4. Когда у ростков появятся несколько листьев, рассадите по отдельным горшочкам.',
        },
      },
    ],
    diseases: [
      {
        id: 'root-rot',
        name: { en: 'Root rot', ru: 'Корневая гниль' },
        description: {
          en: 'The most common problem, caused by overwatering. Leaves turn yellow and soft; the base of the stem may turn brown and mushy.',
          ru: 'Самая частая проблема, вызванная переувлажнением. Листья желтеют и размягчаются; основание стебля может стать коричневым и склизким.',
        },
        treatment: {
          en: 'Remove from the pot, cut away rotten roots, let dry for a day, then repot into fresh dry cactus mix. Water much less frequently going forward.',
          ru: 'Выньте из горшка, обрежьте сгнившие корни, дайте подсохнуть сутки, затем пересадите в свежий сухой субстрат для кактусов. В дальнейшем поливайте значительно реже.',
        },
      },
      {
        id: 'powdery-mildew',
        name: { en: 'Powdery mildew', ru: 'Мучнистая роса' },
        description: {
          en: 'A white powdery coating on the leaves and stems, most common in humid, poorly ventilated conditions.',
          ru: 'Белый мучнистый налёт на листьях и стеблях, чаще всего при высокой влажности и плохой вентиляции.',
        },
        treatment: {
          en: 'Remove affected parts, improve air circulation, reduce misting and treat with a fungicide or diluted bicarbonate of soda solution.',
          ru: 'Удалите поражённые части, улучшите проветривание, прекратите опрыскивание и обработайте фунгицидом или раствором соды.',
        },
      },
    ],
    pests: [
      {
        id: 'mealybugs',
        name: { en: 'Mealybugs', ru: 'Мучнистый червец' },
        signs: {
          en: 'White cottony fluff in the leaf joints, on stems and under leaves; sticky honeydew residue.',
          ru: 'Белые ватные комочки в пазухах листьев, на стеблях и под листьями; липкий налёт.',
        },
        treatment: {
          en: 'Remove with an alcohol-soaked cotton swab, then spray with insecticidal soap or neem oil. Repeat every 5–7 days until gone.',
          ru: 'Удалите ватной палочкой, смоченной спиртом, затем опрыскайте инсектицидным мылом или маслом нима. Повторяйте каждые 5–7 дней до исчезновения.',
        },
      },
      {
        id: 'aphids',
        name: { en: 'Aphids', ru: 'Тля' },
        signs: {
          en: 'Clusters of tiny soft-bodied insects (green, black or brown) on new growth and flower buds; distorted or sticky leaves.',
          ru: 'Скопления мелких мягкотелых насекомых (зелёных, чёрных или коричневых) на молодых побегах и бутонах; деформированные или липкие листья.',
        },
        treatment: {
          en: 'Blast off with water, then treat with insecticidal soap or neem oil. Repeat until clear.',
          ru: 'Смойте водой, затем обработайте инсектицидным мылом или маслом нима. Повторяйте до исчезновения.',
        },
      },
      {
        id: 'spider-mites',
        name: { en: 'Spider mites', ru: 'Паутинный клещ' },
        signs: {
          en: 'Pale stippling on the leaves, fine webbing on undersides; worst in hot, dry conditions.',
          ru: 'Мелкие светлые точки на листьях, тонкая паутина снизу; активнее в жару и сухость.',
        },
        treatment: {
          en: 'Rinse thoroughly, raise humidity and apply neem oil or miticide weekly for 3–4 weeks.',
          ru: 'Тщательно промойте, повысьте влажность и обрабатывайте маслом нима или акарицидом еженедельно в течение 3–4 недель.',
        },
      },
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Kalanchoe_blossfeldiana',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Kalanchoe_blossfeldiana_1.jpg/320px-Kalanchoe_blossfeldiana_1.jpg',
  },
  {
    id: 'haworthia-fasciata',
    commonName: 'Zebra Haworthia',
    commonName_ru: 'Хавортия',
    latinName: 'Haworthia fasciata',
    category: 'succulent',
    light: 3,
    water: 1,
    humidity: 1,
    difficulty: 1,
    tempMin: 10,
    tempMax: 30,
    perks: [],
    recommendedWateringIntervalDays: 14,
    fertilizeIntervalDays: 60,
    description_en:
      'A compact rosette-forming succulent native to South Africa, prized for its stiff dark-green leaves adorned with distinctive white tubercle stripes on the outer surface. One of the most beginner-friendly succulents available.',
    description_ru:
      'Компактный суккулент с розеткой из жёстких тёмно-зелёных листьев, украшенных характерными белыми полосками из бугорков на внешней поверхности, родом из Южной Африки. Одно из самых простых в уходе суккулентных растений.',
    care: {
      appearance: {
        en: 'Forms a tight rosette of stiff, triangular dark-green leaves up to 12 cm long. The outer surface carries neat horizontal bands of white raised tubercles that give the plant its "zebra" common name. Mature plants offset freely, forming attractive clusters.',
        ru: 'Образует плотную розетку из жёстких треугольных тёмно-зелёных листьев длиной до 12 см. Внешняя поверхность покрыта аккуратными горизонтальными рядами белых выпуклых бугорков — отсюда название «зебровая». Взрослые растения активно образуют детки, создавая привлекательные группы.',
      },
      watering: {
        en: 'Water thoroughly and then allow the soil to dry out completely before watering again — typically every 14 days in summer and every 3–4 weeks in winter. Haworthia is extremely drought-tolerant; overwatering is the main cause of death.',
        ru: 'Полейте обильно, затем дайте почве полностью высохнуть — обычно раз в 14 дней летом и раз в 3–4 недели зимой. Хавортия крайне засухоустойчива; переувлажнение — главная причина гибели.',
      },
      temperature: {
        en: 'Adapts well to 10–30 °C. It copes with cool winters down to about 5 °C but growth slows markedly below 10 °C. Avoid frost and extreme summer heat above 35 °C, especially combined with direct sun.',
        ru: 'Хорошо адаптируется к 10–30 °C. Переносит прохладную зиму до примерно 5 °C, но рост заметно замедляется ниже 10 °C. Избегайте заморозков и летнего зноя выше 35 °C, особенно в сочетании с прямым солнцем.',
      },
      light: {
        en: 'Thrives in bright indirect light and tolerates lower light better than most succulents — it evolved growing in the shade of shrubs. Direct afternoon sun can bleach or scorch the leaves, though morning sun is fine. A north- or east-facing windowsill works well.',
        ru: 'Прекрасно чувствует себя при ярком рассеянном свете и переносит затенение лучше большинства суккулентов — в природе она растёт в тени кустарников. Прямое послеполуденное солнце может обесцветить или обжечь листья, а утреннее — вполне уместно. Хорошо подходит северный или восточный подоконник.',
      },
      humidity: {
        en: 'Completely unfussy about humidity and thrives in the dry air typical of heated homes (30–50%). No misting needed — wet foliage in low-ventilation spaces encourages fungal rot.',
        ru: 'Совершенно нетребовательна к влажности и прекрасно растёт в сухом воздухе отапливаемых помещений (30–50%). Опрыскивание не нужно — мокрая листва при плохой вентиляции провоцирует грибковое гниение.',
      },
      fertilizer: {
        en: 'Feed once in late spring and once in midsummer with a half-strength balanced liquid fertilizer or a specialist cactus feed. No fertilising in autumn or winter. Overfeeding causes soft, weak growth and can burn roots.',
        ru: 'Подкармливайте один раз в конце весны и один раз в середине лета жидким удобрением для кактусов в половинной дозе. Осенью и зимой не удобряйте. Избыток питания даёт мягкий слабый рост и может обжечь корни.',
      },
      soil: {
        en: 'Essential that the mix drains very rapidly. Use a commercial cactus and succulent compost or blend standard potting mix 50:50 with coarse grit or perlite. Good drainage is more important than soil richness.',
        ru: 'Критически важно, чтобы субстрат очень быстро высыхал. Используйте готовый грунт для кактусов и суккулентов или смешайте универсальный грунт 50:50 с крупным песком или перлитом. Дренаж важнее питательности почвы.',
      },
      repotting: {
        en: 'Repot every 2–3 years in spring or when offsets crowd the pot. Choose a wide, shallow container with drainage holes. Terra-cotta pots are ideal as they allow moisture to evaporate through the walls.',
        ru: 'Пересаживайте раз в 2–3 года весной или когда детки заполняют горшок. Выбирайте широкий неглубокий горшок с дренажными отверстиями. Терракота идеальна — она позволяет влаге испаряться через стенки.',
      },
    },
    propagation: [
      {
        id: 'offsets',
        name: { en: 'Offsets (pups)', ru: 'Детки (боковые розетки)' },
        steps: {
          en: '1. Wait until the offset has its own roots and is at least 3 cm across.\n2. Gently remove from the pot and pull or cut the offset away from the mother plant.\n3. Let the wound callous for 1–2 days in a shaded, dry spot.\n4. Pot the offset into barely moist cactus mix and withhold water for a week to encourage rooting.',
          ru: '1. Дождитесь, пока детка обзаведётся собственными корнями и достигнет диаметра хотя бы 3 см.\n2. Осторожно выньте из горшка и отделите детку от материнского растения руками или ножом.\n3. Дайте срезу подсохнуть 1–2 дня в затенённом сухом месте.\n4. Посадите детку в слегка влажный субстрат для кактусов и не поливайте неделю, чтобы стимулировать укоренение.',
        },
      },
    ],
    diseases: [
      {
        id: 'root-rot',
        name: { en: 'Root rot', ru: 'Корневая гниль' },
        description: {
          en: 'The number-one killer of haworthias, invariably caused by overwatering or a pot without drainage. The rosette loses its turgidity, lower leaves turn translucent and mushy.',
          ru: 'Главная причина гибели хавортий — неизменно переувлажнение или горшок без дренажа. Розетка теряет упругость, нижние листья становятся прозрачными и склизкими.',
        },
        treatment: {
          en: 'Remove from the pot, cut all rotten roots, dust with cinnamon or activated charcoal and leave to dry 1–2 days before repotting into fresh, very dry cactus mix.',
          ru: 'Выньте из горшка, обрежьте все сгнившие корни, присыпьте корицей или активированным углём и оставьте подсыхать на 1–2 дня перед посадкой в свежий, очень сухой субстрат для кактусов.',
        },
      },
      {
        id: 'fungal-leaf-spot',
        name: { en: 'Fungal leaf spot', ru: 'Грибковая пятнистость листьев' },
        description: {
          en: 'Orange-brown or reddish spots on the leaves, often caused by water sitting on the foliage or overcrowded, poorly ventilated conditions.',
          ru: 'Оранжево-коричневые или красноватые пятна на листьях, часто из-за попадания воды на листву или скученности и плохой вентиляции.',
        },
        treatment: {
          en: 'Remove affected leaves, improve air circulation, water at the base rather than overhead and apply a systemic fungicide if spreading.',
          ru: 'Удалите поражённые листья, улучшите вентиляцию, поливайте под корень, а не сверху, и при распространении обработайте системным фунгицидом.',
        },
      },
    ],
    pests: [
      {
        id: 'mealybugs',
        name: { en: 'Mealybugs', ru: 'Мучнистый червец' },
        signs: {
          en: 'White woolly deposits deep in the rosette, at leaf bases and around roots.',
          ru: 'Белые ватные скопления в глубине розетки, у основания листьев и вокруг корней.',
        },
        treatment: {
          en: 'Use a fine brush or cotton swab soaked in 70% isopropyl alcohol to reach into the rosette. Repeat weekly and treat with neem oil if the infestation is heavy.',
          ru: 'Используйте тонкую кисточку или ватный тампон, смоченный 70% изопропиловым спиртом, чтобы добраться вглубь розетки. Повторяйте еженедельно и при сильном поражении обработайте маслом нима.',
        },
      },
      {
        id: 'root-mealybugs',
        name: { en: 'Root mealybugs', ru: 'Корневой мучнистый червец' },
        signs: {
          en: 'The plant looks dehydrated despite correct watering; white waxy residue is visible on roots and potting mix when removed from the pot.',
          ru: 'Растение выглядит обезвоженным несмотря на правильный полив; при извлечении из горшка на корнях и субстрате виден белый восковой налёт.',
        },
        treatment: {
          en: 'Remove all old soil from the roots, rinse with water and soak in a dilute systemic insecticide solution. Repot into completely fresh, dry mix.',
          ru: 'Полностью уберите старый субстрат с корней, промойте водой и замочите в разведённом системном инсектициде. Пересадите в полностью свежий, сухой субстрат.',
        },
      },
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Haworthiopsis_fasciata',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Haworthia_fasciata2.jpg/320px-Haworthia_fasciata2.jpg',
  },
  {
    id: 'saintpaulia-ionantha',
    commonName: 'African Violet',
    commonName_ru: 'Сенполия (узамбарская фиалка)',
    latinName: 'Saintpaulia ionantha',
    category: 'flowering',
    light: 3,
    water: 3,
    humidity: 4,
    difficulty: 2,
    tempMin: 18,
    tempMax: 24,
    perks: [],
    recommendedWateringIntervalDays: 7,
    fertilizeIntervalDays: 14,
    description_en:
      'A beloved compact flowering houseplant from the cloud forests of Tanzania, cultivated in thousands of named varieties with blooms ranging from white and pink to deep purple. It thrives on a bright windowsill and can bloom almost year-round with good care.',
    description_ru:
      'Любимое компактное цветущее комнатное растение из облачных лесов Танзании, культивируемое в тысячах сортов с цветками от белых и розовых до насыщенно-фиолетовых. При хорошем уходе может цвести почти круглый год.',
    care: {
      appearance: {
        en: 'Forms a neat, flat rosette of velvety, rounded dark-green leaves up to 8 cm across. Flower clusters rise above the foliage on short stalks; individual flowers can be single, semi-double or fully double, plain or bicoloured, in white, pink, red, purple or blue.',
        ru: 'Образует аккуратную плоскую розетку из бархатистых округлых тёмно-зелёных листьев диаметром до 8 см. Соцветия возвышаются над листвой на коротких цветоносах; отдельные цветки могут быть простыми, полумахровыми или махровыми, одноцветными или двухцветными — белыми, розовыми, красными, фиолетовыми или синими.',
      },
      watering: {
        en: 'The most critical rule: never wet the leaves or crown, as water spots and rot can result. Water from below by placing the pot in a shallow dish of water for 20–30 minutes, then remove and let it drain. Water when the top centimetre of soil feels slightly dry.',
        ru: 'Главное правило: никогда не мочите листья и точку роста — это вызывает пятна и гниль. Поливайте снизу, ставя горшок в блюдце с водой на 20–30 минут, затем убирайте и давайте стечь. Поливайте, когда верхний сантиметр субстрата слегка подсохнет.',
      },
      temperature: {
        en: 'Prefers a steady 18–24 °C. It dislikes temperature fluctuations and cold draughts; keep it away from air-conditioning vents and windows in winter. Below 15 °C growth stalls and flowers drop.',
        ru: 'Предпочитает стабильную температуру 18–24 °C. Не любит перепадов и холодных сквозняков; держите подальше от кондиционеров и зимних окон. Ниже 15 °C рост прекращается и цветки опадают.',
      },
      light: {
        en: 'Bright, diffuse light for 12–14 hours per day is ideal. A north- or east-facing windowsill, or a west-facing one screened by a sheer curtain, suits it well. Insufficient light causes leggy growth and sparse flowering; too much direct sun bleaches and scorches the leaves.',
        ru: 'Идеален яркий рассеянный свет по 12–14 часов в сутки. Подходит северный или восточный подоконник, а также западный, прикрытый тюлем. При недостатке света растение вытягивается и слабо цветёт; слишком яркое прямое солнце обесцвечивает и обжигает листья.',
      },
      humidity: {
        en: 'Prefers moderate to high humidity (50–70%). However, avoid misting the leaves — instead use a pebble tray with water under the pot, a nearby humidifier or grouping with other plants. Good air movement without cold draughts is beneficial.',
        ru: 'Предпочитает умеренную или высокую влажность (50–70%). Однако опрыскивать листья нельзя — вместо этого ставьте горшок на поддон с влажной галькой, используйте увлажнитель или группируйте с другими растениями. Полезна хорошая циркуляция воздуха без холодных потоков.',
      },
      fertilizer: {
        en: 'Feed every 2 weeks during active growth and flowering with a balanced or phosphorus-rich fertilizer formulated for African violets (e.g. 14-12-14). Reduce to monthly in winter. Always water first so the roots are moist before applying liquid feed.',
        ru: 'Каждые 2 недели в период роста и цветения подкармливайте сбалансированным или богатым фосфором удобрением для сенполий (например, 14-12-14). Зимой сократите до раза в месяц. Перед внесением жидкого удобрения обязательно полейте, чтобы корни были влажными.',
      },
      soil: {
        en: 'Use a light, porous, slightly acidic mix. Commercial African violet compost is ideal; alternatively blend equal parts peat (or coco coir), perlite and vermiculite. Compact or water-retentive mixes cause crown rot.',
        ru: 'Используйте лёгкий, пористый, слабокислый субстрат. Готовый грунт для сенполий — идеален; можно также смешать равные части торфа (или кокосового волокна), перлита и вермикулита. Плотный или влагоудерживающий субстрат вызывает гниль корневой шейки.',
      },
      repotting: {
        en: 'Repot annually in spring into a pot that is roughly one-third the diameter of the leaf rosette — African violets bloom best when slightly root-bound. Remove any brown or dead leaves and the oldest lower leaves to keep the rosette tidy.',
        ru: 'Пересаживайте ежегодно весной в горшок диаметром примерно в треть диаметра розетки — сенполии лучше цветут в слегка стеснённых условиях. Удаляйте коричневые, отмершие и самые нижние старые листья, чтобы розетка выглядела аккуратно.',
      },
    },
    propagation: [
      {
        id: 'leaf-cuttings',
        name: { en: 'Leaf petiole cuttings', ru: 'Черенки листьев с черешком' },
        steps: {
          en: '1. Select a firm, healthy leaf from the middle row and cut it off with 3–4 cm of petiole.\n2. Insert the petiole at a 45° angle into moist perlite or a 50:50 perlite-vermiculite mix.\n3. Cover with a clear plastic bag to maintain humidity and place in bright indirect light at 20–22 °C.\n4. Small plantlets appear at the petiole base in 6–10 weeks. Once they have 2–3 leaves, carefully separate and pot individually.',
          ru: '1. Выберите крепкий здоровый лист из среднего ряда и срежьте его с 3–4 см черешка.\n2. Вставьте черешок под углом 45° во влажный перлит или смесь перлита и вермикулита 50:50.\n3. Накройте прозрачным пакетом для сохранения влажности и поставьте в яркое рассеянное место при 20–22 °C.\n4. Маленькие ростки появятся у основания черешка через 6–10 недель. Когда у них появятся 2–3 листа, аккуратно разделите и рассадите по горшочкам.',
        },
      },
    ],
    diseases: [
      {
        id: 'crown-rot',
        name: { en: 'Crown rot', ru: 'Гниль корневой шейки (розетки)' },
        description: {
          en: 'The centre of the rosette turns brown and mushy, caused by water sitting on the crown or planting too deep. Can spread to the roots rapidly.',
          ru: 'Центр розетки буреет и размягчается — из-за попадания воды на точку роста или слишком глубокой посадки. Может быстро распространиться на корни.',
        },
        treatment: {
          en: 'Remove all rotted tissue with a clean knife, dust the wound with fungicide or cinnamon and allow to dry. If the damage is extensive, take a healthy leaf cutting to propagate a new plant.',
          ru: 'Удалите все подгнившие ткани чистым ножом, присыпьте рану фунгицидом или корицей и дайте подсохнуть. При сильном поражении укорените здоровый лист для получения нового растения.',
        },
      },
      {
        id: 'powdery-mildew',
        name: { en: 'Powdery mildew', ru: 'Мучнистая роса' },
        description: {
          en: 'A white powdery coating on leaves, buds and stems, common in cool and damp conditions with poor air movement.',
          ru: 'Белый мучнистый налёт на листьях, бутонах и стеблях; часто в прохладных сырых условиях с застоявшимся воздухом.',
        },
        treatment: {
          en: 'Improve ventilation, remove badly affected leaves and treat with a fungicide safe for African violets, such as a potassium bicarbonate spray.',
          ru: 'Улучшите вентиляцию, удалите сильно поражённые листья и обработайте безопасным для сенполий фунгицидом, например спреем на основе бикарбоната калия.',
        },
      },
    ],
    pests: [
      {
        id: 'mealybugs',
        name: { en: 'Mealybugs', ru: 'Мучнистый червец' },
        signs: {
          en: 'White cottony deposits at leaf bases and in the centre of the rosette; plant weakens and flowers drop.',
          ru: 'Белые ватные скопления у основания листьев и в центре розетки; растение слабеет, цветки опадают.',
        },
        treatment: {
          en: 'Carefully dab with alcohol using a fine brush or cotton swab. Treat with neem oil or insecticidal soap, avoiding the flowers.',
          ru: 'Аккуратно обработайте спиртом с помощью тонкой кисточки или ватного тампона. Нанесите масло нима или инсектицидное мыло, избегая цветков.',
        },
      },
      {
        id: 'cyclamen-mite',
        name: { en: 'Cyclamen mite', ru: 'Цикламенный клещ' },
        signs: {
          en: 'New leaves are distorted, cupped or stunted and may appear silvery; flower buds fail to open properly. Mites are too small to see with the naked eye.',
          ru: 'Молодые листья деформированы, скручены или недоразвиты, могут выглядеть серебристо; бутоны не раскрываются полностью. Клещей не видно невооружённым глазом.',
        },
        treatment: {
          en: 'Isolate immediately. Remove and discard affected leaves. Treat with a miticide approved for use on houseplants, repeating every 7 days for 3–4 cycles.',
          ru: 'Немедленно изолируйте. Удалите и выбросьте поражённые листья. Обработайте акарицидом, разрешённым для комнатных растений, повторяя каждые 7 дней в течение 3–4 циклов.',
        },
      },
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Saintpaulia',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/African_Violet.jpg/320px-African_Violet.jpg',
  },
  {
    id: 'phalaenopsis',
    commonName: 'Moth Orchid',
    commonName_ru: 'Орхидея фаленопсис',
    latinName: 'Phalaenopsis spp.',
    category: 'orchid',
    light: 3,
    water: 2,
    humidity: 4,
    difficulty: 3,
    tempMin: 16,
    tempMax: 28,
    perks: [],
    recommendedWateringIntervalDays: 10,
    fertilizeIntervalDays: 14,
    description_en:
      'The world\'s best-selling orchid, native to tropical Asia and northern Australia. Its arching sprays of large, long-lasting blooms make it an icon of modern interiors, while its epiphytic nature means it prefers to grow in bark rather than soil.',
    description_ru:
      'Самая продаваемая орхидея в мире, родом из тропической Азии и северной Австралии. Дугообразные ветви с крупными долговечными цветками сделали её иконой современного интерьера; как эпифит, она предпочитает расти в коре, а не в земле.',
    care: {
      appearance: {
        en: 'An epiphytic orchid with 2–4 broad, fleshy, strap-like leaves up to 30 cm long arising from a short central stem. Thick silvery-green aerial roots emerge from the base and stem. The arching flowering spike can carry 10–20 or more blooms in white, pink, purple, yellow or patterned forms, each flower lasting 2–3 months.',
        ru: 'Эпифитная орхидея с 2–4 широкими мясистыми ремневидными листьями длиной до 30 см, отходящими от короткого центрального стебля. Из основания и стебля выходят толстые серебристо-зелёные воздушные корни. Дугообразный цветонос несёт 10–20 и более цветков белого, розового, фиолетового, жёлтого или узорчатого окраса; каждый цветок держится 2–3 месяца.',
      },
      watering: {
        en: 'Water about once every 7–10 days: place the whole pot in a basin of water for 10–15 minutes, let it drain thoroughly, then return it to its spot. The bark must dry out between waterings — permanently moist bark causes root rot. Yellow, wrinkled roots or leaves indicate drought; mushy grey-brown roots indicate overwatering.',
        ru: 'Поливайте примерно раз в 7–10 дней: погружайте весь горшок в таз с водой на 10–15 минут, давайте полностью стечь и ставьте на место. Кора должна просыхать между поливами — постоянно влажная кора вызывает гниль корней. Жёлтые, сморщенные корни или листья — признак засухи; мягкие серо-коричневые корни — переувлажнения.',
      },
      temperature: {
        en: 'Prefers 18–28 °C during the day. A brief nightly temperature drop of 5–8 °C in autumn (14–16 °C at night) helps trigger new flower spikes. Avoid placing near air-conditioning or cold draughts, and keep away from windows in frost.',
        ru: 'Предпочитает 18–28 °C в дневное время. Кратковременное ночное понижение на 5–8 °C осенью (до 14–16 °C ночью) помогает спровоцировать образование новых цветоносов. Не ставьте рядом с кондиционером или в холодные сквозняки, а в морозную погоду отодвигайте от окон.',
      },
      light: {
        en: 'Bright, filtered light — an east- or north-facing windowsill or set back from a south-facing window. The leaves should feel warm but never hot to the touch. Direct midday sun bleaches and burns them; deep shade produces lush leaves but no flowers.',
        ru: 'Яркий рассеянный свет — восточный или северный подоконник, либо отступите от южного. Листья должны быть тёплыми, но не горячими на ощупь. Прямое полуденное солнце обесцвечивает и обжигает их; в глубокой тени листья растут пышно, но цветков не бывает.',
      },
      humidity: {
        en: 'Requires 50–70% humidity. In dry indoor environments use a pebble tray with water under the pot, a nearby humidifier or group plants together. Misting is not recommended — water sitting in the leaf axils or crown causes rot.',
        ru: 'Требует влажности 50–70%. В сухих помещениях используйте поддон с мокрой галькой, увлажнитель или группируйте растения. Опрыскивание не рекомендуется — вода, скопившаяся в пазухах листьев или точке роста, вызывает гниль.',
      },
      fertilizer: {
        en: 'Feed every 2 weeks during growth and flowering with a balanced liquid fertilizer designed for orchids (or half-strength general feed), diluted to a quarter strength: "weakly, weekly" is the orchid grower\'s motto. Flush the pot with plain water every fourth watering to prevent salt build-up. Do not feed a plant in flower spike initiation.',
        ru: 'Каждые 2 недели в период роста и цветения вносите сбалансированное жидкое удобрение для орхидей (или универсальное в половинной дозе), разведённое до четверти концентрации: девиз орхидеиста — «редко, но понемногу». Каждый четвёртый полив промывайте горшок чистой водой, чтобы не накапливались соли. Не удобряйте при закладке цветоноса.',
      },
      soil: {
        en: 'Use a specialist orchid bark mix (medium or coarse bark chips with some perlite and charcoal) — never ordinary potting soil, which suffocates the roots. Transparent pots allow you to monitor root health and moisture levels at a glance.',
        ru: 'Используйте специальный субстрат для орхидей (средняя или крупная кора с перлитом и древесным углём) — обычный грунт категорически не подходит, он задушит корни. Прозрачные горшки позволяют отслеживать состояние корней и влажность субстрата.',
      },
      repotting: {
        en: 'Repot every 2 years in spring or after flowering, when the bark has decomposed or roots are escaping the pot in all directions. Trim dead or rotten roots, let them dry for an hour and move up just one pot size. Disturbing the roots during flowering causes bud drop.',
        ru: 'Пересаживайте раз в 2 года весной или после цветения, когда кора разложилась или корни вылезают из горшка со всех сторон. Обрежьте отмершие и гнилые корни, дайте им подсохнуть час и перенесите в горшок лишь на размер больше. Потревоженные во время цветения корни вызывают осыпание бутонов.',
      },
      flowering: {
        en: 'A healthy phalaenopsis can bloom for 3–6 months at a stretch. Once the last flower drops, cut the spike just above the second or third node from the base — a secondary spike often develops from this node. If the spike yellows completely, cut it to the base.',
        ru: 'Здоровый фаленопсис может цвести 3–6 месяцев подряд. Когда упадёт последний цветок, срежьте цветонос чуть выше второго или третьего узла от основания — из этого узла нередко развивается боковой побег. Если цветонос полностью пожелтел, срежьте его у основания.',
      },
    },
    propagation: [
      {
        id: 'keikis',
        name: { en: 'Keikis (stem plantlets)', ru: 'Кейки (дочерние розетки на цветоносе)' },
        steps: {
          en: '1. Wait until the keiki (a plantlet that spontaneously forms on the flower spike) has developed at least 2–3 leaves and roots of 3–5 cm.\n2. Cut it from the spike with a clean blade, leaving a short stub.\n3. Allow the cut to dry for an hour, then pot into moist orchid bark in a small pot.\n4. Keep warm and humid; new roots should anchor in the fresh bark within a few weeks.',
          ru: '1. Дождитесь, пока кейки (дочерняя розетка, самостоятельно образовавшаяся на цветоносе) разовьёт хотя бы 2–3 листа и корни длиной 3–5 см.\n2. Срежьте его с цветоноса чистым инструментом, оставив небольшой пенёк.\n3. Дайте срезу подсохнуть час, затем посадите во влажную кору для орхидей в маленький горшок.\n4. Держите в тепле и влажности; новые корни закрепятся в свежей коре через несколько недель.',
        },
      },
    ],
    diseases: [
      {
        id: 'crown-rot',
        name: { en: 'Crown rot', ru: 'Гниль точки роста' },
        description: {
          en: 'Water accumulating in the crown causes the growing centre to turn brown and collapse. It spreads rapidly and can kill the plant within days.',
          ru: 'Вода, скопившаяся в точке роста, вызывает гниение центра. Болезнь быстро распространяется и может погубить растение за несколько дней.',
        },
        treatment: {
          en: 'Remove all rotted tissue with a sterile blade, dust with cinnamon or fungicide and allow to air-dry in good light. If a growing point survives, the plant may recover and produce a side shoot.',
          ru: 'Удалите все подгнившие ткани стерильным инструментом, присыпьте корицей или фунгицидом и дайте подсохнуть на воздухе в хорошо освещённом месте. Если точка роста сохранится, растение может восстановиться и дать боковой побег.',
        },
      },
      {
        id: 'root-rot',
        name: { en: 'Root rot', ru: 'Гниль корней' },
        description: {
          en: 'Roots turn brown-grey and mushy from overwatering or decomposed bark that retains too much moisture. Leaves become limp and yellow.',
          ru: 'Корни буреют и становятся мягкими из-за переполива или разложившейся коры, удерживающей слишком много влаги. Листья вянут и желтеют.',
        },
        treatment: {
          en: 'Remove from the pot, cut away all dead roots, dust wounds with activated charcoal, let dry for 1–2 hours and repot into fresh bark. Reduce watering frequency.',
          ru: 'Выньте из горшка, обрежьте все мёртвые корни, присыпьте срезы активированным углём, дайте подсохнуть 1–2 часа и пересадите в свежую кору. Сократите частоту полива.',
        },
      },
    ],
    pests: [
      {
        id: 'spider-mites',
        name: { en: 'Spider mites', ru: 'Паутинный клещ' },
        signs: {
          en: 'Fine silvery stippling on the leaf surface, tiny webs on the undersides, worst in hot, dry air.',
          ru: 'Мелкие серебристые точки на поверхности листьев, тонкая паутина снизу; активнее в жаркую сухую погоду.',
        },
        treatment: {
          en: 'Wipe the leaves with a damp cloth, increase humidity and apply neem oil or a miticide, avoiding open flowers. Repeat weekly for 3 cycles.',
          ru: 'Протрите листья влажной тканью, повысьте влажность и обработайте маслом нима или акарицидом, избегая открытых цветков. Повторяйте еженедельно 3 раза.',
        },
      },
      {
        id: 'scale',
        name: { en: 'Scale insects', ru: 'Щитовка' },
        signs: {
          en: 'Small brown or tan bumps on leaves, roots and stems; sticky honeydew on surfaces below.',
          ru: 'Мелкие коричневые или бежевые бугорки на листьях, корнях и стеблях; липкая падь на поверхностях внизу.',
        },
        treatment: {
          en: 'Scrape off manually, wipe with 70% alcohol on a cotton pad and apply neem oil. Check weekly; heavily infested plants are best discarded.',
          ru: 'Соскоблите вручную, протрите 70% спиртом на ватном диске и нанесите масло нима. Проверяйте еженедельно; при сильном поражении лучше утилизировать растение.',
        },
      },
      {
        id: 'mealybugs',
        name: { en: 'Mealybugs', ru: 'Мучнистый червец' },
        signs: {
          en: 'White woolly clusters in the axils, on roots and along the spike.',
          ru: 'Белые ватные скопления в пазухах листьев, на корнях и вдоль цветоноса.',
        },
        treatment: {
          en: 'Remove with alcohol-soaked swabs and treat with neem oil; quarantine the plant to prevent spread.',
          ru: 'Удалите ватными тампонами, смоченными спиртом, и обработайте маслом нима; изолируйте растение для предотвращения распространения.',
        },
      },
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Phalaenopsis',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Phalaenopsis_DTPS_Taida_Salu.jpg/320px-Phalaenopsis_DTPS_Taida_Salu.jpg',
  },
  {
    id: 'begonia-tuberhybrida',
    commonName: 'Tuberous Begonia',
    commonName_ru: 'Бегония клубневая',
    latinName: 'Begonia × tuberhybrida',
    category: 'flowering',
    light: 3,
    water: 3,
    humidity: 3,
    difficulty: 3,
    tempMin: 15,
    tempMax: 22,
    perks: ['toxicCats', 'toxicDogs'],
    recommendedWateringIntervalDays: 5,
    fertilizeIntervalDays: 14,
    description_en:
      'A spectacular summer-flowering plant grown from tubers, producing large rose-like double flowers up to 15 cm across in a dazzling range of colours. Tuberous begonias are demanding but reward careful growers with an unrivalled floral display that lasts from early summer to autumn.',
    description_ru:
      'Эффектное летнецветущее клубневое растение с крупными розовидными махровыми цветками диаметром до 15 см в ослепительной палитре оттенков. Клубневая бегония требовательна в уходе, но вознаграждает внимательных цветоводов несравненным цветением от начала лета до осени.',
    care: {
      appearance: {
        en: 'Upright or pendulous stems 30–60 cm tall carry large, asymmetric fresh-green leaves and showy double or semi-double flowers resembling camellias or roses. Colours include white, cream, yellow, apricot, orange, pink, red and bicolours with picotee edges.',
        ru: 'Прямостоячие или свисающие стебли высотой 30–60 см несут крупные асимметричные свежезелёные листья и эффектные махровые или полумахровые цветки, напоминающие камелии или розы. Окраска включает белый, кремовый, жёлтый, абрикосовый, оранжевый, розовый, красный цвета и двухцветные сорта с каймой.',
      },
      watering: {
        en: 'Keep the soil evenly moist during active growth — allow only the very surface to dry before watering again. Never let the pot sit in water; soggy conditions rot the tuber. Reduce watering as autumn approaches and the plant begins to die back.',
        ru: 'В период активного роста поддерживайте равномерную влажность субстрата — давайте подсыхать лишь самому верхнему слою. Никогда не оставляйте горшок стоять в воде; застой влаги гноит клубень. Сокращайте полив с приближением осени и отмиранием наземной части.',
      },
      temperature: {
        en: 'Grows best at 15–22 °C and dislikes heat above 26 °C — high temperatures cause bud drop and reduced flower size. Cool, fresh air (but not draughts) suits it. Frost kills the tuber if it is still in the ground.',
        ru: 'Лучше всего растёт при 15–22 °C и не любит жары выше 26 °C — высокая температура вызывает опадение бутонов и уменьшение цветков. Подходит прохладный свежий воздух (без сквозняков). Мороз губит клубень, если он ещё в земле.',
      },
      light: {
        en: 'Bright, indirect light is best — a few hours of gentle morning or evening sun are beneficial, but direct midday sun bleaches the flowers and scorches the leaves. Morning sun plus afternoon shade on a sheltered balcony or bright windowsill is ideal.',
        ru: 'Лучше всего яркий рассеянный свет — несколько часов мягкого утреннего или вечернего солнца полезны, но прямое полуденное солнце обесцвечивает цветки и обжигает листья. Идеально — утреннее солнце и послеполуденная тень на защищённом балконе или ярком подоконнике.',
      },
      humidity: {
        en: 'Prefers moderate humidity (50–60%). Avoid wetting the leaves and flowers — this encourages botrytis (grey mould). Ensure good air circulation around the plant rather than misting.',
        ru: 'Предпочитает умеренную влажность (50–60%). Не мочите листья и цветки — это провоцирует ботритис (серую гниль). Обеспечивайте хорошую циркуляцию воздуха, а не опрыскивайте.',
      },
      fertilizer: {
        en: 'Feed every 2 weeks from planting until late summer with a high-potassium, high-phosphorus fertilizer (tomato feed is perfect) to encourage large flowers. Do not use high-nitrogen fertilizers, which promote leaf growth at the expense of blooms.',
        ru: 'С момента посадки и до конца лета каждые 2 недели вносите удобрение с высоким содержанием калия и фосфора (удобрение для томатов — идеально) для крупных цветков. Не используйте удобрения с высоким азотом: они стимулируют рост листьев в ущерб цветению.',
      },
      soil: {
        en: 'A rich but well-draining potting mix. Blend standard potting compost with 20–30% perlite to improve drainage while retaining some moisture. A little slow-release fertilizer incorporated at planting gives a good start.',
        ru: 'Богатый, но хорошо дренированный субстрат. Смешайте универсальный грунт с 20–30% перлита для улучшения дренажа при сохранении умеренной влажности. Небольшое количество удобрения с медленным высвобождением, добавленное при посадке, даст хороший старт.',
      },
      repotting: {
        en: 'Start new tubers in spring, placing them concave-side up in moist compost, barely covered. As growth appears, pot on progressively. Each spring, repot stored tubers into fresh compost — do not reuse old soil.',
        ru: 'Клубни высаживают весной вогнутой стороной вверх во влажный субстрат, слегка присыпая. По мере прорастания переваливают в бо́льший горшок. Каждую весну хранившиеся клубни высаживают в свежий грунт — старую почву повторно не используют.',
      },
      dormancy: {
        en: 'In autumn, leaves and stems die back naturally. Stop watering gradually, allow the foliage to yellow and wither, then cut off the dead stems. Store the tuber in barely moist vermiculite or peat at 5–10 °C over winter. Resume watering in late winter or early spring when new buds appear on the tuber surface.',
        ru: 'Осенью листья и стебли отмирают естественным образом. Постепенно прекращайте полив, дайте листве пожелтеть и засохнуть, затем срежьте отмершие стебли. Храните клубень в слегка влажном вермикулите или торфе при 5–10 °C всю зиму. Возобновляйте полив в конце зимы или начале весны, когда на поверхности клубня появятся новые почки.',
      },
    },
    propagation: [
      {
        id: 'stem-cuttings',
        name: { en: 'Stem cuttings', ru: 'Стеблевые черенки' },
        steps: {
          en: '1. In spring, when new shoots are 5–8 cm long, cut one near the base with a clean blade.\n2. Remove the lower leaves and insert into moist cuttings compost.\n3. Cover with a clear plastic bag and keep warm (20–22 °C) in bright indirect light.\n4. Roots form in 2–3 weeks; pot on into a larger container once established.',
          ru: '1. Весной, когда новые побеги достигнут 5–8 см, срежьте один у основания чистым инструментом.\n2. Уберите нижние листья и вставьте в влажный субстрат для черенкования.\n3. Накройте прозрачным пакетом и держите в тепле (20–22 °C) в ярком рассеянном свете.\n4. Корни образуются через 2–3 недели; после укоренения перенесите в бо́льший горшок.',
        },
      },
      {
        id: 'tuber-division',
        name: { en: 'Tuber division', ru: 'Деление клубня' },
        steps: {
          en: '1. In late winter, when the tuber shows several buds, cut it into sections with a clean sharp knife, ensuring each piece has at least one bud.\n2. Dust the cut surfaces with sulphur powder or activated charcoal and allow to callous for 24 hours in a warm, dry place.\n3. Plant each section shallowly in moist compost and keep at 18–20 °C until new shoots emerge.',
          ru: '1. В конце зимы, когда на клубне наметятся несколько почек, разрежьте его чистым острым ножом на части, следя, чтобы на каждой была хотя бы одна почка.\n2. Присыпьте срезы серным порошком или активированным углём и дайте образоваться каллюсу 24 часа в тёплом сухом месте.\n3. Высадите каждую часть неглубоко во влажный субстрат и держите при 18–20 °C до появления побегов.',
        },
      },
    ],
    diseases: [
      {
        id: 'botrytis',
        name: { en: 'Botrytis (grey mould)', ru: 'Ботритис (серая гниль)' },
        description: {
          en: 'A fluffy grey mould on leaves, stems and flowers — the most common problem in cool, damp, poorly ventilated conditions. Can destroy an entire plant rapidly.',
          ru: 'Пушистая серая плесень на листьях, стеблях и цветках — самая распространённая проблема в прохладных, сырых, плохо вентилируемых условиях. Может быстро погубить всё растение.',
        },
        treatment: {
          en: 'Remove all affected tissue immediately, improve air circulation, reduce humidity and avoid wetting the foliage. Treat with a fungicide if widespread.',
          ru: 'Немедленно удалите все поражённые части, улучшите циркуляцию воздуха, снизьте влажность и не мочите листву. При сильном распространении обработайте фунгицидом.',
        },
      },
      {
        id: 'powdery-mildew',
        name: { en: 'Powdery mildew', ru: 'Мучнистая роса' },
        description: {
          en: 'White powdery patches on the upper surface of the leaves, common in warm weather with wide day-night temperature swings.',
          ru: 'Белые мучнистые пятна на верхней поверхности листьев; часто в тёплую погоду при больших перепадах дневной и ночной температуры.',
        },
        treatment: {
          en: 'Remove affected leaves, improve ventilation and treat with potassium bicarbonate or a suitable fungicide.',
          ru: 'Удалите поражённые листья, улучшите вентиляцию и обработайте бикарбонатом калия или подходящим фунгицидом.',
        },
      },
    ],
    pests: [
      {
        id: 'vine-weevil',
        name: { en: 'Vine weevil', ru: 'Долгоносик (скосарь)' },
        signs: {
          en: 'Irregular notches around leaf margins (adult feeding); plant suddenly wilts and collapses as white C-shaped grubs eat the tuber and roots.',
          ru: 'Неровные выемки по краям листьев (взрослые жуки); растение внезапно вянет и падает — белые личинки в форме буквы C объели клубень и корни.',
        },
        treatment: {
          en: 'Remove the plant, inspect the roots for grubs and discard or treat with a nematode drench (Steinernema kraussei). Use sticky traps for adults.',
          ru: 'Выньте растение, осмотрите корни на наличие личинок и удалите их или обработайте нематодами (Steinernema kraussei). Для взрослых жуков используйте клеевые ловушки.',
        },
      },
      {
        id: 'aphids',
        name: { en: 'Aphids', ru: 'Тля' },
        signs: {
          en: 'Clusters of small insects on new growth and flower buds; distorted leaves and sticky residue.',
          ru: 'Скопления мелких насекомых на молодых побегах и бутонах; деформированные листья и липкий налёт.',
        },
        treatment: {
          en: 'Knock off with a jet of water, then apply insecticidal soap or neem oil; repeat weekly until clear.',
          ru: 'Смойте сильной струёй воды, затем обработайте инсектицидным мылом или маслом нима; повторяйте еженедельно до исчезновения.',
        },
      },
      {
        id: 'spider-mites',
        name: { en: 'Spider mites', ru: 'Паутинный клещ' },
        signs: {
          en: 'Pale stippling and bronzing of leaves, webbing on undersides; worst in hot dry weather.',
          ru: 'Побледнение и бронзовость листьев, паутина снизу; активнее в жаркую сухую погоду.',
        },
        treatment: {
          en: 'Rinse the plant, increase humidity and apply neem oil or a miticide weekly for 3–4 treatments.',
          ru: 'Промойте растение, повысьте влажность и обрабатывайте маслом нима или акарицидом еженедельно, 3–4 обработки.',
        },
      },
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Begonia_%C3%97_tuberhybrida',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Begonia_x_tuberhybrida_Superba.jpg/320px-Begonia_x_tuberhybrida_Superba.jpg',
  },
  {
    id: 'capsicum-annuum-ornamental',
    commonName: 'Ornamental Pepper',
    commonName_ru: 'Декоративный перец чили',
    latinName: 'Capsicum annuum',
    category: 'edible',
    light: 5,
    water: 3,
    humidity: 3,
    difficulty: 2,
    tempMin: 18,
    tempMax: 30,
    perks: ['unsafeChildren'],
    recommendedWateringIntervalDays: 4,
    fertilizeIntervalDays: 14,
    description_en:
      'A striking dual-purpose plant grown both for its ornamental value and its edible (if very hot) fruits. The small, upright fruits ripen through a sequence of colours — green to yellow, orange and red — making the plant look perpetually festive. Fruits contain capsaicin and must be handled with care around children and pets.',
    description_ru:
      'Эффектное универсальное растение, выращиваемое как ради декоративной ценности, так и ради съедобных (хотя и очень острых) плодов. Маленькие прямостоячие плоды созревают через ряд цветов — от зелёного к жёлтому, оранжевому и красному — делая растение постоянно нарядным. Плоды содержат капсаицин, и обращение с ними требует осторожности рядом с детьми и животными.',
    care: {
      appearance: {
        en: 'A bushy, compact plant 20–40 cm tall with dark-green lance-shaped leaves. The small peppers (1–5 cm) grow erect, pointing upward or outward, and ripen in a spectacular sequence of colours over several weeks. A single plant can bear dozens of fruits simultaneously at different stages of ripeness.',
        ru: 'Пышное компактное растение высотой 20–40 см с тёмно-зелёными ланцетными листьями. Маленькие перцы (1–5 см) растут вертикально, торча вверх или в стороны, и в течение нескольких недель проходят эффектную последовательность окрасок. Одно растение может одновременно нести десятки плодов в разной степени зрелости.',
      },
      watering: {
        en: 'Water when the top 2–3 cm of soil have dried out — roughly every 3–5 days depending on conditions. Consistent moisture is important for fruit development; irregular watering causes blossom or fruit drop. Never let the pot dry out completely or sit in waterlogged soil.',
        ru: 'Поливайте, когда верхние 2–3 см субстрата подсохнут — примерно раз в 3–5 дней в зависимости от условий. Равномерная влажность важна для формирования плодов; нерегулярный полив вызывает опадение цветков или завязей. Никогда не пересушивайте полностью и не оставляйте горшок в воде.',
      },
      temperature: {
        en: 'Thrives at 18–30 °C. Temperatures above 35 °C or below 10 °C cause flower and fruit drop. Move indoors before night temperatures fall below 15 °C in autumn.',
        ru: 'Хорошо растёт при 18–30 °C. Температуры выше 35 °C или ниже 10 °C вызывают опадение цветков и плодов. Заносите в помещение до наступления ночных температур ниже 15 °C осенью.',
      },
      light: {
        en: 'Needs full sun — at least 6 hours of direct sunlight per day for abundant fruiting. A south-facing windowsill or outdoor sunny spot is ideal. Insufficient light produces spindly growth and few fruits.',
        ru: 'Требует полного солнца — не менее 6 часов прямого солнечного света в день для обильного плодоношения. Идеален южный подоконник или солнечное место на улице. При недостатке света растение вытягивается и даёт мало плодов.',
      },
      humidity: {
        en: 'Tolerates normal indoor humidity well (40–60%). Misting the flowers is counter-productive — it can cause them to drop before setting fruit. Good air circulation helps pollination and prevents fungal issues.',
        ru: 'Хорошо переносит обычную комнатную влажность (40–60%). Опрыскивание цветков контрпродуктивно — оно может привести к их опадению до завязывания плодов. Хорошая циркуляция воздуха помогает опылению и предотвращает грибковые проблемы.',
      },
      fertilizer: {
        en: 'Feed every 2 weeks from transplanting until fruiting begins with a balanced fertilizer. Once fruits start to form, switch to a high-potassium feed (tomato fertilizer) to maximise fruit size and colour. Cease feeding when the plant\'s season ends.',
        ru: 'Каждые 2 недели с момента пересадки до начала плодоношения вносите сбалансированное удобрение. Когда начнут формироваться плоды, переходите на удобрение с высоким калием (для томатов) для максимального размера и окраски плодов. Прекращайте подкормки по окончании сезона.',
      },
      soil: {
        en: 'Well-draining, moderately rich potting mix works well. Avoid heavy clay-based soils. Adding 20% perlite to standard compost ensures good drainage and aeration. pH between 6.0 and 7.0 is preferred.',
        ru: 'Хорошо дренированный умеренно питательный субстрат. Избегайте тяжёлых глинистых почв. Добавление 20% перлита к универсальному грунту обеспечит хороший дренаж и аэрацию. Предпочтительный pH: 6,0–7,0.',
      },
      repotting: {
        en: 'Ornamental peppers are usually grown as annuals and not repotted, but if the plant outgrows its pot mid-season, move it up one size carefully without disturbing the roots to avoid fruit drop.',
        ru: 'Декоративный перец обычно выращивают как однолетник и не пересаживают, но если растение переросло горшок в середине сезона, аккуратно перевалите его в горшок на размер больше, не тревожа корни во избежание опадения плодов.',
      },
      fruiting: {
        en: 'Indoors, gently shake the plant or use a soft brush to transfer pollen between flowers and improve fruit set. Remove any fruits that are past their prime to encourage continued production. Fruits are edible but intensely hot; handle with gloves and keep away from eyes, children and pets.',
        ru: 'В помещении слегка потряхивайте растение или используйте мягкую кисточку для переноса пыльцы между цветками и улучшения завязывания. Удаляйте перезревшие плоды, чтобы стимулировать дальнейшее плодоношение. Плоды съедобны, но очень острые; работайте в перчатках и держите подальше от глаз, детей и животных.',
      },
    },
    propagation: [
      {
        id: 'seeds',
        name: { en: 'Seeds', ru: 'Семена' },
        steps: {
          en: '1. Sow seeds in moist seed compost at 22–25 °C — bottom heat speeds germination.\n2. Germination takes 7–14 days; keep the soil evenly moist under a propagator lid or plastic film.\n3. Prick out seedlings into individual 7 cm pots once they have two true leaves.\n4. Grow on in full sun, potting on as needed. Pinch out the growing tip at 10 cm to encourage bushiness.',
          ru: '1. Посейте семена во влажный субстрат для рассады при 22–25 °C — нижний подогрев ускоряет прорастание.\n2. Всходы появятся через 7–14 дней; поддерживайте равномерную влажность под крышкой мини-теплицы или плёнкой.\n3. Пикируйте сеянцы в отдельные 7-сантиметровые горшочки, когда появятся два настоящих листа.\n4. Выращивайте на ярком солнце, пересаживая по мере необходимости. Прищипните точку роста на высоте 10 см для формирования пышного куста.',
        },
      },
    ],
    diseases: [
      {
        id: 'anthracnose',
        name: { en: 'Anthracnose', ru: 'Антракноз' },
        description: {
          en: 'Dark sunken lesions on fruits and stems caused by Colletotrichum fungi, common in warm, wet conditions.',
          ru: 'Тёмные вдавленные пятна на плодах и стеблях, вызванные грибами Colletotrichum; распространён в тёплых влажных условиях.',
        },
        treatment: {
          en: 'Remove affected fruits and plant parts, improve air circulation, avoid overhead watering and apply a copper-based fungicide as a preventive.',
          ru: 'Удалите поражённые плоды и части растения, улучшите вентиляцию, откажитесь от полива сверху и применяйте медесодержащий фунгицид в профилактических целях.',
        },
      },
      {
        id: 'blossom-end-rot',
        name: { en: 'Blossom-end rot', ru: 'Вершинная гниль' },
        description: {
          en: 'A dark, sunken, water-soaked patch at the blossom end of the fruit, caused by calcium deficiency — often linked to irregular watering that limits calcium uptake.',
          ru: 'Тёмное вдавленное водянистое пятно у вершины плода, вызванное дефицитом кальция — часто связано с нерегулярным поливом, ограничивающим его усвоение.',
        },
        treatment: {
          en: 'Water consistently, apply a calcium-rich foliar spray and mulch to maintain even soil moisture. Remove affected fruits.',
          ru: 'Поддерживайте равномерный полив, проводите внекорневую подкормку кальцием и мульчируйте для сохранения постоянной влажности субстрата. Удаляйте поражённые плоды.',
        },
      },
    ],
    pests: [
      {
        id: 'aphids',
        name: { en: 'Aphids', ru: 'Тля' },
        signs: {
          en: 'Dense colonies on shoot tips and under young leaves; leaf curl, yellowing and sticky honeydew.',
          ru: 'Плотные колонии на кончиках побегов и под молодыми листьями; скручивание, пожелтение листьев и липкая падь.',
        },
        treatment: {
          en: 'Blast off with water, then apply insecticidal soap or neem oil, repeating every 5–7 days. Encourage natural predators such as ladybirds.',
          ru: 'Смойте сильной струёй воды, затем обработайте инсектицидным мылом или маслом нима, повторяя каждые 5–7 дней. Поощряйте естественных хищников, например божьих коровок.',
        },
      },
      {
        id: 'spider-mites',
        name: { en: 'Spider mites', ru: 'Паутинный клещ' },
        signs: {
          en: 'Fine stippling on leaves, webbing on undersides; worst in hot, dry conditions.',
          ru: 'Мелкие точки на листьях, паутина снизу; активнее в жаркую сухую погоду.',
        },
        treatment: {
          en: 'Increase humidity, rinse with water and treat with neem oil or a miticide every 7 days for 3–4 cycles.',
          ru: 'Повысьте влажность, промойте водой и обрабатывайте маслом нима или акарицидом каждые 7 дней, 3–4 цикла.',
        },
      },
      {
        id: 'whitefly',
        name: { en: 'Whitefly', ru: 'Белокрылка' },
        signs: {
          en: 'Tiny white winged insects fly up when the plant is disturbed; yellow stippling on leaves and sticky honeydew.',
          ru: 'Крошечные белокрылые насекомые взлетают при прикосновении к растению; жёлтые точки на листьях и липкая падь.',
        },
        treatment: {
          en: 'Use yellow sticky traps, apply insecticidal soap or neem oil and introduce parasitic wasps (Encarsia formosa) in large infestations.',
          ru: 'Используйте жёлтые клеевые ловушки, обрабатывайте инсектицидным мылом или маслом нима; при сильном поражении запускайте паразитических ос (Encarsia formosa).',
        },
      },
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Capsicum_annuum',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Capsicum_annuum_-_ornamental_pepper.jpg/320px-Capsicum_annuum_-_ornamental_pepper.jpg',
  },
  {
    id: 'solanum-lycopersicum-cherry',
    commonName: 'Cherry Tomato',
    commonName_ru: 'Помидоры черри',
    latinName: 'Solanum lycopersicum var. cerasiforme',
    category: 'edible',
    light: 5,
    water: 4,
    humidity: 3,
    difficulty: 3,
    tempMin: 18,
    tempMax: 30,
    perks: [],
    recommendedWateringIntervalDays: 2,
    fertilizeIntervalDays: 7,
    description_en:
      'The most rewarding edible plant you can grow on a sunny balcony or windowsill. Compact bush and dwarf varieties are perfectly suited to containers, producing sweet, bite-sized tomatoes prolifically from summer to early autumn.',
    description_ru:
      'Самое благодарное съедобное растение для солнечного балкона или подоконника. Компактные кустовые и карликовые сорта прекрасно подходят для контейнеров и обильно дают сладкие небольшие томаты с лета до начала осени.',
    care: {
      appearance: {
        en: 'A vigorous annual reaching 30–150 cm depending on whether the variety is determinate (bush) or indeterminate (vine). Compact varieties (e.g. \'Tiny Tim\', \'Tumbling Tom\') stay under 40 cm and suit pots and window boxes well. The fruits are 2–4 cm across and ripen in red, orange, yellow or near-black.',
        ru: 'Энергичный однолетник высотой 30–150 см в зависимости от типа сорта: детерминантный (кустовой) или индетерминантный (плетистый). Компактные сорта (например, «Тини Тим», «Тумблинг Том») не превышают 40 см и хорошо подходят для горшков и балконных ящиков. Плоды диаметром 2–4 см созревают красными, оранжевыми, жёлтыми или почти чёрными.',
      },
      watering: {
        en: 'Tomatoes are thirsty plants: water deeply every 1–2 days in warm weather so the entire root zone is moist. Consistent soil moisture is critical — fluctuations between wet and dry cause blossom-end rot and splitting fruits. Mulch the surface to retain moisture.',
        ru: 'Томаты — влагоёмкие растения: поливайте обильно каждые 1–2 дня в тёплую погоду, промачивая всю корневую зону. Постоянная влажность субстрата критически важна — колебания между сухим и влажным вызывают вершинную гниль и растрескивание плодов. Мульчируйте поверхность для удержания влаги.',
      },
      temperature: {
        en: 'Grows best at 18–28 °C. Fruit set is poor outside 10–38 °C — below 10 °C flowers drop, above 38 °C pollen becomes sterile. Bring indoors or protect when night temperatures drop below 10 °C.',
        ru: 'Лучше растёт при 18–28 °C. Завязывание плодов нарушается за пределами 10–38 °C — ниже 10 °C цветки опадают, выше 38 °C пыльца стерилизуется. При ночных температурах ниже 10 °C заносите в помещение или защищайте.',
      },
      light: {
        en: 'Requires full sun — minimum 6–8 hours of direct sunlight per day. A south-facing position is essential. Under grow lights, use full-spectrum LEDs for 14–16 hours per day. Insufficient light produces tall, spindly plants with poor fruit set.',
        ru: 'Требует полного солнца — не менее 6–8 часов прямого солнечного света в день. Южная экспозиция обязательна. При искусственном освещении используйте полноспектровые LED-светильники по 14–16 часов в день. При недостатке света растения вытягиваются и плохо завязывают плоды.',
      },
      humidity: {
        en: 'Prefers moderate humidity (50–65%). Too high humidity (above 80%) promotes fungal diseases. Shake the plant or tap the flowers gently each day to improve pollen release and fruit set when growing indoors.',
        ru: 'Предпочитает умеренную влажность (50–65%). Слишком высокая влажность (выше 80%) способствует грибковым болезням. При выращивании в помещении слегка потряхивайте растение или постукивайте по цветкам ежедневно для улучшения распыления пыльцы и завязывания плодов.',
      },
      fertilizer: {
        en: 'Heavy feeders: apply a balanced fertilizer weekly until the first flowers appear, then switch to a high-potassium tomato feed applied every 7 days throughout fruiting. Calcium supplements (dilute calcium nitrate) help prevent blossom-end rot. Stop feeding 2 weeks before the end of the season.',
        ru: 'Очень требовательны к питанию: вносите сбалансированное удобрение еженедельно до появления первых цветков, затем переходите на томатное удобрение с высоким калием каждые 7 дней на протяжении плодоношения. Добавки кальция (разведённая кальциевая селитра) помогают предотвратить вершинную гниль. Прекращайте подкормки за 2 недели до конца сезона.',
      },
      soil: {
        en: 'Rich, moisture-retentive but well-drained compost. Mix standard potting compost with 20% perlite and a generous amount of slow-release granular fertiliser. Tomatoes exhaust the soil quickly, so start with quality mix and feed regularly.',
        ru: 'Богатый, влагоёмкий, но хорошо дренированный субстрат. Смешайте универсальный грунт с 20% перлита и щедрым количеством удобрений медленного высвобождения. Томаты быстро истощают почву, поэтому начинайте с качественного субстрата и регулярно подкармливайте.',
      },
      repotting: {
        en: 'Start seeds indoors 6–8 weeks before the last frost date in moist seed compost at 20–25 °C. Transplant into 7 cm pots after germination, then into final containers (minimum 10–15 litres for compact varieties) when roots fill the pot. Pot deeply — burying the stem up to the lowest leaves encourages additional root growth.',
        ru: 'Сейте семена в помещении за 6–8 недель до последних заморозков во влажный субстрат при 20–25 °C. После прорастания переносите в 7-сантиметровые горшочки, затем в финальные контейнеры (минимум 10–15 литров для компактных сортов), когда корни освоят горшок. Заглубляйте рассаду — закопанный до нижних листьев стебель образует дополнительные корни.',
      },
      fruiting: {
        en: 'Pinch out sideshoots (suckers) on indeterminate varieties regularly to channel energy into fruit. Shake plants or use a vibrating tool to aid pollination indoors. Harvest fruits as soon as they are ripe — frequent picking encourages more fruit production. At the end of the season, remove the top of indeterminate plants to allow remaining fruits to ripen.',
        ru: 'У индетерминантных сортов регулярно удаляйте пасынки, чтобы направить энергию в плоды. В помещении потряхивайте растения или используйте вибрирующий инструмент для опыления. Собирайте плоды сразу по мере созревания — частый сбор стимулирует дальнейшее плодоношение. В конце сезона прищипните верхушку индетерминантных растений, чтобы оставшиеся плоды успели вызреть.',
      },
    },
    propagation: [
      {
        id: 'seeds',
        name: { en: 'Seeds', ru: 'Семена' },
        steps: {
          en: '1. Sow seeds 0.5 cm deep in moist seed compost at 20–25 °C; germination takes 5–10 days.\n2. Keep in bright light once sprouted to prevent leggy growth.\n3. Transplant into 7 cm pots when the first true leaves appear.\n4. Move to final container (10–15 L minimum) when the plant is 15–20 cm tall, burying the stem up to the lowest leaves.',
          ru: '1. Посейте семена на глубину 0,5 см во влажный субстрат при 20–25 °C; всходы появятся через 5–10 дней.\n2. Сразу после прорастания держите на ярком свету, чтобы рассада не вытягивалась.\n3. Пикируйте в 7-сантиметровые горшочки при появлении первых настоящих листьев.\n4. Переносите в финальный контейнер (минимум 10–15 л) при высоте растения 15–20 см, заглубляя стебель до нижних листьев.',
        },
      },
    ],
    diseases: [
      {
        id: 'blight',
        name: { en: 'Blight (early and late)', ru: 'Фитофтороз и ранний ожог (блайт)' },
        description: {
          en: 'Dark, water-soaked lesions on leaves and stems, often with a yellow halo; fruits develop dark, firm patches. Late blight (Phytophthora infestans) is the more destructive of the two.',
          ru: 'Тёмные водянистые пятна на листьях и стеблях, часто с жёлтым ореолом; на плодах тёмные твёрдые участки. Фитофтороз (Phytophthora infestans) — наиболее разрушительная из двух болезней.',
        },
        treatment: {
          en: 'Remove and dispose of affected leaves promptly. Apply copper-based fungicide preventively in humid weather. Ensure good spacing and airflow between plants.',
          ru: 'Немедленно удаляйте и утилизируйте поражённые листья. Применяйте медесодержащий фунгицид в профилактических целях во влажную погоду. Обеспечьте достаточное расстояние и проветривание между растениями.',
        },
      },
      {
        id: 'blossom-end-rot',
        name: { en: 'Blossom-end rot', ru: 'Вершинная гниль' },
        description: {
          en: 'Dark, sunken patch at the blossom end of fruits caused by calcium deficiency, usually triggered by irregular watering.',
          ru: 'Тёмное вдавленное пятно у вершины плода из-за дефицита кальция, как правило спровоцированного нерегулярным поливом.',
        },
        treatment: {
          en: 'Water consistently; apply a calcium foliar spray. Remove affected fruits and mulch to maintain even soil moisture.',
          ru: 'Поливайте регулярно; проводите внекорневую подкормку кальцием. Удаляйте поражённые плоды и мульчируйте для равномерного увлажнения субстрата.',
        },
      },
    ],
    pests: [
      {
        id: 'aphids',
        name: { en: 'Aphids', ru: 'Тля' },
        signs: {
          en: 'Dense colonies on shoot tips, curled leaves and sticky honeydew; can transmit viruses.',
          ru: 'Плотные колонии на кончиках побегов, скрученные листья и липкая падь; может переносить вирусы.',
        },
        treatment: {
          en: 'Knock off with water, apply insecticidal soap or neem oil and encourage natural predators.',
          ru: 'Смойте водой, обработайте инсектицидным мылом или маслом нима и поощряйте естественных хищников.',
        },
      },
      {
        id: 'whitefly',
        name: { en: 'Whitefly', ru: 'Белокрылка' },
        signs: {
          en: 'Clouds of tiny white insects fly up when the plant is touched; yellowing leaves and sticky deposits.',
          ru: 'Облако крошечных белых насекомых взлетает при прикосновении; пожелтение листьев и липкий налёт.',
        },
        treatment: {
          en: 'Use yellow sticky traps; apply insecticidal soap or neem oil. Introduce Encarsia formosa in severe cases.',
          ru: 'Используйте жёлтые клеевые ловушки; наносите инсектицидное мыло или масло нима. При сильном поражении запустите Encarsia formosa.',
        },
      },
      {
        id: 'spider-mites',
        name: { en: 'Spider mites', ru: 'Паутинный клещ' },
        signs: {
          en: 'Fine pale stippling on leaves, webbing on undersides; plant looks dusty and tired.',
          ru: 'Мелкие бледные точки на листьях, паутина снизу; растение выглядит пыльным и угнетённым.',
        },
        treatment: {
          en: 'Rinse with water, raise humidity and apply neem oil or miticide weekly for 3–4 cycles.',
          ru: 'Промойте водой, повысьте влажность и обрабатывайте маслом нима или акарицидом еженедельно в течение 3–4 циклов.',
        },
      },
    ],
    wikiUrl: 'https://en.wikipedia.org/wiki/Cherry_tomato',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Cherry_tomatoes_red_and_yellow.jpg/320px-Cherry_tomatoes_red_and_yellow.jpg',
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
