import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import db, { type Plant } from './db'
import PlantCard from './PlantCard'
import { DropIcon, LeafIcon } from './ui/icons'
import { daysUntilWatering } from './watering'
import styles from './TodayScreen.module.css'

interface Props {
  refreshKey: number
  onRefresh: () => void
}

function Bucket({
  title,
  plants,
  onWatered,
}: {
  title: string
  plants: Plant[]
  onWatered: () => void
}) {
  if (plants.length === 0) return null
  return (
    <section className={styles.bucket}>
      <h2 className={styles.bucketTitle}>{title}</h2>
      <div className={styles.list}>
        {plants.map((p) => (
          <PlantCard key={p.id} plant={p} onWatered={onWatered} />
        ))}
      </div>
    </section>
  )
}

export default function TodayScreen({ refreshKey, onRefresh }: Props) {
  const { t } = useTranslation()
  const [plants, setPlants] = useState<Plant[]>([])

  useEffect(() => {
    db.plants.toArray().then(setPlants)
  }, [refreshKey])

  if (plants.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>
          <LeafIcon className={styles.emptyLeaf} />
        </span>
        <h2>{t('todayEmptyTitle')}</h2>
        <p className={styles.emptyHint}>{t('todayEmptyHint')}</p>
      </div>
    )
  }

  const overdue = plants.filter((p) => daysUntilWatering(p) < 0)
  const dueToday = plants.filter((p) => daysUntilWatering(p) === 0)
  const dueSoon = plants.filter((p) => daysUntilWatering(p) > 0)
  const needWater = overdue.length + dueToday.length

  return (
    <div className={styles.screen}>
      <div className={`${styles.summary} ${needWater > 0 ? styles.work : styles.done}`}>
        <span className={styles.summaryIcon}>
          {needWater > 0 ? (
            <DropIcon className={styles.summarySvg} />
          ) : (
            <LeafIcon className={styles.summarySvg} />
          )}
        </span>
        <div className={styles.summaryText}>
          {needWater > 0 ? (
            <>
              <span className={styles.count}>{needWater}</span>
              <span className={styles.label}>{t('summaryToWater', { count: needWater })}</span>
            </>
          ) : (
            <span className={styles.label}>{t('summaryAllDone')}</span>
          )}
        </div>
      </div>

      <Bucket title={t('overdueHeading')} plants={overdue} onWatered={onRefresh} />
      <Bucket title={t('dueTodayHeading')} plants={dueToday} onWatered={onRefresh} />
      <Bucket title={t('dueSoonHeading')} plants={dueSoon} onWatered={onRefresh} />
    </div>
  )
}
