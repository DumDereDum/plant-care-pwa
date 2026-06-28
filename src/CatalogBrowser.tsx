import { useEffect, useRef, useState } from 'react'
import type { FC, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  catalogPhoto,
  localizedCommonName,
  sortCatalogByName,
  type Ailment,
  type CatalogEntry,
  type LocalizedText,
  type PlantCategory,
  type PropagationMethod,
} from './catalog'
import { PERK_CONFIG } from './perkConfig'
import {
  AlertCircleIcon,
  BugIcon,
  DropIcon,
  FertilizeIcon,
  FlowerIcon,
  HumidityIcon,
  InfoIcon,
  LeafIcon,
  RepotIcon,
  ScissorsIcon,
  SoilIcon,
  SparkleIcon,
  SproutIcon,
  StarIcon,
  SunIcon,
  ThermometerIcon,
} from './ui/icons'
import styles from './CatalogBrowser.module.css'

interface Props {
  onSelect?: (entry: CatalogEntry) => void
  onAddManually?: () => void
  onClose?: () => void
  standalone?: boolean
}

// ── Plant detail panel ─────────────────────────────────────────────────────────

/** Care-section render order + icon + title key. Mirrors the reference «Советы по уходу». */
const CARE_TOPIC_ORDER = [
  { key: 'appearance', Icon: InfoIcon, titleKey: 'secAppearance' },
  { key: 'watering', Icon: DropIcon, titleKey: 'secWatering' },
  { key: 'temperature', Icon: ThermometerIcon, titleKey: 'secTemperature' },
  { key: 'light', Icon: SunIcon, titleKey: 'secLight' },
  { key: 'humidity', Icon: HumidityIcon, titleKey: 'secHumidity' },
  { key: 'fertilizer', Icon: FertilizeIcon, titleKey: 'secFertilizer' },
  { key: 'soil', Icon: SoilIcon, titleKey: 'secSoil' },
  { key: 'repotting', Icon: RepotIcon, titleKey: 'secRepotting' },
  { key: 'pruning', Icon: ScissorsIcon, titleKey: 'secPruning' },
  { key: 'flowering', Icon: FlowerIcon, titleKey: 'secFlowering' },
  { key: 'phytodesign', Icon: SparkleIcon, titleKey: 'secPhytodesign' },
] as const

