# Plant Care PWA — Roadmap

All work through Phase 14 is complete (MVP + redesign + care events + fertilize
reminders + basic 12-species catalog). This file tracks what comes next.

> **Living progress file.** When a task finishes: tick the checkbox, append
> `— done YYYY-MM-DD, <one-line note>`, and update any data-model sections if
> the schema changed.

## How to use this file

1. Copy one task's **Task** text into the chat. One task per turn — never merge two.
2. Let it run; use plan mode (Shift+Tab) for multi-file changes.
3. Run the task's **Verify** step. Green → commit → tick the box.
4. Every task ends with: *files changed, how to verify, risks* (CLAUDE.md rule — no
   need to repeat it each time).

---

## Current DB state

**Version 5** (IndexedDB shows 50).

| Dexie ver | IndexedDB ver | Change |
|---|---|---|
| 1 | 10 | `plants` |
| 2 | 20 | `careGuides`, `Plant.careGuideId` |
| 3 | 30 | `careLogs` |
| 4 | 40 | `Plant.photo` Blob → ArrayBuffer |
| 5 | 50 | `Plant.fertilizeIntervalDays?`, `Plant.lastFertilizedAt?` |

---

## Phase 15 — Advanced plant catalog (main focus)

The goal: when the user taps "Add Plant", a full browseable catalog opens instead of
the current small species dropdown. Each card shows a plant illustration, its name, and
perk badges. Tapping flips the card to a back face with a short description, care tips,
and a Wikipedia link. Selecting from the catalog pre-fills all fields and creates a care
guide automatically.

Data source: Wikipedia plant articles — parsed offline (a local Node script),
summarized to 2–3 sentences, and bundled into `catalog.ts` as plain text. No runtime
network call; everything works offline.

### T15.1 — Enrich catalog entries with description + Wikipedia link — done 2026-06-26

Extend the `CatalogEntry` type in `src/catalog.ts` with:

```ts
description: string   // 2–3 sentence summary (en + ru)
wikiUrl: string       // https://en.wikipedia.org/wiki/<Article>
```

For each of the 12 existing species, write a hand-curated 2–3 sentence care
description in both English and Russian (bilingual catalog; store as
`description_en` / `description_ru`, or use a nested `{ en, ru }` object —
pick whichever keeps `catalog.ts` clean). Add the corresponding Wikipedia URL.

Keep the file 100% static (no fetch at runtime). All 12 entries must have
non-empty `description` and `wikiUrl` before this task is considered done.

**Task:** Extend `CatalogEntry` with `description_en`, `description_ru`, and `wikiUrl`.
Fill all 12 existing entries. Update `catalogEntryToGuideData()` to include
`description` (pick the locale at call time based on `i18n.language`). Update the
TypeScript types; build + lint must pass.

**Verify:** `npx tsc --noEmit` clean. Open AddPlantForm, pick a species from the
dropdown — no visible change yet, but `console.log` the created guide and confirm
`description` is a non-empty string.

---

### T15.2 — Catalog browser screen (grid of plant cards) — done 2026-06-26

Replace the species `<select>` in `AddPlantForm` with a "Browse catalog" button that
opens a full-screen catalog browser (or large bottom sheet) overlaid on the Add form.

Layout:
- Search bar at the top (filters by name, case-insensitive, debounced).
- Scrollable grid of cards (2 columns on mobile). Each card:
  - Illustration placeholder (a tinted leaf SVG in the plant's dominant color, or a
    real photo — see T15.3). Size: ~120×140 px.
  - Common name (bold, Comfortaa).
  - A row of up to 4 perk badge icons (e.g. toxic-cat, air-purifying).
- Tapping a card **selects** it and closes the browser, pre-filling the Add form.
- A small flip/info button (ℹ︎) on each card opens the card's back face (see T15.3).
- "Add manually" link at the bottom for plants not in the catalog.
- Full i18n (EN + RU).

