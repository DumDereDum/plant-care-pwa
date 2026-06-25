import { useTranslation } from 'react-i18next'
import type { BadgeDef, BadgeTier, PlantAchievements } from '../achievements'
import { DropIcon, SparkleIcon } from './icons'
import styles from './AchievementsPanel.module.css'

function tierClass(tier: BadgeTier): string {
  return styles[`tier${tier[0].toUpperCase()}${tier.slice(1)}`] ?? ''
}

function BadgePill({ badge }: { badge: BadgeDef }) {
  const { t } = useTranslation()
  return (
    <span className={`${styles.badge} ${tierClass(badge.tier)}`}>
      {badge.type === 'streak'
        ? <SparkleIcon className={styles.badgeIcon} />
        : <DropIcon className={styles.badgeIcon} />
      }
      {t(badge.labelKey)}
    </span>
  )
}

interface Props {
  achievements: PlantAchievements
}

export default function AchievementsPanel({ achievements }: Props) {
  const { t } = useTranslation()
  const { currentStreak, totalWaterings, score, earnedBadges, nextStreakBadge, nextCountBadge } = achievements

  // Show streak progress only while the streak is alive (most motivating track).
  // Fall back to count progress when no active streak.
  const showStreak = currentStreak > 0 && nextStreakBadge != null
  const showCount  = !showStreak && nextCountBadge != null

  const progressPct = showStreak
    ? Math.min(100, (currentStreak / nextStreakBadge!.threshold) * 100)
    : showCount
      ? Math.min(100, (totalWaterings / nextCountBadge!.threshold) * 100)
      : 0

  return (
    <div className={styles.panel}>
      <h3 className={styles.heading}>{t('achievementsHeading')}</h3>

      {earnedBadges.length === 0 ? (
        <p className={styles.empty}>{t('achievementsEmpty')}</p>
      ) : (
        <div className={styles.badges}>
          {earnedBadges.map(b => <BadgePill key={b.id} badge={b} />)}
        </div>
      )}

      {(showStreak || showCount) && (
        <div className={styles.progress}>
          <p className={styles.progressLabel}>
            {showStreak
              ? t('achievementsNextStreak', {
                  current: currentStreak,
                  target: nextStreakBadge!.threshold,
                  badge: t(nextStreakBadge!.labelKey),
                })
              : t('achievementsNextCount', {
                  current: totalWaterings,
                  target: nextCountBadge!.threshold,
                  badge: t(nextCountBadge!.labelKey),
                })
            }
          </p>
          <div className={styles.bar} role="progressbar" aria-valuenow={Math.round(progressPct)} aria-valuemin={0} aria-valuemax={100}>
            <div className={styles.fill} style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      {(currentStreak > 0 || score > 0) && (
        <div className={styles.stats}>
          {currentStreak > 0 && <span>{t('achievementsStreak', { count: currentStreak })}</span>}
          {score > 0 && <span>{t('achievementsScore', { score })}</span>}
        </div>
      )}
    </div>
  )
}
