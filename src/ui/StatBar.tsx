import { useTranslation } from 'react-i18next'
import { DropIcon, SunIcon } from './icons'
import styles from './StatBar.module.css'

const ICONS = { sun: SunIcon, drop: DropIcon } as const

export type StatIcon = keyof typeof ICONS

interface Props {
  icon: StatIcon
  /** Filled count, 1..max. */
  value: number
  max?: number
  /** Already-translated accessible label, e.g. t('careLight'). */
  label: string
}

/** A 1–5 icon rating (suns, drops, …). Color-coded per icon, with an a11y label. */
export default function StatBar({ icon, value, max = 5, label }: Props) {
  const { t } = useTranslation()
  const Icon = ICONS[icon]
  const filled = Math.max(0, Math.min(Math.round(value), max))

  return (
    <span
      className={styles.bar}
      data-icon={icon}
      role="img"
      aria-label={t('ratingValue', { label, value: filled, max })}
    >
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < filled ? styles.filled : styles.empty} aria-hidden="true">
          <Icon className={styles.icon} />
        </span>
      ))}
    </span>
  )
}
