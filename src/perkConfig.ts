import type { FC } from 'react'
import {
  ChildIcon,
  DustIcon,
  FlowerIcon,
  PawIcon,
  SparkleIcon,
  WindIcon,
} from './ui/icons'

export type PerkTone = 'good' | 'bad' | 'neutral'

export interface PerkMeta {
  Icon: FC<{ className?: string }>
  tone: PerkTone
  labelKey: string
}

/** Config for all known perks including display-only derived ones (safeCats/safeDogs). */
export const PERK_CONFIG: Record<string, PerkMeta> = {
  toxicCats:      { Icon: PawIcon,     tone: 'bad',     labelKey: 'perkToxicCats' },
  toxicDogs:      { Icon: PawIcon,     tone: 'bad',     labelKey: 'perkToxicDogs' },
  safeCats:       { Icon: PawIcon,     tone: 'good',    labelKey: 'perkSafeCats' },
  safeDogs:       { Icon: PawIcon,     tone: 'good',    labelKey: 'perkSafeDogs' },
  unsafeChildren: { Icon: ChildIcon,   tone: 'bad',     labelKey: 'perkUnsafeChildren' },
  allergenic:     { Icon: FlowerIcon,  tone: 'bad',     labelKey: 'perkAllergenic' },
  airPurifying:   { Icon: WindIcon,    tone: 'good',    labelKey: 'perkAirPurifying' },
  oxygenBoost:    { Icon: SparkleIcon, tone: 'good',    labelKey: 'perkOxygenBoost' },
  dustCollecting: { Icon: DustIcon,    tone: 'neutral', labelKey: 'perkDustCollecting' },
}
