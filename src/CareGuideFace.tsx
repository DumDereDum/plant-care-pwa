import { useTranslation } from 'react-i18next'
import { catalogEntryForGuide, localizedDescription } from './catalog'
import type { CareGuide } from './db'
import { PERK_CONFIG } from './perkConfig'
import Button from './ui/Button'
import StatBar from './ui/StatBar'
import { LeafIcon, ThermometerIcon } from './ui/icons'
import styles from './CareGuideFace.module.css'

function getDisplayPerks(guide: CareGuide) {
  const stored = guide.perks ?? []
  const result: Array<{ key: string } & (typeof PERK_CONFIG)[string]> = []

  // Derived safety: always show cat/dog status when guide exists
  result.push(
    stored.includes('toxicCats')
      ? { key: 'toxicCats', ...PERK_CONFIG.toxicCats }
      : { key: 'safeCats',  ...PERK_CONFIG.safeCats },
  )
  result.push(
    stored.includes('toxicDogs')
      ? { key: 'toxicDogs', ...PERK_CONFIG.toxicDogs }
      : { key: 'safeDogs',  ...PERK_CONFIG.safeDogs },
  )

  for (const perk of stored) {
    if (perk === 'toxicCats' || perk === 'toxicDogs') continue
    const entry = PERK_CONFIG[perk]
    if (entry) result.push({ key: perk, ...entry })
  }

  return result
}

interface Props {
  guide: CareGuide | null
  onFlip: () => void
  onEdit: () => void
}

export default function CareGuideFace({ guide, onFlip, onEdit }: Props) {
  const { t, i18n } = useTranslation()

  if (!guide) {
    return (
      <div className={styles.face}>
        <div className={styles.header}>
          <h3>{t('careGuideTitle')}</h3>
          <Button variant="secondary" className={styles.headerBtn} onClick={onFlip}>
            {t('flipToPlant')}
          </Button>
        </div>
        <div className={styles.empty}>
          <LeafIcon className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>{t('careGuideEmpty')}</p>
          <p className={styles.emptyHint}>{t('careGuideEmptyHint')}</p>
          <Button onClick={onEdit}>{t('fillInGuide')}</Button>
        </div>
      </div>
    )
  }

  const perks = getDisplayPerks(guide)

  const catalogEntry = catalogEntryForGuide(guide)
  // Catalog-linked guides render their description live from the bilingual catalog (so it follows
  // the current language); a user-authored description, when present, takes precedence.
  const displayDescription =
    guide.description?.trim() ||
    (catalogEntry
      ? localizedDescription(catalogEntry, i18n.resolvedLanguage ?? i18n.language)
      : undefined)

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
        <div className={styles.headerBtns}>
          <Button variant="secondary" className={styles.headerBtn} onClick={onEdit}>
            {t('editCareGuide')}
          </Button>
          <Button variant="secondary" className={styles.headerBtn} onClick={onFlip}>
            {t('flipToPlant')}
          </Button>
        </div>
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

      {displayDescription && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>{t('careDescription')}</h4>
          <p className={styles.sectionText}>{displayDescription}</p>
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
