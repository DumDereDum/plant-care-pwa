import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { CareGuide, Plant, PerkKey, Rating } from './db'
import db, { KNOWN_PERKS } from './db'
import { PERK_CONFIG } from './perkConfig'
import Button from './ui/Button'
import { DropIcon, StarIcon, SunIcon, WaveIcon } from './ui/icons'
import styles from './CareGuideEditForm.module.css'

// ---- Rating stepper -------------------------------------------------------

type StatIcon = 'sun' | 'drop' | 'wave' | 'star'

const STAT_ICONS: Record<StatIcon, React.FC<{ className?: string }>> = {
  sun: SunIcon,
  drop: DropIcon,
  wave: WaveIcon,
  star: StarIcon,
}

interface StepperProps {
  icon: StatIcon
  value: Rating | undefined
  onChange: (v: Rating | undefined) => void
  label: string
}

function RatingStepper({ icon, value, onChange, label }: StepperProps) {
  const Icon = STAT_ICONS[icon]
  return (
    <span className={styles.stepper} data-icon={icon} role="group" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => {
        const pos = (i + 1) as Rating
        const filled = value != null && pos <= value
        return (
          <button
            key={i}
            type="button"
            className={`${styles.stepperBtn} ${filled ? styles.stepperBtnFilled : ''}`}
            onClick={() => onChange(pos === value ? undefined : pos)}
            aria-label={`${label} ${pos}`}
            aria-pressed={pos === value}
          >
            <Icon className={styles.stepperIcon} />
          </button>
        )
      })}
    </span>
  )
}

// ---- Form -----------------------------------------------------------------

interface Props {
  plant: Plant
  guide: CareGuide | null
  onSaved: (saved: CareGuide) => void
  onCancel: () => void
  onChanged: () => void
}

