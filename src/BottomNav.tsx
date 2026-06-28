import type { ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import { BookIcon, CalendarIcon, DropIcon, HelpIcon, LeafIcon } from './ui/icons'
import styles from './BottomNav.module.css'

export type Tab = 'today' | 'calendar' | 'plants' | 'catalog' | 'help'

const ITEMS: { tab: Tab; labelKey: string; Icon: ComponentType<{ className?: string }> }[] = [
  { tab: 'today', labelKey: 'tabToday', Icon: DropIcon },
  { tab: 'calendar', labelKey: 'tabCalendar', Icon: CalendarIcon },
  { tab: 'plants', labelKey: 'tabPlants', Icon: LeafIcon },
  { tab: 'catalog', labelKey: 'tabCatalog', Icon: BookIcon },
  { tab: 'help', labelKey: 'tabHelp', Icon: HelpIcon },
]

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
}

export default function BottomNav({ active, onChange }: Props) {
  const { t } = useTranslation()

  return (
    <nav className={styles.nav} aria-label={t('navLabel')}>
      {ITEMS.map(({ tab, labelKey, Icon }) => {
        const isActive = tab === active
        return (
          <button
            key={tab}
            type="button"
            className={`${styles.item} ${isActive ? styles.active : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange(tab)}
          >
            <Icon className={styles.icon} />
            <span className={styles.label}>{t(labelKey)}</span>
          </button>
        )
      })}
    </nav>
  )
}
