# Handoff — Plant Care PWA

Resume file for a fresh session. Read this together with `CLAUDE.md`, `DESIGN.md`, and `PROJECT_CONTEXT.md`.

## Status (2026-06-26, end of session)

- **Working tree: has uncommitted changes.** Commit before continuing.
- MVP done. Post-MVP Phase 14 is now complete.

## How to resume

1. Read `CLAUDE.md` (hard rules), this file, and `PROJECT_CONTEXT.md`.
2. `npm run build && npm run lint` — must be clean.
3. Commit any outstanding changes.
4. Pick a task from **Next steps** below.

## Done this session (all build + lint clean)

| Task | What shipped |
|---|---|
| Other care events (fertilize / repot) | `CareLog.type` expanded to `'water' \| 'fertilize' \| 'repot'`. `recordFertilize` / `recordRepot` functions. `FertilizeIcon` + `RepotIcon` in icons. `CareActionButton` component. PlantDetail history shows per-type icons + label. Calendar shows fertilized/repotted sections in day panel with amber `dotCared` dot. Achievements/score filter to water-only. `dataTransfer.ts` `ExportedCareLog.type` expanded. |
| Fertilize interval reminders | DB v5: `Plant.fertilizeIntervalDays?` + `Plant.lastFertilizedAt?`. `recordFertilize` is now a transaction that updates `lastFertilizedAt`. New helpers `nextFertilizeDate()` + `daysUntilFertilize()` in `watering.ts`. Add/edit forms: fertilize toggle + 7–90 day slider. PlantDetail front face shows fertilize meta. TodayScreen: "Needs fertilizing" compact section. Calendar: fertilize due projections + "Due for fertilizing" in panel. |
| Keyboard auto-open bug (mobile) | Removed `autoFocus` from `AddPlantForm` name field and `PlantDetail` edit form name field. |
| Care guide catalog | `src/catalog.ts`: 12 species (Monstera, Rubber Plant, Pothos, Snake Plant, Peace Lily, Spider Plant, ZZ Plant, Aloe Vera, Jade Plant, Fiddle-leaf Fig, Calathea, Dracaena) with full care data + `catalogEntryToGuideData()` helper. AddPlantForm: species `<select>` prefills name/interval/fertilize and creates a CareGuide (`source: 'catalog'`) on submit. PlantDetail edit form: "Fill guide from catalog" picker creates/replaces CareGuide on save. |

## DB version history

| Dexie ver | IndexedDB ver | Change |
|---|---|---|
| 1 | 10 | initial `plants` table |
| 2 | 20 | `careGuides` table, `Plant.careGuideId` |
| 3 | 30 | `careLogs` table |
| 4 | 40 | `Plant.photo` Blob → ArrayBuffer migration |
| 5 | 50 | `Plant.fertilizeIntervalDays?`, `Plant.lastFertilizedAt?`; adds `lastFertilizedAt` index |

**Current DB version: 5** (IndexedDB shows 50).

## Key technical facts (non-obvious)

### Data model
- **`Plant.photo`** is `ArrayBuffer | undefined` — never Blob. Display: `new Blob([photo], { type: imageMimeType(photo) })`. Reason: Blobs corrupt on iOS/Android when Dexie re-serializes via structured clone.
- **`Plant.fertilizeIntervalDays`** optional — undefined means "not tracking fertilize". Zero is not a valid value.
- **`Plant.lastFertilizedAt`** updated by `recordFertilize()` inside a transaction (same pattern as `recordWatering` / `lastWateredAt`).
- **`CareLog.type`** is `'water' | 'fertilize' | 'repot'`. Achievements and score only count `type === 'water'` entries (filtered in `computeAchievements` and `TodayScreen.globalStats`).
- **`CareGuide.source`** is `'user' | 'catalog'`. Catalog-seeded guides get `'catalog'`; user can edit them freely afterwards.

### Components
- **`WateredButton`** requires `lastWateredAt: Date | null` prop (all 3 callers: PlantCard, PlantDetail, CalendarScreen).
- **`CareActionButton`** for fertilize/repot. Props: `plantId`, `type: 'fertilize'|'repot'`, `lastDoneAt: Date | null`, `onRefresh`. In PlantDetail, `lastDoneAt` comes from `plant.lastFertilizedAt ?? null` (not from logs). In CalendarScreen, there's no CareActionButton for fertilize/repot (log-only display).
- **`PlantDetail`** loads ALL careLogs into `allLogs`; `history` = `allLogs.slice(0,5)`; `achievements` derived from water-only logs via `computeAchievements`.

### Routing / navigation
- `tab` + `detailId` state in `App.tsx`. No router.
- Preview dev server: **port 5180**.

### Catalog
- `src/catalog.ts` exports `CATALOG`, `CATALOG_SORTED` (alpha by common name), `CatalogEntry` type, `catalogEntryToGuideData()`.
- Catalog is 100% bundled — no network call, works offline.
- Structured for AI expansion: each entry has a stable `id` slug and mirrors CareGuide fields.
- When user picks a catalog entry in AddPlantForm: name pre-filled (if empty), watering + fertilize intervals set from catalog, CareGuide created on submit.
- When user picks in PlantDetail edit: intervals updated, existing CareGuide overwritten or new one created on save.

### watering.ts exports
`nextWateringDate`, `daysUntilWatering`, `recordWatering`, `recordFertilize`, `recordRepot`, `nextFertilizeDate`, `daysUntilFertilize`

### i18n
All user-facing strings go through translation keys. Every new key must be added to both `en.json` and `ru.json` with correct Russian plural forms (`_one`, `_few`, `_many`, `_other`). Never hardcode display text.

### Styling
CSS Modules + CSS custom properties from `DESIGN.md`. No Tailwind. Fonts: Comfortaa (display) + Nunito Sans (body), self-hosted woff2 in `src/assets/fonts/`.

### Export/import
`src/dataTransfer.ts`. Schema version stays at 3 (JSON format unchanged despite DB v4/v5 internal changes). `ExportedCareLog.type` expanded to match `CareLog.type`.

## Dev workflow
- `npm run dev` / `npm run build` / `npm run lint`
- Build + lint must be clean before and after every task.
- DB name `plant-care-db` — never rename.
- Schema changes only via `db.version(n).stores().upgrade()` with incremented n.

## Next steps (suggested)

- **Catalog expansion** — add more species, or an AI-assisted lookup where user types a name and Claude fills the CareGuide.
- **Plant notes** — extend `CareLog` with `note?: string`; show in history.
- **Multiple photos** — a small gallery per plant.
- **Push-free badge reminder** — Badging API to show a badge count on the PWA icon when plants need attention.
- **Share / duplicate plant** — copy a plant's settings.
