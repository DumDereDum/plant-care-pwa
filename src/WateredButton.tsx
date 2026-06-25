import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { recordWatering } from './watering'
import Button from './ui/Button'
import { CheckIcon } from './ui/icons'
import styles from './WateredButton.module.css'

interface Props {
  plantId: number
  onRefresh: () => void
  className?: string
}

type Phase = 'idle' | 'busy' | 'done'

export default function WateredButton({ plantId, onRefresh, className }: Props) {
  const { t } = useTranslation()
  const [phase, setPhase] = useState<Phase>('idle')

  async function handle() {
    if (phase !== 'idle') return
    setPhase('busy')
    await recordWatering(plantId)
    setPhase('done')
    // Let the ✓ bounce play before the parent re-renders the list.
    setTimeout(onRefresh, 1100)
  }

  return (
    <Button
      disabled={phase !== 'idle'}
      className={`${styles.btn} ${phase === 'done' ? styles.done : ''} ${className ?? ''}`}
      onClick={handle}
    >
      {phase === 'done' ? (
        <CheckIcon className={styles.check} />
      ) : (
        t('watered')
      )}
    </Button>
  )
}
