import type { HTMLAttributes } from 'react'
import styles from './Card.module.css'

type Props = HTMLAttributes<HTMLDivElement>

/** White surface, rounded (radius-lg), one soft shadow. Spreads div props. */
export default function Card({ className, ...rest }: Props) {
  return <div className={`${styles.card}${className ? ` ${className}` : ''}`} {...rest} />
}
