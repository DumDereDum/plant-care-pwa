# Plant Care PWA — Design System

## Direction

Bright & playful: cheerful, friendly, energetic. Rounded shapes, a small saturated
palette led by a fresh green, generous spacing. Friendly but not childish or cluttered.
Mobile-first — this is used on a phone.

## Anti-generic rules (do NOT do)

- Fonts: NEVER Inter, Roboto, Arial, or Space Grotesk.
- No purple/blue "AI gradient" hero. Prefer flat color blocks; if any gradient is used it
  must be subtle and on-brand (green family), never purple.
- No generic centered marketing hero, no carousels.
- Don't ship a flat gray card grid. Cards have rounded corners, a plant avatar, and a
  colored status accent — but keep ONE clear visual anchor per screen (the "today"
  summary), not five competing focal points.
- Commit to the palette below; do not introduce new random colors.

## Typography

- Display / headings / big numbers: "Comfortaa" (Google Fonts), weights 500–600.
  (Replaces the originally specced "Fredoka", which has no Cyrillic glyphs — the UI is
  bilingual EN/RU, so the display font must cover Cyrillic. Fonts are self-hosted/bundled.)
- Body / UI / labels: "Nunito Sans" (Google Fonts), weight 400 (body), 600 (emphasis).
- At most these two typefaces. Sentence case everywhere; never ALL CAPS.
- Scale (px): display 28, h1 24, h2 20, h3 18, body 16, small 14, tiny 12. Body line-height ~1.5.

## Color tokens

Brand green (primary — brand, healthy/positive, primary actions):
- green-50 `#E7F8EC`, green-100 `#C2EDCE`, green-500 `#2FB55F`, green-600 `#259A4E`,
  green-700 `#1C7A3E`, green-900 `#0E3D20`

Coral (attention / urgency — "water today", overdue, emphasis):
- coral-50 `#FFEDE7`, coral-100 `#FFD2C4`, coral-500 `#FF7A59`, coral-600 `#E85F3E`,
  coral-900 `#5C2113`

Amber (sunny accent, used sparingly — sun, streaks, small highlights):
- amber-50 `#FFF4DC`, amber-100 `#FFE2A8`, amber-500 `#FFB627`, amber-600 `#E89A0E`,
  amber-900 `#5C3D02`

Neutrals:
- app background (warm) `#FFF9F2`
- surface / cards `#FFFFFF`
- ink / primary text (warm near-black) `#2B2420`
- muted / secondary text `#7A716B`
- hairline / borders `#F0E7DE`

Usage:
- Green is dominant. Coral for urgency and emphasis only. Amber sparing.
- Text on a light colored fill (the 50/100 shades) uses the 900 shade of that same family.
- Filled buttons: use the 600 shade with white text for adequate contrast; reserve 500 for
  accents and light fills.

## Shape & elevation

- Radius: sm 10, md 16, lg 22 (cards), pill 999 (buttons, status pills). Generous, rounded.
- Elevation: ONE soft shadow level for raised cards, e.g. `0 6px 20px rgba(43,36,32,0.08)`.
  No neon glow, no hard black shadows.
- Spacing: 8px scale (4, 8, 12, 16, 24, 32). Comfortable, not cramped.

## Components

- Card: white surface, radius-lg, the soft shadow, padding 16px. A plant card shows a round
  plant avatar (colored tint bg + leaf icon), the name, a colored status pill, and a
  "Watered" action.
- Status pill (rounded-full, small): coral for "water today" / overdue, green for "done",
  amber for "due soon". Always pair the color with text — color is never the only signal.
- Primary button: green-600 fill, white text, pill, min height 48px, press feedback
  (scale ~0.97).
- Today anchor: the home screen's focal element is a friendly, prominent "today" summary
  card (how many plants to water today). This is the single visual anchor of the screen.

## Mobile-first & accessibility

- Tap targets ≥ 44px. Bottom navigation. Respect iOS safe-area insets
  (`env(safe-area-inset-*)`).
- Design empty, loading, and error states, and keep them on-brand and friendly
  (an encouraging empty state, not a blank screen).
- Maintain readable contrast; never rely on color alone to convey meaning.

## Motion

- Micro-interactions only, where they add meaning: button press feedback, a small
  celebratory bounce / checkmark when a plant is marked watered, gentle 150–200ms transitions.
- Respect `prefers-reduced-motion` — disable non-essential animation.
