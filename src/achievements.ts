import type { CareLog, Plant } from './db'

const MS_PER_DAY = 86_400_000

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum'
export type BadgeType = 'streak' | 'count'

export interface BadgeDef {
  id: string
  type: BadgeType
  tier: BadgeTier
  /** streak: consecutive on-time waterings needed; count: total waterings needed */
  threshold: number
  labelKey: string
}

// Ordered easiest → hardest within each track.
export const STREAK_BADGES: BadgeDef[] = [
  { id: 'streak3',  type: 'streak', tier: 'bronze',   threshold: 3,  labelKey: 'badgeOnARoll'    },
  { id: 'streak7',  type: 'streak', tier: 'silver',   threshold: 7,  labelKey: 'badgeConsistent' },
  { id: 'streak14', type: 'streak', tier: 'gold',     threshold: 14, labelKey: 'badgeDedicated'  },
  { id: 'streak30', type: 'streak', tier: 'platinum', threshold: 30, labelKey: 'badgeGreenThumb' },
]

export const COUNT_BADGES: BadgeDef[] = [
  { id: 'count1',  type: 'count', tier: 'bronze',   threshold: 1,  labelKey: 'badgeFirstDrop'   },
  { id: 'count10', type: 'count', tier: 'silver',   threshold: 10, labelKey: 'badgeRegular'     },
  { id: 'count25', type: 'count', tier: 'gold',     threshold: 25, labelKey: 'badgeDevoted'     },
  { id: 'count50', type: 'count', tier: 'platinum', threshold: 50, labelKey: 'badgePlantParent' },
]

const ALL_BADGES: BadgeDef[] = [...COUNT_BADGES, ...STREAK_BADGES]

// ── Helpers ────────────────────────────────────────────────────────────────

function sortedAsc(logs: CareLog[]): CareLog[] {
  return [...logs].sort((a, b) => a.date.getTime() - b.date.getTime())
}

// 50% grace window beyond the plant's scheduled interval.
function isOnTime(gapMs: number, intervalDays: number): boolean {
  return gapMs / MS_PER_DAY <= intervalDays * 1.5
}

// ── Computation ────────────────────────────────────────────────────────────

/**
 * Current active streak: consecutive on-time waterings counted backward from
 * the most recent one. Returns 0 if the plant is currently overdue — the
 * streak is already broken even if past waterings were on time.
 *
 * Used for the live progress indicator (not for awarding streak badges).
 */
export function computeCurrentStreak(logs: CareLog[], plant: Plant): number {
  if (logs.length === 0) return 0
  const sorted = sortedAsc(logs)
  const last = sorted[sorted.length - 1]
  if ((Date.now() - last.date.getTime()) / MS_PER_DAY > plant.wateringIntervalDays * 1.5) {
    return 0
  }
  let streak = 1
  for (let i = sorted.length - 1; i >= 1; i--) {
    const gap = sorted[i].date.getTime() - sorted[i - 1].date.getTime()
    if (isOnTime(gap, plant.wateringIntervalDays)) streak++
    else break
  }
  return streak
}

/**
 * Best streak ever achieved for this plant.
 * Streak badges are awarded based on this value so they are permanent —
 * a missed watering does not revoke an already-earned badge.
 */
export function computeLongestStreak(logs: CareLog[], intervalDays: number): number {
  if (logs.length === 0) return 0
  const sorted = sortedAsc(logs)
  let best = 1, cur = 1
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].date.getTime() - sorted[i - 1].date.getTime()
    if (isOnTime(gap, intervalDays)) { cur++; if (cur > best) best = cur }
    else cur = 1
  }
  return best
}

/**
 * Care score for a plant:
 *   - On-time watering (≤ 1.5× interval):    10 pts
 *   - Streak bonus per watering (streak ≥ 3): +3 pts
 *   - Late watering (≤ 3× interval):           5 pts
 *   - Very late:                               2 pts
 */
export function computeScore(logs: CareLog[], intervalDays: number): number {
  const sorted = sortedAsc(logs)
  let score = 0, streak = 0
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) { score += 10; streak = 1; continue }
    const gapDays = (sorted[i].date.getTime() - sorted[i - 1].date.getTime()) / MS_PER_DAY
    if (gapDays <= intervalDays * 1.5) {
      streak++
      score += 10 + (streak >= 3 ? 3 : 0)
    } else if (gapDays <= intervalDays * 3) {
      streak = 1; score += 5
    } else {
      streak = 1; score += 2
    }
  }
  return score
}

// ── Main aggregate ─────────────────────────────────────────────────────────

export interface PlantAchievements {
  currentStreak: number
  longestStreak: number
  totalWaterings: number
  score: number
  earnedBadges: BadgeDef[]
  /** Next streak badge not yet unlocked (null = all streak badges earned). */
  nextStreakBadge: BadgeDef | null
  /** Next count badge not yet unlocked (null = all count badges earned). */
  nextCountBadge: BadgeDef | null
}

export function computeAchievements(logs: CareLog[], plant: Plant): PlantAchievements {
  const total = logs.length
  const curStreak = computeCurrentStreak(logs, plant)
  const longStreak = computeLongestStreak(logs, plant.wateringIntervalDays)
  const score = computeScore(logs, plant.wateringIntervalDays)

  const earnedBadges = ALL_BADGES.filter(b =>
    b.type === 'streak' ? longStreak >= b.threshold : total >= b.threshold,
  )
  const nextStreakBadge = STREAK_BADGES.find(b => longStreak < b.threshold) ?? null
  const nextCountBadge  = COUNT_BADGES.find(b => total < b.threshold) ?? null

  return { currentStreak: curStreak, longestStreak: longStreak, totalWaterings: total, score, earnedBadges, nextStreakBadge, nextCountBadge }
}
