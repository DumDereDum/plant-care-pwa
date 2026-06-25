import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { computeCurrentStreak, computeScore } from './achievements'
import CareActionButton from './CareActionButton'
import db, { type CareLog, type Plant } from './db'
import PlantCard from './PlantCard'
import ScreenState from './ui/ScreenState'
import { DropIcon, FertilizeIcon, LeafIcon } from './ui/icons'
import { daysUntilFertilize, daysUntilWatering } from './watering'
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
  const [allLogs, setAllLogs] = useState<CareLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([db.plants.toArray(), db.careLogs.toArray()])
      .then(([plantsData, logsData]) => {
        setPlants(plantsData)
        setAllLogs(logsData)
        setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })
  }, [refreshKey])

  const globalStats = useMemo(() => {
    if (plants.length === 0) return null
    const logsByPlant = new Map<number, CareLog[]>()
    for (const log of allLogs) {
      const arr = logsByPlant.get(log.plantId) ?? []
      arr.push(log)
      logsByPlant.set(log.plantId, arr)
    }
    let totalScore = 0
    let bestStreak = 0
    for (const plant of plants) {
      const logs = (logsByPlant.get(plant.id) ?? []).filter(l => l.type === 'water')
      totalScore += computeScore(logs, plant.wateringIntervalDays)
      const s = computeCurrentStreak(logs, plant)
      if (s > bestStreak) bestStreak = s
    }
    return { totalScore, bestStreak }
  }, [plants, allLogs])

  if (loading) return <ScreenState kind="loading" />
  if (error) return <ScreenState kind="error" onRetry={onRefresh} />

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

  const fertilizeNow = plants.filter((p) => {
    const d = daysUntilFertilize(p)
    return d !== null && d <= 0
  })

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
          {globalStats && globalStats.totalScore > 0 && (
            <span className={styles.scoreHint}>
              {t('summaryScore', { score: globalStats.totalScore })}
              {globalStats.bestStreak >= 2 && ` · ${t('summaryStreak', { count: globalStats.bestStreak })}`}
            </span>
          )}
        </div>
      </div>

      <Bucket title={t('overdueHeading')} plants={overdue} onWatered={onRefresh} />
      <Bucket title={t('dueTodayHeading')} plants={dueToday} onWatered={onRefresh} />
      <Bucket title={t('dueSoonHeading')} plants={dueSoon} onWatered={onRefresh} />

      {fertilizeNow.length > 0 && (
        <section className={styles.bucket}>
          <h2 className={styles.bucketTitle}>{t('fertilizeDueHeading')}</h2>
          <ul className={styles.fertilizeList}>
            {fertilizeNow.map((plant) => (
              <li key={plant.id} className={styles.fertilizeRow}>
                <FertilizeIcon className={styles.fertilizeIcon} />
                <span className={styles.fertilizeName}>{plant.name}</span>
                <CareActionButton
                  plantId={plant.id}
                  type="fertilize"
                  lastDoneAt={plant.lastFertilizedAt ?? null}
                  onRefresh={onRefresh}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
