import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { type Plant } from './db'
import Card from './ui/Card'
import StatusPill from './ui/StatusPill'
import { LeafIcon } from './ui/icons'
import WateredButton from './WateredButton'
import { daysUntilWatering, nextWateringDate } from './watering'
import styles from './PlantCard.module.css'

interface Props {
  plant: Plant
  onWatered: () => void
  /** When provided, the card body is tappable and opens the plant detail. */
  onOpen?: () => void
}

export default function PlantCard({ plant, onWatered, onOpen }: Props) {
  const { t, i18n } = useTranslation()

  const photoUrl = useMemo(
    () => (plant.photo ? URL.createObjectURL(plant.photo) : null),
    [plant.photo],
  )
  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl) }, [photoUrl])

  const days = daysUntilWatering(plant)
  const nextDate = nextWateringDate(plant)
  const fmt = (d: Date) => new Intl.DateTimeFormat(i18n.resolvedLanguage).format(d)

  const statusText = !plant.lastWateredAt
    ? t('neverWatered')
    : days < 0
      ? t('overdueDays', { count: Math.abs(days) })
      : days === 0
        ? t('dueToday')
        : t('dueSoonDays', { count: days })

  const statusTone = !plant.lastWateredAt || days <= 0 ? 'coral' : 'amber'

  const body = (
    <>
      <span className={styles.avatar}>
        {photoUrl ? <img src={photoUrl} alt="" /> : <LeafIcon className={styles.leaf} />}
      </span>
      <span className={styles.info}>
        <span className={styles.name}>{plant.name}</span>
        <span className={styles.status}>
          <StatusPill tone={statusTone}>{statusText}</StatusPill>
        </span>
        <span className={styles.meta}>
          {t('waterEvery', { count: plant.wateringIntervalDays })}
        </span>
        {nextDate && (
          <span className={styles.meta}>{t('nextWatering', { date: fmt(nextDate) })}</span>
        )}
      </span>
    </>
  )

  return (
    <Card className={styles.card}>
      {onOpen ? (
        <button type="button" className={styles.main} onClick={onOpen}>
          {body}
        </button>
      ) : (
        <div className={styles.mainStatic}>{body}</div>
      )}
      <div className={styles.actions}>
        <WateredButton plantId={plant.id} onRefresh={onWatered} />
      </div>
    </Card>
  )
}