export default function CareGuideEditForm({ plant, guide, onSaved, onCancel, onChanged }: Props) {
  const { t } = useTranslation()

  const [light, setLight] = useState<Rating | undefined>(guide?.light)
  const [water, setWater] = useState<Rating | undefined>(guide?.water)
  const [humidity, setHumidity] = useState<Rating | undefined>(guide?.humidity)
  const [difficulty, setDifficulty] = useState<Rating | undefined>(guide?.difficulty)
  const [tempMin, setTempMin] = useState(guide?.tempMin?.toString() ?? '')
  const [tempMax, setTempMax] = useState(guide?.tempMax?.toString() ?? '')
  const [perks, setPerks] = useState<Set<PerkKey>>(
    new Set((guide?.perks ?? []) as PerkKey[]),
  )
  const [recommendedInterval, setRecommendedInterval] = useState(
    guide?.recommendedWateringIntervalDays?.toString() ?? '',
  )
  const [species, setSpecies] = useState(guide?.species ?? '')
  const [description, setDescription] = useState(guide?.description ?? '')
  const [careTips, setCareTips] = useState(guide?.careTips ?? '')

  function togglePerk(key: PerkKey) {
    setPerks((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const recInterval = Number(recommendedInterval)
  const showApplyInterval =
    !!recommendedInterval &&
    recInterval >= 1 &&
    Math.round(recInterval) !== plant.wateringIntervalDays

  async function save(applyInterval: boolean) {
    const guideData: Omit<CareGuide, 'id'> = {
      species: species.trim() || undefined,
      light,
      water,
      humidity,
      difficulty,
      tempMin: tempMin ? Number(tempMin) : undefined,
      tempMax: tempMax ? Number(tempMax) : undefined,
      perks: [...perks],
      recommendedWateringIntervalDays: recInterval >= 1 ? Math.round(recInterval) : undefined,
      description: description.trim() || undefined,
      careTips: careTips.trim() || undefined,
      source: 'user' as const,
    }

    let savedGuide: CareGuide

    if (guide) {
      await db.careGuides.update(guide.id, guideData)
      savedGuide = { ...guide, ...guideData }
    } else {
      const newId = (await db.careGuides.add(guideData as CareGuide)) as number
      await db.plants.update(plant.id, { careGuideId: newId })
      savedGuide = { id: newId, ...guideData }
    }

    if (applyInterval && recInterval >= 1) {
      await db.plants.update(plant.id, {
        wateringIntervalDays: Math.max(1, Math.round(recInterval)),
      })
      onChanged()
    }

    onSaved(savedGuide)
  }

  function handleSave(e: FormEvent) {
    e.preventDefault()
    save(false)
  }

  function handleSaveAndApply() {
    save(true)
  }

  return (
    <form className={styles.form} onSubmit={handleSave}>
      <div className={styles.formHeader}>
        <h3>{guide ? t('editCareGuide') : t('createCareGuide')}</h3>
      </div>

      {/* Care requirements */}
      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>{t('sectionStats')}</h4>
        {(
          [
            ['sun',  'careLight',      light,      setLight     ] ,
            ['drop', 'careWater',      water,      setWater     ] ,
            ['wave', 'careHumidity',   humidity,   setHumidity  ] ,
            ['star', 'careDifficulty', difficulty, setDifficulty] ,
          ] as const
        ).map(([icon, labelKey, val, setter]) => (
          <div key={icon} className={styles.stat}>
            <span className={styles.statLabel}>{t(labelKey)}</span>
            <RatingStepper
              icon={icon}
              value={val}
              onChange={setter as (v: Rating | undefined) => void}
              label={t(labelKey)}
            />
          </div>
        ))}
      </section>

      {/* Temperature */}
      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>{t('sectionTemperature')}</h4>
        <div className={styles.tempRow}>
          <label className={styles.tempField}>
            <span className={styles.fieldLabel}>{t('labelTempMin')}</span>
            <input
              className={styles.input}
              type="number"
              value={tempMin}
              onChange={(e) => setTempMin(e.target.value)}
              min={-20}
              max={50}
              placeholder="—"
            />
          </label>
          <label className={styles.tempField}>
            <span className={styles.fieldLabel}>{t('labelTempMax')}</span>
            <input
              className={styles.input}
              type="number"
              value={tempMax}
              onChange={(e) => setTempMax(e.target.value)}
              min={-20}
              max={60}
              placeholder="—"
            />
          </label>
        </div>
      </section>

      {/* Traits / perks */}
      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>{t('sectionPerks')}</h4>
        <div className={styles.perks}>
          {KNOWN_PERKS.map((key) => {
            const meta = PERK_CONFIG[key]
            if (!meta) return null
            const { Icon, tone, labelKey } = meta
            const selected = perks.has(key)
            const toneClass =
              tone === 'bad'
                ? styles.perkBad
                : tone === 'good'
                  ? styles.perkGood
                  : styles.perkNeutral
            return (
              <button
                key={key}
                type="button"
                className={`${styles.perkBtn} ${selected ? toneClass : styles.perkInactive}`}
                onClick={() => togglePerk(key)}
                aria-pressed={selected}
              >
                <Icon className={styles.perkIcon} />
                <span>{t(labelKey)}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Schedule */}
      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>{t('sectionSchedule')}</h4>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{t('labelRecommendedInterval')}</span>
          <input
            className={styles.input}
            type="number"
            min={1}
            max={365}
            value={recommendedInterval}
            onChange={(e) => setRecommendedInterval(e.target.value)}
            placeholder="—"
          />
        </label>
        {showApplyInterval && (
          <Button
            type="button"
            variant="secondary"
            className={styles.applyBtn}
            onClick={handleSaveAndApply}
          >
            {t('applyRecommendedInterval')}
          </Button>
        )}
      </section>

      {/* Notes */}
      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>{t('sectionNotes')}</h4>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{t('labelSpecies')}</span>
          <input
            className={styles.input}
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{t('labelDescription')}</span>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{t('labelCareTips')}</span>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            value={careTips}
            onChange={(e) => setCareTips(e.target.value)}
            rows={3}
          />
        </label>
      </section>

      {/* Actions */}
      <div className={styles.actions}>
        <Button type="submit">{t('careGuideSave')}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('careGuideCancelEdit')}
        </Button>
      </div>
    </form>
  )
}
