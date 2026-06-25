import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { recordWatering } from './watering'
import Button from './ui/Button'
import { CheckIcon } from './ui/icons'
import styles from './WateredButton.module.css'

interface Props {
  plantId: number
  lastWateredAt: Date | null
  onRefresh: () => void
  className?: string
}

function isToday(d: Date): boolean {
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export default function WateredButton({ plantId, lastWateredAt, onRefresh, className }: Props) {
  const { t } = useTranslation()
  // True only when watered in THIS session — drives the bounce animation.
  const [justWatered, setJustWatered] = useState(false)
  const [busy, setBusy] = useState(false)

  // "Done" is either: just pressed this session, OR already recorded today in the DB.
  const wateredToday = lastWateredAt ? isToday(lastWateredAt) : false
  const isDone = justWatered || wateredToday

  async function handle() {
    if (isDone || busy) return
    setBusy(true)
    await recordWatering(plantId)
    setJustWatered(true)
    setBusy(false)
    // Let the ✓ bounce play before the parent re-renders the list.
    setTimeout(onRefresh, 1100)
  }

  return (
    <Button
      disabled={isDone || busy}
      className={[
        styles.btn,
        isDone ? styles.done : '',
        // Bounce animation only when watered in this session, not on reload.
        justWatered ? styles.animate : '',
        className ?? '',
      ].join(' ')}
      onClick={handle}
    >
      {isDone ? (
        <CheckIcon className={styles.check} />
      ) : (
        t('watered')
      )}
    </Button>
  )
}
