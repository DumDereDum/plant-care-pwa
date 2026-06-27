/** Small inline icons for ratings. They inherit color via `currentColor`. */

interface IconProps {
  className?: string
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
      <line x1="12" y1="1.5" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22.5" />
      <line x1="1.5" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22.5" y2="12" />
      <line x1="4.2" y1="4.2" x2="6" y2="6" />
      <line x1="18" y1="18" x2="19.8" y2="19.8" />
      <line x1="4.2" y1="19.8" x2="6" y2="18" />
      <line x1="18" y1="6" x2="19.8" y2="4.2" />
    </svg>
  )
}

export function DropIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 2.5c3.6 4.3 6.5 8 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 10.5 8.4 6.8 12 2.5z" />
    </svg>
  )
}

export function LeafIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M6.05 8.05c-2.73 2.73-2.73 7.15-.02 9.88 1.47-3.4 4.09-6.24 7.36-7.93-2.77 2.34-4.71 5.61-5.39 9.32 2.6 1.23 5.8.78 7.95-1.37C19.43 14.47 20 4 20 4S9.53 4.57 6.05 8.05z" />
    </svg>
  )
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4.5" width="18" height="16" rx="3" />
      <line x1="3" y1="9.5" x2="21" y2="9.5" />
      <line x1="8" y1="2.5" x2="8" y2="6" />
      <line x1="16" y1="2.5" x2="16" y2="6" />
    </svg>
  )
}

export function HelpIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.2 9.3a2.8 2.8 0 1 1 4 2.7c-.8.5-1.2 1-1.2 1.9" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function HumidityIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6 10 4 14 4 17a8 8 0 0 0 16 0c0-3-2-7-8-15z" />
      <path d="M12 22v-4M8 18l2-2M16 18l-2-2" strokeWidth="1.5" />
    </svg>
  )
}

export function WaveIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M2 10c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
      <path d="M2 16c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
    </svg>
  )
}

export function StarIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 2l2.5 7.5H22l-6.5 4.8 2.5 7.7L12 17.5l-6 4.5 2.5-7.7L2 9.5h7.5L12 2z" />
    </svg>
  )
}

export function ThermometerIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  )
}

export function PawIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <ellipse cx="8" cy="6.5" rx="1.6" ry="2.2" />
      <ellipse cx="14" cy="5.5" rx="1.6" ry="2.2" />
      <ellipse cx="4.5" cy="11" rx="2.2" ry="1.6" />
      <ellipse cx="17.5" cy="11" rx="2.2" ry="1.6" />
      <path d="M12 10c-2.5 0-5.5 2-5.5 4.5 0 2 2.3 3.5 5.5 3.5s5.5-1.5 5.5-3.5C17.5 12 14.5 10 12 10z" />
    </svg>
  )
}

export function ChildIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <circle cx="12" cy="5" r="2.5" />
      <path d="M7 10.5C7 8.6 9.2 7 12 7s5 1.6 5 3.5V16h-3v5h-4v-5H7v-5.5z" />
    </svg>
  )
}

export function FlowerIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <circle cx="12" cy="12" r="2.5" />
      <ellipse cx="12" cy="5.5" rx="1.5" ry="2.5" />
      <ellipse cx="12" cy="18.5" rx="1.5" ry="2.5" />
      <ellipse cx="5.5" cy="12" rx="2.5" ry="1.5" />
      <ellipse cx="18.5" cy="12" rx="2.5" ry="1.5" />
      <ellipse cx="7.5" cy="7.5" rx="1.5" ry="2.5" transform="rotate(-45 7.5 7.5)" />
      <ellipse cx="16.5" cy="7.5" rx="1.5" ry="2.5" transform="rotate(45 16.5 7.5)" />
      <ellipse cx="7.5" cy="16.5" rx="1.5" ry="2.5" transform="rotate(45 7.5 16.5)" />
      <ellipse cx="16.5" cy="16.5" rx="1.5" ry="2.5" transform="rotate(-45 16.5 16.5)" />
    </svg>
  )
}

export function WindIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 8h10a3 3 0 1 0-3-3" />
      <path d="M3 12h14a3 3 0 1 1-3 3" />
      <path d="M3 16h6a2 2 0 1 1-2 2" />
    </svg>
  )
}

export function SparkleIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 2l1.8 5.5H19l-4.6 3.4 1.8 5.6-4.2-3-4.2 3 1.8-5.6L5 7.5h5.2L12 2z" />
      <circle cx="19.5" cy="4" r="1.5" />
      <circle cx="4.5" cy="19.5" r="1.5" />
    </svg>
  )
}

export function DustIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <circle cx="12" cy="12" r="2" />
      <circle cx="5.5" cy="8" r="1.5" />
      <circle cx="18.5" cy="8" r="1.5" />
      <circle cx="5.5" cy="16" r="1.5" />
      <circle cx="18.5" cy="16" r="1.5" />
      <circle cx="12" cy="4" r="1" />
      <circle cx="12" cy="20" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="20" cy="12" r="1" />
    </svg>
  )
}

export function AlertCircleIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function FertilizeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      {/* Erlenmeyer flask: narrow neck top, wider body below */}
      <path d="M9 2h6v7l4 9H5l4-9V2z" />
    </svg>
  )
}

export function RepotIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      {/* Rim strip */}
      <path d="M4 8h16v2H4z" />
      {/* Trapezoidal pot body */}
      <path d="M7 10l1.5 9h7l1.5-9z" />
    </svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