This task is UI-only; connect it to the real catalog data. No flip animation yet
(T15.3), just hide/show for the back face.

**Task:** Build `CatalogBrowser` component (new file `src/CatalogBrowser.tsx` +
`src/CatalogBrowser.module.css`). Wire the "Browse catalog" button in `AddPlantForm`.
Remove the old `<select>` for species (or hide it behind the browser). All strings via
i18n. Build + lint clean.

**Verify:** Open "Add Plant" → "Browse catalog" opens a grid; search filters cards;
tapping a card closes the browser and pre-fills name + watering interval in the form.
Try on a 375 px-wide viewport (Chrome DevTools). EN/RU switch works in the browser.

---

### T15.3 — Card flip: back face with description + Wikipedia link

Add a flip animation to catalog cards so the ℹ︎ button reveals the back face.

Back face content:
- Plant name (smaller, italic).
- Description (2–3 sentences from `description_en` / `description_ru` based on current
  locale).
- Key stats summary: light ☀, water 💧, difficulty.
- Perk badges (same as front).
- "Open on Wikipedia →" link (opens in new tab, `rel="noopener noreferrer"`).
- A "Select this plant" button.

Animation: CSS 3D card flip on the Y-axis, 300 ms. Gate behind
`prefers-reduced-motion` (instant swap, no animation).

**Task:** Add a CSS flip animation to `CatalogBrowser` cards. Implement the back face
per the spec above. The ℹ︎ button toggles front↔back; tapping anywhere on the back face
**except** the Wikipedia link selects the plant. `prefers-reduced-motion` skips the
animation. i18n for all back-face strings and the Wikipedia button label.

**Verify:** ℹ︎ button flips the card; back face shows description + Wikipedia link;
"Select this plant" closes the browser and pre-fills the form; link opens Wikipedia in
a new tab; reduced-motion gives instant swap; EN↔RU switches description language live.

---

### T15.4 — Expand catalog to 40+ species

Extend `src/catalog.ts` from 12 to ~40 species. Candidate list (add more as needed):

> Monstera deliciosa, Rubber Plant, Pothos (Golden), Snake Plant, Peace Lily, Spider
> Plant, ZZ Plant, Aloe Vera, Jade Plant, Fiddle-leaf Fig, Calathea, Dracaena,
> Philodendron (Heartleaf), Boston Fern, Chinese Evergreen, Bird of Paradise, Cast Iron
> Plant, Croton, Dieffenbachia, English Ivy, Flamingo Flower (Anthurium), Hoya
> (Wax Plant), Orchid (Phalaenopsis), Parlor Palm, Ponytail Palm, Prayer Plant
> (Maranta), Schefflera, String of Pearls, Umbrella Plant (Cyperus), African Violet,
> Begonia, Bromeliad, Christmas Cactus, Clivia, Echeveria (Succulent), Haworthia,
> Peperomia, Pilea (Chinese Money Plant), Tradescantia, Yucca.

Each entry must have: `id`, `commonName`, `latinName`, light/water/humidity/difficulty
(1–5), `tempMin`/`tempMax`, `recommendedWateringIntervalDays`,
`fertilizeIntervalDays?`, `perks[]`, `description_en`, `description_ru`, `wikiUrl`.

Research care data from Wikipedia/trusted sources. Keep descriptions ≤3 sentences.

**Task:** Add ~28 new entries to `CATALOG` in `src/catalog.ts`, following the exact
`CatalogEntry` shape. Re-sort `CATALOG_SORTED` alphabetically. Build + lint clean.

**Verify:** Catalog browser shows 40+ cards; search works on new entries; build clean;
no TypeScript errors.

---

### T15.5 — Catalog illustrations (SVG thumbnails)

Give each catalog card a distinctive visual instead of a generic leaf.

