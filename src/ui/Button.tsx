import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

/** Pill button, min 48px tap target, press feedback. Defaults to type="button". */
export default function Button({
  variant = 'primary',
  className,
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant]}${className ? ` ${className}` : ''}`}
      {...rest}
    />
  )
}
