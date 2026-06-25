import type { ReactNode } from 'react'
import styles from './StatusPill.module.css'

type Tone = 'green' | 'coral' | 'amber'

interface Props {
  tone: Tone
  children: ReactNode
  className?: string
}

/** Small status pill. Color is paired with text — never color alone. */
export default function StatusPill({ tone, children, className }: Props) {
  return (
    <span className={`${styles.pill} ${styles[tone]}${className ? ` ${className}` : ''}`}>
      {children}
    </span>
  )
}
