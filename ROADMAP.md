# Plant Care PWA — Feature Roadmap

Post-MVP roadmap: redesign + plant detail / care guide + calendar. The MVP
(phases 1–8, see `BUILD_PLAN.md`) is functionally done; this file tracks the next
batch of work.

> This is the **living progress file**. The agent updates it: when a task is
> finished, tick its checkbox, append `— done YYYY-MM-DD, <one-line note>`, and
> update the **Data model** section if the schema changed.

## How to use this file

1. Copy one task's **Task** text into the chat. One task per turn — never merge two.
2. Let it run; review the diff (plan mode for multi-file changes).
3. Run the task's **Verify** step. Green → commit with a small message → tick the box.
4. Every task implicitly ends with: *list changed files, how to verify, risks*
   (the `CLAUDE.md` footer convention — no need to repeat it each time).

## Decisions locked (2026-06-25)

- **Styling:** plain CSS + CSS custom properties mapped from `DESIGN.md`. **No Tailwind**
  (minimal-dependencies rule wins; `PROJECT_CONTEXT.md` says Tailwind — that line is now
  superseded and should be corrected in T9.1).
- **Fonts:** Fredoka (display) + Nunito Sans (UI). **Self-hosted/bundled** woff2 — the app
  must work offline, so no Google Fonts CDN at runtime.
- **Care info = separate table** (`careGuides`) inside the same `plant-care-db`. It holds
  *recommendations*; the plant links to a guide but keeps its own actual watering interval,
  so the user can follow the recommendation or not.
- **Game-format stats:** light ☀️, water 💧, humidity, temperature range, difficulty.
- **Passive perks (game-style badges):** an extensible `perks` list on the care guide,
  shown as small badges — both negative (toxic to cats/dogs, unsafe for children, allergenic)
  and positive (air-purifying, oxygen boost, collects dust). Each known perk gets an icon +
  i18n label + tone (good/bad/neutral); e.g. crossed-out cat = toxic for cats, cat-in-heart =
  pet-safe. The list is open so the AI can fill more perks later.
- **Care guide catalog:** designed into the architecture now (guides are standalone,
  reusable, can act as templates), but the actual bundled/AI-generated catalog content lands
  later (Phase 14). For now guides are hand-filled per plant.