Approach: a small inline SVG "stamp" per genus/family — a simplified silhouette of the
plant in 2–3 colors derived from the design palette. These are decorative; they do not
need to be photorealistic. Size: 80×80 px viewBox, bundled (no external fetch).

Alternatively: a color-coded background tile (gradient or pattern) with the first
letter of the genus, styled per category (succulent = warm sand, tropical = deep
green, etc.). Pick whichever is faster and looks better.

**Task:** Design and implement a visual system for catalog card thumbnails. Create SVG
assets or a CSS-based fallback. Wire them into `CatalogBrowser` cards (front face).
Do not use external image URLs. Build + lint clean.

**Verify:** Every card in the grid has a distinct visual; no broken images; works
offline; build clean.

---

## Phase 16 — Minor UX improvements

These are independent, small tasks. They can be done in any order after Phase 15 or
interleaved if needed.

- [ ] **T16.1 — Plant list search + sort**
  Task: Add a search bar above the plant list (filters by name) and a sort picker
  (by next watering, by name A–Z, by last watered). State is not persisted across
  sessions (session-only). i18n. No new DB fields needed.
  Verify: search filters live; sort changes order; clear search restores all plants.

- [ ] **T16.2 — Plant notes**
  Task: Extend `CareLog` with `note?: string`. Add a "Add note" quick-entry on the
  plant detail screen (one-tap text field, saves a `CareLog` with `type: 'note'`).
  Show notes in the plant history list with a note icon. Include notes in export/import.
  No DB schema version change needed if `CareLog` already has the field — but if not,
  increment the DB version and add a migration. Update export schema version.
  Verify: add a note → appears in history; export → import round-trips the note.

- [ ] **T16.3 — Plant archive (soft delete)**
  Task: Add `Plant.archivedAt?: Date` via a DB v6 migration. "Archive" replaces "delete"
  in the PlantDetail menu (long-press or a kebab menu). Archived plants are hidden from
  all screens by default. A toggle "Show archived" in Settings reveals them with a
  tombstone visual. Include `archivedAt` in export/import; bump export schema version.
  Verify: archive a plant → disappears from list; toggle shows it; watering history is
  preserved; export/import round-trips the field. Schema change — call out the migration.

- [ ] **T16.4 — PWA badge count (Badging API)**
  Task: When the app is in the background and plants are overdue, call
  `navigator.setAppBadge(count)` with the number of overdue plants. Clear the badge
  (`navigator.clearAppBadge()`) when the app is foregrounded and there are none overdue.
  Gate behind feature detection (`'setAppBadge' in navigator`). No backend needed —
  the badge is set from within the PWA's own JS. Update at app launch and when plants
  are watered. i18n not relevant here.
  Verify: add a plant overdue → iOS/Android home screen shows a badge number (requires
  real device or browser with Badging API support); watering it clears the badge.

- [ ] **T16.5 — "Share plant" card**
  Task: Add a "Share" action on PlantDetail that uses the Web Share API
  (`navigator.share`) to share a text card: plant name, species, care stats, and a
  deep link back into the app (hash URL). Gate behind `'share' in navigator`. Fallback:
  copy to clipboard. No images in the share payload (keep it simple). i18n.
  Verify: share opens the native share sheet; text includes name + stats; fallback copies
  to clipboard on desktop.

---

## Backlog / ideas (not scheduled)

- Multiple photos per plant (a small gallery carousel on PlantDetail).
- Rooms / locations grouping (tag each plant with a room; filter list by room).
- Themes beyond light/dark (seasonal palettes).
- Plant graveyard view (a memorial page for archived plants, Phase 16.3 hook).
- AI-assisted plant identification (camera → species name) — **requires a backend or
  third-party API; blocked by the no-backend constraint unless done entirely client-side
  via a bundled/WASM model.**
- Scheduled local notifications via the Notifications API (no push, triggered on
  `visibilitychange` or SW `periodicsync` if available) — complex, deprioritized.
