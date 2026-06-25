import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { recordFertilize, recordRepot } from './watering'
import Button from './ui/Button'
import { CheckIcon } from './ui/icons'
import styles from './CareActionButton.module.css'

interface Props {
  plantId: number
  type: 'fertilize' | 'repot'
  lastDoneAt: Date | null
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

export default function CareActionButton({ plantId, type, lastDoneAt, onRefresh, className }: Props) {
  const { t } = useTranslation()
  const [justDone, setJustDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const doneToday = lastDoneAt ? isToday(lastDoneAt) : false
  const isDone = justDone || doneToday

  async function handle() {
    if (isDone || busy) return
    setBusy(true)
    if (type === 'fertilize') await recordFertilize(plantId)
    else await recordRepot(plantId)
    setJustDone(true)
    setBusy(false)
    setTimeout(onRefresh, 400)
  }

  return (
    <Button
      variant="secondary"
      disabled={isDone || busy}
      className={[styles.btn, isDone ? styles.done : '', className ?? ''].join(' ')}
      onClick={handle}
    >
      {isDone ? <CheckIcon className={styles.check} /> : t(type)}
    </Button>
  )
}