- **Card flip:** triggered by a small **flip button**, not tapping the whole card (avoids
  conflicts with the card's own buttons).
- **Calendar:** month grid + upcoming watering dates, **plus** persisted watering history
  (`careLog` table). Watering-only for now; other event types (fertilize/repot) are designed
  into the schema but shipped later (Phase 14). Achievements/points = Phase 13.
- **DB rules (unchanged):** never rename `plant-care-db`; never create a second IndexedDB;
  schema changes only via `db.version(n).stores(...).upgrade(...)` with an incremented
  version; never break export/import — update it in the same task as any schema change.

## Data model (target)

Current (v1): `Plant { id, name, wateringIntervalDays, lastWateredAt, photo? }`

| Version | Change | Status |
|---|---|---|
| v1 | `plants` | ✅ shipped |
| v2 | add `careGuides` table + `Plant.careGuideId?` | ⬜ T11.1 |
| v3 | add `careLog` table (watering history) | ⬜ T12.1 |

```ts
// v2 — recommendations, separate from the plant's actual schedule.
// Standalone & reusable: a guide is a template that can later be seeded from a
// bundled / AI-generated catalog, not hard-bound to one plant.
interface CareGuide {
  id: number
  species?: string                 // common/Latin name, free text for now
  light?: 1 | 2 | 3 | 4 | 5        // suns
  water?: 1 | 2 | 3 | 4 | 5        // drops (thirstiness)
  humidity?: 1 | 2 | 3 | 4 | 5
  difficulty?: 1 | 2 | 3 | 4 | 5
  tempMin?: number                 // °C comfort range
  tempMax?: number
  perks?: PerkKey[]                // passive game-style badges (see below)
  recommendedWateringIntervalDays?: number  // the recommendation (may differ from plant's)
  description?: string             // about the plant
  careTips?: string                // how to care
  source?: 'user' | 'catalog'      // architectural hook for the future catalog (Phase 14)
}

// Open, extensible set — start small, AI/catalog adds more later. Each key maps to
// an icon + i18n label + tone (good | bad | neutral) in the UI layer.
type PerkKey =
  | 'toxicCats' | 'toxicDogs' | 'unsafeChildren' | 'allergenic'   // negative
  | 'airPurifying' | 'oxygenBoost' | 'dustCollecting'             // positive
// (string-typed so unknown keys from a future catalog don't break old builds)

// Plant gains: careGuideId?: number   (optional link; null/undefined = no guide yet)

// v3 — history of care events
interface CareLog {
  id: number
  plantId: number
  type: 'water'                    // schema-extensible later: 'fertilize' | 'repot' (Phase 14)
  date: Date
}
```

---

## Phase 9 — Design foundation

- [x] **T9.1 — Design tokens, fonts, reset** — done 2026-06-25: DESIGN.md tokens as CSS
  vars (+ derived dark palette), self-hosted Comfortaa + Nunito Sans (latin+cyrillic woff2,
  precached for offline), base reset + mobile app shell; removed dead template CSS.
  Note: display font is **Comfortaa**, not Fredoka (Fredoka has no Cyrillic) — DESIGN.md updated.
  Task: Lay the styling foundation from `DESIGN.md`, no Tailwind. (1) Add CSS custom
  properties for all `DESIGN.md` color tokens, radius, spacing scale, and the single soft
  shadow; support the dark palette via `prefers-color-scheme`. (2) Self-host Fredoka and
  Nunito Sans as bundled woff2 (must work offline; no CDN) and wire them to display/body.
  (3) Replace the leftover Vite template CSS in `App.css`/`index.css` (hero, counter, etc.)
  with a clean base reset and app shell. (4) Update the styling line in `PROJECT_CONTEXT.md`
  to "plain CSS + CSS variables, no Tailwind".
  Verify: app renders with new fonts/colors; build + lint clean; offline still works after
  rebuild (fonts load with no network).

- [x] **T9.2 — Reusable UI primitives** — done 2026-06-25: `src/ui/` with Card, Button
  (primary/secondary, 48px, press feedback), StatusPill (green/coral/amber), StatBar (1–5
  suns/drops, a11y label via i18n `ratingValue`), CSS Modules. Card+StatusPill+Button wired
  live into PlantCard; StatBar built & lint-clean, wired for real in T11.3 (needs careGuide data).
  Task: Add small reusable components per `DESIGN.md`: `Card`, `Button` (primary/secondary,
  ≥44px tap target, press feedback), `StatusPill` (coral/green/amber, color + text), and a
  `StatBar` for 1–5 icon ratings (suns/drops). All text via i18n. No screen rewrites yet —
  just the primitives + a tiny usage in one existing place to prove them.
  Verify: primitives render; tap targets ≥44px; build + lint clean.

## Phase 10 — Redesign existing screens

- [x] **T10.1 — Redesign "My Plants" list** — done 2026-06-25: PlantCard redesigned
  (round avatar = photo or tinted leaf, name, status pill, Watered) as a vertical card stack;
  tap opens a placeholder PlantDetail screen (hosts the photo add/change + watered moved off
  the card, so nothing lost). Verified on mobile width via screenshots. Detail becomes the full
  view in T11.2.
  Task: Restyle the plant list as a card grid/list per `DESIGN.md`: round plant avatar
  (photo or tinted leaf icon), name, status pill, "Watered" action. Tap a card opens the
  detail screen (placeholder route/handler is fine until T11.2). Keep all strings in i18n.
  Verify: list looks per design on a phone width; cards are tappable; nothing lost from the
  old card (interval, next date, watered).

- [x] **T10.2 — Redesign "Today" screen anchor** — done 2026-06-25: prominent summary
  card as the single anchor (coral "N plants to water today" with big count / green "all
  watered" when none due), calm overdue/today/soon buckets below using the redesigned cards,
  friendly leaf empty state. All three states verified on mobile via screenshots.
  Task: Make the Today screen's focal element a friendly summary card ("N plants to water
  today"), the single visual anchor, with the overdue/today/soon buckets below using the new
  card + pill primitives. Encouraging empty state.
  Verify: summary card is the clear anchor; buckets correct; empty state friendly.

- [x] **T10.3 — Bottom navigation + app shell** — done 2026-06-25: fixed bottom nav
  (Today / Plants / Calendar / Help) with icons + labels, active state, safe-area-inset-bottom
  padding; top nav replaced by a header (title + language switch); content padding clears the
  nav. Calendar tab → placeholder CalendarScreen (real grid in T12.2). Verified on mobile:
  tabs switch, tap targets 56×94px (≥44).
  Task: Replace the top button nav with a mobile bottom navigation (Today / Plants /
  Calendar / Help), respecting iOS safe-area insets (`env(safe-area-inset-*)`). Wire the
  Calendar tab to a placeholder until Phase 12.
  Verify: bottom nav works, no overlap with the iOS home indicator, tap targets ≥44px.

## Phase 11 — Plant detail + care guide (flip card)

- [ ] **T11.1 — Migration v2: careGuides table (schema change)**
  Task: Add the `careGuides` table and `Plant.careGuideId?` via a Dexie v2 migration
  (`version(2).stores(...).upgrade(...)`), in the SAME `plant-care-db` (do not create a
  second database, do not rename). Add the `CareGuide` interface per the Data model section,
  including the open `perks` list and the `source` field. Keep guides **standalone/reusable**
  (a guide is not hard-bound to one plant) so a catalog can seed them later. No destructive
  changes to existing plants. Update export/import so guides are included and old backups (no
  guides) still import. Bump the export schema version.
  Verify: existing plants survive the upgrade (load old DB → still there); export then import
  round-trips plants + guides; build + lint clean. **This is a schema change — call out the
  migration in the summary.**

- [ ] **T11.2 — Plant detail screen (front)**
  Task: Add a plant detail screen (front face): large photo, name, watering status + next
  date, "Watered" button, change-photo, and edit name/interval. Reached by tapping a card in
  the list. All strings via i18n.
  Verify: open detail from list; watered/photo/edit all work and persist.

- [ ] **T11.3 — Flip to care guide (game format)**
  Task: Add a **flip button** on the detail card (not whole-card tap) that flips to the back
  showing the linked care guide in game format: suns 1–5 (light), drops 1–5 (water), humidity,
  temperature range, difficulty, plus a row of **perk badges** from `perks` (each with icon +
  i18n label + good/bad/neutral tone — e.g. crossed-out cat = toxic for cats, cat-in-heart =
  pet-safe, leaf = air-purifying), plus description/tips. Read-only here. If no guide is linked
  yet, show a friendly "not filled in yet" placeholder with a "Fill in" CTA. Respect
  `prefers-reduced-motion` (no flip animation when reduced).
  Verify: flip button works both ways; stats + perk badges render from a guide; placeholder
  shows when empty.

- [ ] **T11.4 — Edit care guide form**
  Task: Add a form to create/edit the care guide for a plant (fills the placeholder): the 1–5
  steppers for light/water/humidity/difficulty, temperature min/max, a **perk picker**
  (toggle the known `PerkKey`s — toxic cats/dogs, unsafe children, allergenic, air-purifying,
  oxygen boost, dust-collecting), recommended interval, description, tips. Creating a guide
  links it via `careGuideId`. Optional "apply recommended interval to this plant" button.
  i18n throughout.
  Verify: fill a guide → flip side shows it incl. perks; reload persists; "apply" updates the
  plant's interval.

## Phase 12 — Calendar + history

- [ ] **T12.1 — Migration v3: careLog table (schema change)**
  Task: Add a `careLog` table via a Dexie v3 migration for watering history (`CareLog` per the
  Data model section). On "Watered", in addition to setting `lastWateredAt`, append a careLog
  entry (`type: 'water'`, date = now). Include careLog in export/import; bump export schema
  version; keep old backups importable. No destructive changes.
  Verify: water a plant → a log row appears; existing data intact; export/import round-trips
  history. **Schema change — call out the migration.**

- [ ] **T12.2 — Calendar month grid**
  Task: Build the Calendar screen: a month grid with prev/next navigation. Mark days with
  upcoming watering due (from `nextWateringDate` projections) and overdue, plus past watering
  events from `careLog`. Tap a day → list of plants due/watered that day, with a quick
  "Watered" action. Mobile-first, i18n, localized month/day names via `Intl`.
  Verify: due dates highlighted correctly; tapping a day shows the right plants; month nav
  works; RU/EN month names correct.

- [ ] **T12.3 — Watering history on plant detail**
  Task: Show a plant's recent watering history (from `careLog`) on the detail screen — a short
  list/timeline of past waterings with localized dates.
  Verify: history matches logged events; updates after a new "Watered".

## Phase 13 — Polish & gamification

- [ ] **T13.1 — Micro-interactions**
  Task: Add the small motions from `DESIGN.md`: a celebratory bounce/checkmark on "Watered",
  150–200ms transitions, and the flip animation. All gated behind `prefers-reduced-motion`.
  Verify: animations feel subtle; reduced-motion disables them.

- [ ] **T13.2 — Empty / loading / error states**
  Task: Give every screen on-brand empty, loading, and error states (encouraging copy, not
  blank screens). i18n.
  Verify: each screen shows a friendly state when empty/loading/failing.

- [ ] **T13.3 — Real app icons**
  Task: Replace the solid-green placeholder PWA icons with real artwork; add
  `<link rel="apple-touch-icon">` to `index.html` (iOS ignores the manifest icons array).
  Provide 192/512 + maskable.
  Verify: home-screen icon looks right on iOS and Android after reinstall.

- [ ] **T13.4 — Achievements / care points (bigger)**
  Task: Award points/medals for good care, computed from `careLog`, guided by gamification
  principles (streaks of not-missed waterings, milestones, progress toward the next badge —
  not just raw counts). Read-only badges on detail/today. No backend — all derived locally.
  Design the rule set before coding.
  Verify: badges appear from real history; streaks/milestones compute correctly; nothing
  fabricated.

- [ ] **T13.5 — Locale & dead-code cleanup**
  Task: Remove unused i18n keys (e.g. `lastWatered` no longer rendered) and any leftover
  template assets (`src/assets/hero.png`, react/vite svgs) once unused.
  Verify: build + lint clean; no missing-key warnings; nothing visually lost.

## Phase 14 — Extended care & catalog (after the minimal product)

Deferred on purpose: the goal first is a minimal working product. These build on hooks
already designed into the schema (`careLog.type`, `CareGuide.source`, standalone guides).

- [ ] **T14.1 — Other care events (fertilize / repot)**
  Task: Extend care logging beyond watering using the existing `careLog.type` field
  (`'fertilize' | 'repot'`, …): log them, show them on the plant detail history, and surface
  them in the calendar alongside watering. Add optional recommended fertilize/repot intervals
  to the care guide if useful. i18n throughout. No destructive schema change (the field
  already exists).
  Verify: logging a fertilize/repot event shows on detail + calendar; watering still works.

- [ ] **T14.2 — Care guide catalog (bundled + AI-fillable)**
  Task: Add a small bundled catalog of common species (Monstera, Ficus, Pothos, …) with
  prefilled care guides, selectable when adding/editing a plant (copies a catalog guide into a
  user guide, `source: 'catalog'`). Keep it 100% local (no backend); structure the catalog
  data so it can be AI-generated/expanded later.
  Verify: pick a species when adding a plant → its care guide is prefilled; user can still
  edit it; offline works.

---

## Backlog / ideas (not scheduled yet)

- **Plant graveyard / cemetery** 🪦 — instead of hard-deleting a plant, archive it with a
  "deceased" status (architectural hook: add a `status`/`archivedAt` field to `Plant` rather
  than deleting rows, so no care data is ever lost). A separate memorial view, and the kept
  history feeds future watering/care insights. Far-off — but the soft-delete hook is cheap to
  add whenever a delete-plant feature is built.
- Reminders/notifications — **blocked by constraints** (no push in MVP; revisit only as
  local in-app reminders, never server push).
- Sorting/filtering the plant list (by next watering, name, room).
- Rooms/locations grouping.
- Themes beyond light/dark.

## Resolved decisions (from the 2026-06-25 Q&A)

- Catalog: **lay into architecture now, fill via AI later** → guides are standalone/reusable
  with a `source` field; the catalog itself is T14.2.
- Toxicity → **passive perks system** with cats/dogs/children + positive perks
  (air-purifying, oxygen, dust) — see `perks` in the Data model.
- Calendar other events: **schema-ready now, feature later** → T14.1.
- Flip: **flip button** (not whole-card tap) → T11.3.
- Achievements: **gamification-driven** (streaks/milestones, not raw counts) → T13.4.

## Ideas parking lot (add anytime)

- _(drop new ideas here; promote them into a phase when ready)_
