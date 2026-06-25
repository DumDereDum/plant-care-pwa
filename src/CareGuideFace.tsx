import { useTranslation } from 'react-i18next'
import type { CareGuide } from './db'
import Button from './ui/Button'
import StatBar from './ui/StatBar'
import {
  ChildIcon,
  DustIcon,
  FlowerIcon,
  LeafIcon,
  PawIcon,
  SparkleIcon,
  ThermometerIcon,
  WindIcon,
} from './ui/icons'
import styles from './CareGuideFace.module.css'

type PerkTone = 'good' | 'bad' | 'neutral'

interface PerkEntry {
  Icon: React.ComponentType<{ className?: string }>
  tone: PerkTone
  labelKey: string
}

const PERK_MAP: Record<string, PerkEntry> = {
  toxicCats:      { Icon: PawIcon,     tone: 'bad',     labelKey: 'perkToxicCats' },
  toxicDogs:      { Icon: PawIcon,     tone: 'bad',     labelKey: 'perkToxicDogs' },
  safeCats:       { Icon: PawIcon,     tone: 'good',    labelKey: 'perkSafeCats' },
  safeDogs:       { Icon: PawIcon,     tone: 'good',    labelKey: 'perkSafeDogs' },
  unsafeChildren: { Icon: ChildIcon,   tone: 'bad',     labelKey: 'perkUnsafeChildren' },
  allergenic:     { Icon: FlowerIcon,  tone: 'bad',     labelKey: 'perkAllergenic' },
  airPurifying:   { Icon: WindIcon,    tone: 'good',    labelKey: 'perkAirPurifying' },
  oxygenBoost:    { Icon: SparkleIcon, tone: 'good',    labelKey: 'perkOxygenBoost' },
  dustCollecting: { Icon: DustIcon,    tone: 'neutral', labelKey: 'perkDustCollecting' },
}

function getDisplayPerks(guide: CareGuide): Array<{ key: string } & PerkEntry> {
  const stored = guide.perks ?? []
  const result: Array<{ key: string } & PerkEntry> = []

  // Derived safety: always show cat/dog status when guide exists
  result.push(stored.includes('toxicCats')
    ? { key: 'toxicCats', ...PERK_MAP.toxicCats }
    : { key: 'safeCats',  ...PERK_MAP.safeCats })
  result.push(stored.includes('toxicDogs')
    ? { key: 'toxicDogs', ...PERK_MAP.toxicDogs }
    : { key: 'safeDogs',  ...PERK_MAP.safeDogs })

  // Other stored perks (toxicCats/Dogs already handled above)
  for (const perk of stored) {
    if (perk === 'toxicCats' || perk === 'toxicDogs') continue
    const entry = PERK_MAP[perk]
    if (entry) result.push({ key: perk, ...entry })
  }

  return result
}

interface Props {
  guide: CareGuide | null
  onFlip: () => void
  // Placeholder for future edit form; no-op until T11.4
  onFillIn: () => void
}

export default function CareGuideFace({ guide, onFlip, onFillIn }: Props) {
  const { t } = useTranslation()

  if (!guide) {
    return (
      <div className={styles.face}>
        <div className={styles.header}>
          <h3>{t('careGuideTitle')}</h3>
          <Button variant="secondary" className={styles.flipBackBtn} onClick={onFlip}>
            {t('flipToPlant')}
          </Button>
        </div>
        <div className={styles.empty}>
          <LeafIcon className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>{t('careGuideEmpty')}</p>
          <p className={styles.emptyHint}>{t('careGuideEmptyHint')}</p>
          <Button onClick={onFillIn}>{t('fillInGuide')}</Button>
        </div>
      </div>
    )
  }

  const perks = getDisplayPerks(guide)

  const tempText = (() => {
    const { tempMin: min, tempMax: max } = guide
    if (min != null && max != null) return t('careTempValue', { min, max })
    if (min != null) return t('careTempMin', { min })
    if (max != null) return t('careTempMax', { max })
    return null
  })()

  const hasStats = guide.light || guide.water || guide.humidity || guide.difficulty || tempText

  return (
    <div className={styles.face}>
      <div className={styles.header}>
        <div>
          <h3>{t('careGuideTitle')}</h3>
          {guide.species && <p className={styles.species}>{guide.species}</p>}
        </div>
        <Button variant="secondary" className={styles.flipBackBtn} onClick={onFlip}>
          {t('flipToPlant')}
        </Button>
      </div>

      {hasStats && (
        <div className={styles.stats}>
          {guide.light != null && (
            <div className={styles.stat}>
              <span className={styles.statLabel}>{t('careLight')}</span>
              <StatBar icon="sun" value={guide.light} label={t('careLight')} />
            </div>
          )}
          {guide.water != null && (
            <div className={styles.stat}>
              <span className={styles.statLabel}>{t('careWater')}</span>
              <StatBar icon="drop" value={guide.water} label={t('careWater')} />
            </div>
          )}
          {guide.humidity != null && (
            <div className={styles.stat}>
              <span className={styles.statLabel}>{t('careHumidity')}</span>
              <StatBar icon="wave" value={guide.humidity} label={t('careHumidity')} />
            </div>
          )}
          {guide.difficulty != null && (
            <div className={styles.stat}>
              <span className={styles.statLabel}>{t('careDifficulty')}</span>
              <StatBar icon="star" value={guide.difficulty} label={t('careDifficulty')} />
            </div>
          )}
          {tempText && (
            <div className={styles.stat}>
              <span className={styles.statLabel}>{t('careTempRange')}</span>
              <span className={styles.tempValue}>
                <ThermometerIcon className={styles.tempIcon} />
                {tempText}
              </span>
            </div>
          )}
        </div>
      )}

      {perks.length > 0 && (
        <div className={styles.perks}>
          {perks.map(({ key, Icon, tone, labelKey }) => {
            const toneClass =
              tone === 'good' ? styles.perkGood : tone === 'bad' ? styles.perkBad : styles.perkNeutral
            return (
              <span key={key} className={`${styles.perk} ${toneClass}`}>
                <Icon className={styles.perkIcon} />
                <span>{t(labelKey)}</span>
              </span>
            )
          })}
        </div>
      )}

      {guide.description && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>{t('careDescription')}</h4>
          <p className={styles.sectionText}>{guide.description}</p>
        </div>
      )}

      {guide.careTips && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>{t('careTips')}</h4>
          <p className={styles.sectionText}>{guide.careTips}</p>
        </div>
      )}
    </div>
  )
}
