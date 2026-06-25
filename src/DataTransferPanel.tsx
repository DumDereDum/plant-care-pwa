import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { exportData, importData } from './dataTransfer'
import Button from './ui/Button'
import Card from './ui/Card'
import styles from './DataTransferPanel.module.css'

interface Props {
  onImported: () => void
}

type Status = { kind: 'ok'; msg: string } | { kind: 'err'; msg: string }

export default function DataTransferPanel({ onImported }: Props) {
  const { t } = useTranslation()
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status | null>(null)

  async function handleExport() {
    try {
      await exportData()
      setStatus({ kind: 'ok', msg: t('exportSuccess') })
    } catch {
      setStatus({ kind: 'err', msg: t('exportError') })
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (!window.confirm(t('importConfirm'))) return

    try {
      const { count } = await importData(file)
      setStatus({ kind: 'ok', msg: t('importSuccess', { count }) })
      onImported()
    } catch (err) {
      const key =
        err instanceof Error &&
        ['invalidJson', 'invalidFormat', 'unsupportedVersion'].includes(err.message)
          ? err.message
          : 'importError'
      setStatus({ kind: 'err', msg: t(key) })
    }
  }

  return (
    <Card className={styles.panel}>
      <h2 className={styles.heading}>{t('dataTransferHeading')}</h2>

      <div className={styles.actions}>
        <Button onClick={handleExport}>{t('exportData')}</Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>
          {t('importData')}
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={handleFileChange}
      />

      {status && (
        <p className={`${styles.status} ${status.kind === 'ok' ? styles.statusOk : styles.statusErr}`}>
          {status.msg}
        </p>
      )}
    </Card>
  )
}