/** One care metric rendered as an icon + label + 5-dot rating. */
function StatBlock({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className={styles.statBlock}>
      <div className={styles.statBlockIcon}>{icon}</div>
      <span className={styles.statBlockLabel}>{label}</span>
      <div className={styles.statBlockDots}>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i < value ? styles.dotFilled : styles.dotEmpty}`}
          />
        ))}
      </div>
    </div>
  )
}

interface ChipItem {
  id: string
  name: string
  content: ReactNode
}

/** A care topic whose items expand inline on tap (propagation methods, diseases, pests). */
function ChipGroup({
  groupId,
  Icon,
  title,
  items,
  openItem,
  setOpenItem,
}: {
  groupId: string
  Icon: FC<{ className?: string }>
  title: string
  items: ChipItem[]
  openItem: string | null
  setOpenItem: (v: string | null) => void
}) {
  return (
    <div className={styles.careTopic}>
      <div className={styles.careTopicHead}>
        <span className={styles.careTopicIcon}><Icon className={styles.careTopicIconSvg} /></span>
        <span className={styles.careTopicTitle}>{title}</span>
      </div>
      <div className={styles.chipRow}>
        {items.map((it) => {
          const k = `${groupId}:${it.id}`
          const open = openItem === k
          return (
            <button
              key={it.id}
              type="button"
              className={`${styles.chip} ${open ? styles.chipOpen : ''}`}
              aria-expanded={open}
              onClick={() => setOpenItem(open ? null : k)}
            >
              {it.name}
            </button>
          )
        })}
      </div>
      {items.map((it) =>
        openItem === `${groupId}:${it.id}` ? (
          <div className={styles.chipDetail} key={it.id}>{it.content}</div>
        ) : null,
      )}
    </div>
  )
}

interface DetailProps {
  entry: CatalogEntry
  onClose: () => void
  onSelect: (entry: CatalogEntry) => void
}

function PlantDetail({ entry, onClose, onSelect }: DetailProps) {
  const { t, i18n } = useTranslation()
  const isRu = i18n.language.startsWith('ru')
  const name = localizedCommonName(entry, i18n.language)
  const description = isRu ? entry.description_ru : entry.description_en
  const perks = entry.perks ?? []
  // Currently expanded chip, keyed as `${groupId}:${itemId}`; null = all collapsed.
  const [openItem, setOpenItem] = useState<string | null>(null)
  const L = (txt: LocalizedText) => (isRu ? txt.ru : txt.en)

  // Trap focus / close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const renderAilment = (a: Ailment) => (
    <>
      {a.description && <p className={styles.chipText}>{L(a.description)}</p>}
      {a.signs && (
        <p className={styles.chipText}>
          <b className={styles.chipLabel}>{t('ailmentSigns')}: </b>
          {L(a.signs)}
        </p>
      )}
      {a.prevention && (
        <p className={styles.chipText}>
          <b className={styles.chipLabel}>{t('ailmentPrevention')}: </b>
          {L(a.prevention)}
        </p>
      )}
      {a.treatment && (
        <p className={styles.chipText}>
          <b className={styles.chipLabel}>{t('ailmentTreatment')}: </b>
          {L(a.treatment)}
        </p>
      )}
    </>
  )

  const careTopics = entry.care
    ? CARE_TOPIC_ORDER.filter((tpc) => entry.care?.[tpc.key])
    : []
  const propagation = entry.propagation ?? []
  const diseases = entry.diseases ?? []
  const pests = entry.pests ?? []
  const hasCareGuide =
    careTopics.length > 0 || propagation.length > 0 || diseases.length > 0 || pests.length > 0

  return (
    <div className={styles.detail} role="dialog" aria-modal="true" aria-label={name}>
      {/* Sticky header */}
      <div className={styles.detailHeader}>
        <button className={styles.detailBack} onClick={onClose} aria-label={t('back')}>
          ←
        </button>
        <span className={styles.detailHeaderName}>{name}</span>
        <div style={{ width: 40 }} />
      </div>

      {/* Scrollable content */}
      <div className={styles.detailScroll}>
        {/* Hero photo */}
        <div className={styles.detailHero}>
          <LeafIcon className={styles.detailHeroFallback} />
          <img
            src={catalogPhoto(entry) ?? entry.photoUrl}
            alt={name}
            className={styles.detailHeroImg}
            onError={(e) => { e.currentTarget.style.opacity = '0' }}
          />
        </div>

        <div className={styles.detailContent}>
          {/* Name block */}
          <div className={styles.detailNameBlock}>
            <h2 className={styles.detailName}>{name}</h2>
            <p className={styles.detailLatin}>{entry.latinName}</p>
          </div>

          {/* Description + source */}
          <p className={styles.detailDesc}>{description}</p>
          <a
            href={entry.wikiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.detailWikiLink}
          >
            {t('catalogWikiLink')}
          </a>

          {/* Stats grid */}
          {(entry.light != null || entry.water != null || entry.humidity != null || entry.difficulty != null) && (
            <section className={styles.detailSection}>
              <h3 className={styles.detailSectionTitle}>{t('sectionStats')}</h3>
              <div className={styles.statsGrid}>
                {entry.light != null && (
                  <StatBlock
                    icon={<SunIcon className={styles.statBlockIconSvg} />}
                    label={t('careLight')}
                    value={entry.light}
                  />
                )}
                {entry.water != null && (
                  <StatBlock
                    icon={<DropIcon className={styles.statBlockIconSvg} />}
                    label={t('careWater')}
                    value={entry.water}
                  />
                )}
                {entry.humidity != null && (
                  <StatBlock
                    icon={<HumidityIcon className={styles.statBlockIconSvg} />}
                    label={t('careHumidity')}
                    value={entry.humidity}
                  />
                )}
                {entry.difficulty != null && (
                  <StatBlock
                    icon={<StarIcon className={styles.statBlockIconSvg} />}
                    label={t('careDifficulty')}
                    value={entry.difficulty}
                  />
                )}
              </div>
            </section>
          )}

          {/* Temperature */}
          {(entry.tempMin != null || entry.tempMax != null) && (
            <section className={styles.detailSection}>
              <h3 className={styles.detailSectionTitle}>{t('sectionTemperature')}</h3>
              <div className={styles.tempRow}>
                <ThermometerIcon className={styles.tempIcon} />
                <span className={styles.tempValue}>
                  {entry.tempMin != null && entry.tempMax != null
                    ? t('careTempValue', { min: entry.tempMin, max: entry.tempMax })
                    : entry.tempMin != null
                    ? t('careTempMin', { min: entry.tempMin })
                    : t('careTempMax', { max: entry.tempMax })}
                </span>
              </div>
            </section>
          )}

          {/* Perks */}
          {perks.length > 0 && (
            <section className={styles.detailSection}>
              <h3 className={styles.detailSectionTitle}>{t('sectionPerks')}</h3>
              <div className={styles.perkList}>
                {perks.map((key) => {
                  const meta = PERK_CONFIG[key]
                  if (!meta) return null
                  return (
                    <span
                      key={key}
                      className={`${styles.perkItem} ${styles[`tone_${meta.tone}`]}`}
                    >
                      <meta.Icon className={styles.perkItemIcon} />
                      <span>{t(meta.labelKey)}</span>
                    </span>
                  )
                })}
              </div>
            </section>
          )}

          {/* Schedule hint */}
          {entry.recommendedWateringIntervalDays != null && (
            <section className={styles.detailSection}>
              <h3 className={styles.detailSectionTitle}>{t('sectionSchedule')}</h3>
              <p className={styles.detailSchedule}>
                💧 {i18n.t('waterEvery', { count: entry.recommendedWateringIntervalDays })}
                {entry.fertilizeIntervalDays != null && (
                  <>
                    {' · '}
                    🌿 {i18n.t('fertilizeEvery', { count: entry.fertilizeIntervalDays })}
                  </>
                )}
              </p>
            </section>
          )}

          {/* Care guide — structured per-topic sections (reference «Советы по уходу») */}
          {hasCareGuide ? (
            <section className={styles.careGuide}>
              <h3 className={styles.careGuideHeading}>{t('careTips')}</h3>

              {careTopics.map((tpc) => (
                <div className={styles.careTopic} key={tpc.key}>
                  <div className={styles.careTopicHead}>
                    <span className={styles.careTopicIcon}>
                      <tpc.Icon className={styles.careTopicIconSvg} />
                    </span>
                    <span className={styles.careTopicTitle}>{t(tpc.titleKey)}</span>
                  </div>
                  <p className={styles.careTopicText}>{L(entry.care![tpc.key]!)}</p>
                </div>
              ))}

              {propagation.length > 0 && (
                <ChipGroup
                  groupId="prop"
                  Icon={SproutIcon}
                  title={t('secPropagation')}
                  openItem={openItem}
                  setOpenItem={setOpenItem}
                  items={propagation.map((m: PropagationMethod) => ({
                    id: m.id,
                    name: L(m.name),
                    content: <p className={styles.chipText}>{L(m.steps)}</p>,
                  }))}
                />
              )}

              {diseases.length > 0 && (
                <ChipGroup
                  groupId="dis"
                  Icon={AlertCircleIcon}
                  title={t('secDiseases')}
                  openItem={openItem}
                  setOpenItem={setOpenItem}
                  items={diseases.map((a) => ({ id: a.id, name: L(a.name), content: renderAilment(a) }))}
                />
              )}

              {pests.length > 0 && (
                <ChipGroup
                  groupId="pest"
                  Icon={BugIcon}
                  title={t('secPests')}
                  openItem={openItem}
                  setOpenItem={setOpenItem}
                  items={pests.map((a) => ({ id: a.id, name: L(a.name), content: renderAilment(a) }))}
                />
              )}
            </section>
          ) : (
            entry.careTips && (
              <section className={styles.detailSection}>
                <h3 className={styles.detailSectionTitle}>{t('careTips')}</h3>
                <p className={styles.detailTips}>{entry.careTips}</p>
              </section>
            )
          )}
        </div>
      </div>

      {/* Sticky footer */}
      <div className={styles.detailFooter}>
        <button className={styles.detailSelectBtn} onClick={() => onSelect(entry)}>
          {t('catalogSelectPlant')}
        </button>
      </div>
    </div>
  )
}

// ── Catalog browser ────────────────────────────────────────────────────────────

export default function CatalogBrowser({ onSelect, onAddManually, onClose, standalone }: Props) {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [detailEntry, setDetailEntry] = useState<CatalogEntry | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'az' | 'difficulty' | 'watering'>('az')
  const [groupBy, setGroupBy] = useState<'none' | 'category'>('none')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (standalone) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [standalone])

  useEffect(() => {
    if (!onClose) return
    function handleKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (detailEntry) setDetailEntry(null)
      else onClose!()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [detailEntry, onClose])

  useEffect(() => { if (!standalone) searchRef.current?.focus() }, [standalone])

  const q = search.trim().toLowerCase()

  const FILTER_CHIPS = [
    { key: 'all',           labelKey: 'catalogFilterAll' },
    { key: 'petSafe',       labelKey: 'catalogFilterPetSafe' },
    { key: 'airPurifying',  labelKey: 'catalogFilterAirPurifying' },
    { key: 'lowLight',      labelKey: 'catalogFilterLowLight' },
    { key: 'easyCare',      labelKey: 'catalogFilterEasyCare' },
    { key: 'rareWatering',  labelKey: 'catalogFilterRareWatering' },
  ] as const

  function matchesFilter(e: CatalogEntry, f: string): boolean {
    switch (f) {
      case 'petSafe':      return !e.perks?.includes('toxicCats') && !e.perks?.includes('toxicDogs')
      case 'airPurifying': return !!e.perks?.some((p) => p === 'airPurifying' || p === 'oxygenBoost')
      case 'lowLight':     return (e.light ?? 99) <= 2
      case 'easyCare':     return (e.difficulty ?? 99) <= 2
      case 'rareWatering': return (e.water ?? 99) <= 2
      default:             return true
    }
  }

  const CAT_ORDER: PlantCategory[] = [
    'flowering', 'decorative', 'succulent', 'cactus', 'climbing',
    'palm', 'orchid', 'bromeliad', 'fern', 'bulbous', 'edible', 'carnivorous',
  ]
  const CAT_LABEL: Record<PlantCategory, string> = {
    flowering:   'catFlowering',
    decorative:  'catDecorative',
    succulent:   'catSucculent',
    edible:      'catEdible',
    climbing:    'catClimbing',
    bulbous:     'catBulbous',
    palm:        'catPalm',
    bromeliad:   'catBromeliad',
    cactus:      'catCactus',
    orchid:      'catOrchid',
    carnivorous: 'catCarnivorous',
    fern:        'catFern',
  }

  let pool = sortCatalogByName(i18n.language)
  if (q) {
    pool = pool.filter(
      (e) =>
        e.commonName.toLowerCase().includes(q) ||
        e.commonName_ru.toLowerCase().includes(q) ||
        e.latinName.toLowerCase().includes(q),
    )
  }
  pool = pool.filter((e) => matchesFilter(e, activeFilter))
  if (sortBy === 'difficulty') {
    pool = [...pool].sort((a, b) => (a.difficulty ?? 99) - (b.difficulty ?? 99))
  } else if (sortBy === 'watering') {
    pool = [...pool].sort((a, b) => (a.water ?? 99) - (b.water ?? 99))
  }

  type Group = { key: string; labelKey: string; entries: CatalogEntry[] }
  let groups: Group[]
  if (groupBy === 'category') {
    const byCat = new Map<string, CatalogEntry[]>()
    for (const e of pool) {
      const key = e.category ?? '__other__'
      const arr = byCat.get(key) ?? []
      arr.push(e)
      byCat.set(key, arr)
    }
    groups = [
      ...CAT_ORDER
        .filter((c) => byCat.has(c))
        .map((c) => ({ key: c, labelKey: CAT_LABEL[c], entries: byCat.get(c)! })),
      ...(byCat.has('__other__') ? [{ key: '__other__', labelKey: 'catOther', entries: byCat.get('__other__')! }] : []),
    ]
  } else {
    groups = [{ key: '__all__', labelKey: '', entries: pool }]
  }

  return (
    <div
      className={standalone ? styles.standaloneWrap : styles.overlay}
      role={standalone ? undefined : 'dialog'}
      aria-modal={standalone ? undefined : 'true'}
      aria-label={t('catalogBrowserTitle')}
    >
      {/* ── Grid view ── */}
      <div className={styles.header}>
        <h2 className={styles.title}>{t('catalogBrowserTitle')}</h2>
        {!standalone && onClose && (
          <button className={styles.closeBtn} onClick={onClose} aria-label={t('catalogClose')}>
            ✕
          </button>
        )}
      </div>

      <div className={styles.searchWrap}>
        <input
          ref={searchRef}
          className={styles.searchInput}
          type="search"
          placeholder={t('catalogSearchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.filterBar}>
        <div className={styles.chips}>
          {FILTER_CHIPS.map(({ key, labelKey }) => (
            <button
              key={key}
              type="button"
              className={`${styles.filterChip} ${activeFilter === key ? styles.filterChipActive : ''}`}
              onClick={() => setActiveFilter(key)}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
        <div className={styles.controlsRow}>
          <label className={styles.controlLabel}>
            {t('catalogSortLabel')}
            <select
              className={styles.controlSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="az">{t('catalogSortAZ')}</option>
              <option value="difficulty">{t('catalogSortDifficulty')}</option>
              <option value="watering">{t('catalogSortWatering')}</option>
            </select>
          </label>
          <label className={styles.controlLabel}>
            {t('catalogGroupLabel')}
            <select
              className={styles.controlSelect}
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as typeof groupBy)}
            >
              <option value="none">{t('catalogGroupNone')}</option>
              <option value="category">{t('catalogGroupCategory')}</option>
            </select>
          </label>
        </div>
      </div>

      <div className={styles.scrollArea}>
        {pool.length === 0 && (
          <p className={styles.noResults}>{t('catalogNoResults')}</p>
        )}

        {groups.map((group) => (
          <div key={group.key}>
            {groupBy === 'category' && (
              <h3 className={styles.groupHeader}>{t(group.labelKey)}</h3>
            )}
            <div className={styles.grid}>
          {group.entries.map((entry) => {
            const perks = entry.perks ?? []
            const frontPerks = perks.slice(0, 4)
            const displayName = localizedCommonName(entry, i18n.language)

            return (
              <div key={entry.id} className={styles.card}>
                {/* Photo */}
                <div
                  className={styles.photoWrap}
                  onClick={() => onSelect?.(entry)}
                  role="button"
                  tabIndex={0}
                  aria-label={displayName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(entry) }
                  }}
                >
                  <LeafIcon className={styles.photoFallback} />
                  <img
                    src={catalogPhoto(entry) ?? entry.photoUrl}
                    alt={displayName}
                    className={styles.photo}
                    onError={(e) => { e.currentTarget.style.opacity = '0' }}
                  />
                </div>

                {/* Card body */}
                <div className={styles.cardBody} onClick={() => onSelect?.(entry)}>
                  <span className={styles.cardName}>{displayName}</span>

                  <div className={styles.statsRow}>
                    {entry.light != null && (
                      <span className={styles.statChip}>
                        <SunIcon className={styles.statChipIcon} />
                        <span>{entry.light}</span>
                      </span>
                    )}
                    {entry.water != null && (
                      <span className={styles.statChip}>
                        <DropIcon className={styles.statChipIcon} />
                        <span>{entry.water}</span>
                      </span>
                    )}
                    {entry.difficulty != null && (
                      <span className={styles.statChip}>
                        <StarIcon className={styles.statChipIcon} />
                        <span>{entry.difficulty}</span>
                      </span>
                    )}
                  </div>

                  {frontPerks.length > 0 && (
                    <div className={styles.perkRow}>
                      {frontPerks.map((key) => {
                        const meta = PERK_CONFIG[key]
                        if (!meta) return null
                        return (
                          <span
                            key={key}
                            className={`${styles.perkDot} ${styles[`tone_${meta.tone}`]}`}
                            title={t(meta.labelKey)}
                            aria-label={t(meta.labelKey)}
                          >
                            <meta.Icon className={styles.perkDotIcon} />
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* ℹ︎ opens detail panel */}
                <button
                  className={styles.infoBtn}
                  aria-label={t('catalogInfoLabel')}
                  onClick={(e) => { e.stopPropagation(); setDetailEntry(entry) }}
                >
                  ℹ
                </button>
              </div>
            )
          })}
            </div>
          </div>
        ))}

        {onAddManually && (
          <div className={styles.manualRow}>
            <button className={styles.manualBtn} onClick={onAddManually}>
              {t('addManually')}
            </button>
          </div>
        )}
      </div>

      {/* ── Detail overlay ── */}
      {detailEntry && (
        <PlantDetail
          entry={detailEntry}
          onClose={() => setDetailEntry(null)}
          onSelect={(e) => { onSelect?.(e) }}
        />
      )}
    </div>
  )
}
