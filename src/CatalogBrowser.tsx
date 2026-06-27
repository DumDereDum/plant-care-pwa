import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CATALOG_SORTED, type CatalogEntry } from './catalog'
import { PERK_CONFIG } from './perkConfig'
import { LeafIcon } from './ui/icons'
import styles from './CatalogBrowser.module.css'

/** Background + icon color for the leaf thumbnail, keyed to the plant's water need. */
function thumbColors(entry: CatalogEntry): { background: string; color: string } {
  const w = entry.water ?? 2
  if (w <= 1) return { background: 'var(--amber-50)',  color: 'var(--amber-600)' }
  if (w <= 2) return { background: 'var(--green-100)', color: 'var(--green-700)' }
  return          { background: 'var(--green-50)',  color: 'var(--green-600)' }
}

interface Props {
  onSelect: (entry: CatalogEntry) => void
  onAddManually: () => void
  onClose: () => void
}

export default function CatalogBrowser({ onSelect, onAddManually, onClose }: Props) {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [flippedId, setFlippedId] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Lock body scroll while the browser is open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Escape: close back face first, then the whole browser
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (flippedId) setFlippedId(null)
      else onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [flippedId, onClose])

  // Auto-focus the search bar on open
  useEffect(() => { searchRef.current?.focus() }, [])

  const q = search.trim().toLowerCase()
  const filtered = q
    ? CATALOG_SORTED.filter(
        (e) =>
          e.commonName.toLowerCase().includes(q) ||
          e.latinName.toLowerCase().includes(q),
      )
    : CATALOG_SORTED

  function pick(entry: CatalogEntry) {
    onSelect(entry)
  }

  const isRu = i18n.language.startsWith('ru')

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={t('catalogBrowserTitle')}
    >
      {/* ── Header ── */}
      <div className={styles.header}>
        <h2 className={styles.title}>{t('catalogBrowserTitle')}</h2>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label={t('catalogClose')}
        >
          ✕
        </button>
      </div>

      {/* ── Search ── */}
      <div className={styles.searchWrap}>
        <input
          ref={searchRef}
          className={styles.searchInput}
          type="search"
          placeholder={t('catalogSearchPlaceholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setFlippedId(null) }}
        />
      </div>

      {/* ── Scrollable grid ── */}
      <div className={styles.scrollArea}>
        {filtered.length === 0 && (
          <p className={styles.noResults}>{t('catalogNoResults')}</p>
        )}

        <div className={styles.grid}>
          {filtered.map((entry) => {
            const isFlipped = flippedId === entry.id
            const thumb = thumbColors(entry)
            const perks = entry.perks ?? []
            const frontPerks = perks.slice(0, 4)
            const description = isRu ? entry.description_ru : entry.description_en

            return (
              <div key={entry.id} className={styles.card}>
                {/* ── Front face ── */}
                {!isFlipped && (
                  <div
                    className={styles.front}
                    role="button"
                    tabIndex={0}
                    aria-label={entry.commonName}
                    onClick={() => pick(entry)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        pick(entry)
                      }
                    }}
                  >
                    {/* Leaf illustration */}
                    <div className={styles.thumb} style={thumb}>
                      <LeafIcon className={styles.thumbIcon} />
                    </div>

                    {/* Name + perks */}
                    <div className={styles.cardBody}>
                      <span className={styles.cardName}>{entry.commonName}</span>
                      {frontPerks.length > 0 && (
                        <div className={styles.perkRow} onClick={(e) => e.stopPropagation()}>
                          {frontPerks.map((key) => {
                            const meta = PERK_CONFIG[key]
                            if (!meta) return null
                            return (
                              <span
                                key={key}
                                className={`${styles.perkDot} ${styles[`tone_${meta.tone}`]}`}
                                title={t(meta.labelKey)}
                                aria-label={t(meta.labelKey)}
                              >
                                <meta.Icon className={styles.perkDotIcon} />
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Info button — stops propagation so it doesn't select */}
                    <button
                      className={styles.infoBtn}
                      aria-label={t('catalogInfoLabel')}
                      onClick={(e) => { e.stopPropagation(); setFlippedId(entry.id) }}
                    >
                      ℹ
                    </button>
                  </div>
                )}

                {/* ── Back face ── */}
                {isFlipped && (
                  <div className={styles.back}>
                    <div className={styles.backHeader}>
                      <button
                        className={styles.backCloseBtn}
                        aria-label={t('back')}
                        onClick={() => setFlippedId(null)}
                      >
                        ←
                      </button>
                      <span className={styles.backLatin}>{entry.latinName}</span>
                    </div>

                    <p className={styles.backDesc}>{description}</p>

                    {perks.length > 0 && (
                      <div className={styles.backPerks}>
                        {perks.map((key) => {
                          const meta = PERK_CONFIG[key]
                          if (!meta) return null
                          return (
                            <span
                              key={key}
                              className={`${styles.perkBadge} ${styles[`tone_${meta.tone}`]}`}
                            >
                              <meta.Icon className={styles.perkBadgeIcon} />
                              <span>{t(meta.labelKey)}</span>
                            </span>
                          )
                        })}
                      </div>
                    )}

                    <button
                      className={styles.selectBtn}
                      onClick={() => pick(entry)}
                    >
                      {t('catalogSelectPlant')}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Add manually ── */}
        <div className={styles.manualRow}>
          <button className={styles.manualBtn} onClick={onAddManually}>
            {t('addManually')}
          </button>
        </div>
      </div>
    </div>
  )
}
