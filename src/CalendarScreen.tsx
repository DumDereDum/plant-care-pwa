import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import WateredButton from './WateredButton'
import db, { type CareLog, type Plant } from './db'
import ScreenState from './ui/ScreenState'
import { DropIcon, LeafIcon } from './ui/icons'
import { nextWateringDate } from './watering'
import styles from './CalendarScreen.module.css'

// ---- pure date helpers -----------------------------------------------------

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

/** YYYY-MM-DD string used as stable map key. */
function dayKey(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

/** Parse a YYYY-MM-DD key back to a local midnight Date. */
function keyToDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/**
 * All projected watering dates for a plant that fall within [rangeStart, rangeEnd].
 * Walks forward from lastWateredAt + interval, stepping by interval.
 */
function projectDatesInRange(plant: Plant, rangeStart: Date, rangeEnd: Date): Date[] {
  if (!plant.lastWateredAt) return []
  const interval = plant.wateringIntervalDays

  let date = addDays(startOfDay(plant.lastWateredAt), interval)
  while (date < rangeStart) date = addDays(date, interval)

  const results: Date[] = []
  while (date <= rangeEnd) {
    results.push(new Date(date))
    date = addDays(date, interval)
  }
  return results
}

// ---- day-map ---------------------------------------------------------------

interface DayEntry {
  /** Plants projected due on this day (future) or overdue on this day (past). */
  due: Plant[]
  /** Actual watering events recorded in careLog on this day. */
  watered: { plant: Plant; log: CareLog }[]
}

function buildDayMap(
  plants: Plant[],
  logs: CareLog[],
  year: number,
  month: number,
): Map<string, DayEntry> {
  const rangeStart = new Date(year, month, 1)
  const rangeEnd = new Date(year, month + 1, 0) // last day of month, midnight

  const today = startOfDay(new Date())
  const todayK = dayKey(today)
  const rangeStartK = dayKey(rangeStart)
  const rangeEndK = dayKey(rangeEnd)

  const map = new Map<string, DayEntry>()
  const get = (k: string): DayEntry => {
    if (!map.has(k)) map.set(k, { due: [], watered: [] })
    return map.get(k)!
  }

  const plantById = new Map(plants.map((p) => [p.id, p]))

  for (const plant of plants) {
    const next = nextWateringDate(plant)

    if (!next) {
      // Never watered → show as due today if today is in this month's range
      if (todayK >= rangeStartK && todayK <= rangeEndK) {
        get(todayK).due.push(plant)
      }
      continue
    }

    const nextK = dayKey(next)

    if (next < today) {
      // Overdue: show only on the actual overdue date (if it's in this month)
      if (nextK >= rangeStartK && nextK <= rangeEndK) {
        get(nextK).due.push(plant)
      }
    } else {
      // Due now or future: project all upcoming dates within this month's range.
      // Start projection from max(today, rangeStart) so past days stay clean.
      const projFrom = today > rangeStart ? today : rangeStart
      for (const d of projectDatesInRange(plant, projFrom, rangeEnd)) {
        get(dayKey(d)).due.push(plant)
      }
    }
  }

  for (const log of logs) {
    const plant = plantById.get(log.plantId)
    if (!plant) continue
    const k = dayKey(startOfDay(log.date))
    if (k >= rangeStartK && k <= rangeEndK) {
      get(k).watered.push({ plant, log })
    }
  }

  return map
}

// ---- grid helpers ----------------------------------------------------------

/**
 * Returns 28–42 cells (null = padding from prev/next month), Monday-first.
 */
function buildGridCells(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1)
  const lastDate = new Date(year, month + 1, 0).getDate()
  // getDay(): 0=Sun…6=Sat → Monday-first offset: (getDay()+6)%7
  const startPad = (firstDay.getDay() + 6) % 7

  const cells: (Date | null)[] = Array<null>(startPad).fill(null)
  for (let d = 1; d <= lastDate; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

// Reference Monday: 2024-01-01 is definitively a Monday
const REF_MONDAY = new Date(2024, 0, 1)

function weekdayLabels(locale: string): string[] {
  return Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(addDays(REF_MONDAY, i)),
  )
}

// ---- component -------------------------------------------------------------

interface Props {
  refreshKey: number
  onRefresh: () => void
}

export default function CalendarScreen({ refreshKey, onRefresh }: Props) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? 'en'

  const today = startOfDay(new Date())
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [plants, setPlants] = useState<Plant[]>([])
  const [logs, setLogs] = useState<CareLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const rangeStart = new Date(year, month, 1, 0, 0, 0, 0)
        const rangeEnd = new Date(year, month + 1, 0, 23, 59, 59, 999)
        const [allPlants, monthLogs] = await Promise.all([
          db.plants.toArray(),
          db.careLogs.where('date').between(rangeStart, rangeEnd, true, true).toArray(),
        ])
        setPlants(allPlants)
        setLogs(monthLogs)
        setLoading(false)
      } catch {
        setError(true)
        setLoading(false)
      }
    }
    load()
  }, [year, month, refreshKey])

  const dayMap = useMemo(() => buildDayMap(plants, logs, year, month), [plants, logs, year, month])
  const gridCells = useMemo(() => buildGridCells(year, month), [year, month])
  const wdLabels = useMemo(() => weekdayLabels(locale), [locale])

  const monthTitle = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    new Date(year, month, 1),
  )

  const todayKey = dayKey(today)

  if (loading) return <ScreenState kind="loading" />
  if (error) return <ScreenState kind="error" onRetry={onRefresh} />

  function goPrev() {
    setSelectedKey(null)
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }

  function goNext() {
    setSelectedKey(null)
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  const selectedEntry = selectedKey ? dayMap.get(selectedKey) : undefined
  const selectedDate = selectedKey ? keyToDate(selectedKey) : null
  const isSelectedPastOrToday = selectedDate != null && selectedDate <= today

  return (
    <div className={styles.screen}>

      {/* ── Month navigation ── */}
      <div className={styles.nav}>
        <button type="button" className={styles.navBtn} onClick={goPrev} aria-label={t('prevMonth')}>
          ‹
        </button>
        <h2 className={styles.monthTitle}>{monthTitle}</h2>
        <button type="button" className={styles.navBtn} onClick={goNext} aria-label={t('nextMonth')}>
          ›
        </button>
      </div>

      {/* ── Calendar grid ── */}
      <div className={styles.grid} role="grid" aria-label={monthTitle}>

        {/* Weekday headers */}
        {wdLabels.map((label) => (
          <div key={label} className={styles.weekdayHeader} role="columnheader">
            {label}
          </div>
        ))}

        {/* Day cells */}
        {gridCells.map((date, idx) => {
          if (!date) return <div key={`pad-${idx}`} className={styles.dayCellPad} role="gridcell" />

          const k = dayKey(date)
          const entry = dayMap.get(k)
          const isToday = k === todayKey
          const isPast = date < today
          const isSelected = k === selectedKey
          const hasDue = (entry?.due.length ?? 0) > 0
          const hasWatered = (entry?.watered.length ?? 0) > 0

          return (
            <button
              key={k}
              type="button"
              role="gridcell"
              aria-label={date.getDate().toString()}
              aria-pressed={isSelected}
              aria-current={isToday ? 'date' : undefined}
              className={[
                styles.dayCell,
                isToday && styles.dayCellToday,
                isPast && !isToday && styles.dayCellPast,
                isSelected && styles.dayCellSelected,
              ].filter(Boolean).join(' ')}
              onClick={() => setSelectedKey(isSelected ? null : k)}
            >
              <span className={styles.dayNum}>{date.getDate()}</span>
              {(hasDue || hasWatered) && (
                <span className={styles.dots}>
                  {hasDue && (
                    <span
                      className={`${styles.dot} ${isPast && !isToday ? styles.dotOverdue : styles.dotDue}`}
                    />
                  )}
                  {hasWatered && <span className={`${styles.dot} ${styles.dotWatered}`} />}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Day detail panel ── */}
      {selectedKey && selectedDate && (
        <div className={styles.panel}>
          <p className={styles.panelDate}>
            {new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(selectedDate)}
          </p>

          {(!selectedEntry ||
            (selectedEntry.due.length === 0 && selectedEntry.watered.length === 0)) && (
            <p className={styles.panelEmpty}>{t('calendarNoEvents')}</p>
          )}

          {(selectedEntry?.due.length ?? 0) > 0 && (
            <section className={styles.panelSection}>
              <h3 className={styles.panelSectionTitle}>{t('calendarDue')}</h3>
              <ul className={styles.plantList}>
                {selectedEntry!.due.map((plant) => (
                  <li key={plant.id} className={styles.plantRow}>
                    <LeafIcon className={styles.plantIcon} />
                    <span className={styles.plantName}>{plant.name}</span>
                    {isSelectedPastOrToday && (
                      <WateredButton
                        plantId={plant.id}
                        lastWateredAt={plant.lastWateredAt}
                        onRefresh={onRefresh}
                        className={styles.wateredBtn}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(selectedEntry?.watered.length ?? 0) > 0 && (
            <section className={styles.panelSection}>
              <h3 className={styles.panelSectionTitle}>{t('calendarWatered')}</h3>
              <ul className={styles.plantList}>
                {selectedEntry!.watered.map(({ plant, log }) => (
                  <li key={log.id} className={styles.plantRow}>
                    <DropIcon className={`${styles.plantIcon} ${styles.plantIconDrop}`} />
                    <span className={styles.plantName}>{plant.name}</span>
                    <span className={styles.logTime}>
                      {new Intl.DateTimeFormat(locale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(log.date)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
