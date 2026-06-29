# Plant Care PWA — Roadmap

All work through Phase 15.3 is complete. Catalog tab live, 19 species with full bilingual care cards and bundled photos. This file tracks what comes next.

> **Living progress file.** When a task finishes: tick the checkbox, append
> `— done YYYY-MM-DD, <one-line note>`, and update any data-model sections if
> the schema changed.

## How to use this file

1. Copy one task's **Task** text into the chat. One task per turn — never merge two.
2. Let it run; use plan mode (Shift+Tab) for multi-file changes.
3. Run the task's **Verify** step. Green → commit → tick the box.
4. Every task ends with: *files changed, how to verify, risks* (CLAUDE.md rule).

---

## Current DB state

**Version 6** (IndexedDB shows 60).

| Dexie ver | IndexedDB ver | Change |
|---|---|---|
| 1 | 10 | `plants` |
| 2 | 20 | `careGuides`, `Plant.careGuideId` |
| 3 | 30 | `careLogs` |
| 4 | 40 | `Plant.photo` Blob → ArrayBuffer |
| 5 | 50 | `Plant.fertilizeIntervalDays?`, `Plant.lastFertilizedAt?` |
| 6 | 60 | `CareGuide.catalogId` + backfill |

---

## Catalog state (as of 2026-06-28)

**19 species**, all with full bilingual care cards (EN+RU), bundled WebP photos, `PlantCategory` tag.

| Group | Species |
|---|---|
| Decorative (8) | Ficus elastica, Snake Plant, Spider Plant, ZZ Plant, Fiddle-leaf Fig, Calathea, Dracaena, Pothos* |
| Flowering (4) | Peace Lily, Kalanchoe, Saintpaulia, Begonia tuberhybrida |
| Succulents (3) | Aloe Vera, Jade Plant, Haworthia |
| Climbing (2) | Monstera, Pothos* |
| Orchids (1) | Phalaenopsis |
| Edible (2) | Ornamental Pepper, Cherry Tomato |

*Pothos is tagged `climbing`.

---

## Phase 15 — Advanced plant catalog

### ✅ T15.1 — Enrich catalog entries with description + Wikipedia link — done 2026-06-26
### ✅ T15.2 — Catalog browser screen (grid of plant cards) — done 2026-06-26
### ✅ T15.3 — Detail card with care sections, diseases, pests — done 2026-06-27
*Note: implemented as a full-screen detail overlay (slide-in from right), not a card flip. Includes structured care sections (appearance/watering/light/humidity/fertilizer/soil/repotting), propagation and ailment chips that expand inline.*

### ✅ T15.4a — Rich bilingual content for all 12 original species — done 2026-06-28
All 12 original entries now have `care`, `propagation`, `diseases`, `pests` in EN+RU.

### ✅ T15.5 — Catalog photos — done 2026-06-28
All 19 species have bundled WebP photos (`src/assets/catalog/<slug>.webp`), loaded via `import.meta.glob`, precached by service worker. Source: Wikimedia Commons (see `CREDITS.md`).

### ✅ Catalog as separate tab — done 2026-06-28
Bottom nav is now 5 tabs: Today / Calendar / My Plants / Catalog / Help. `CatalogBrowser` works in standalone mode (no modal, no keyboard autofocus).

### ✅ Filter chips + sort + group by — done 2026-06-28
Horizontal scrolling filter chips (All / Pet-safe / Air-purifying / Low light / Easy care / Rare watering), sort select (A→Z / Difficulty / Watering), group by (None / By category). `PlantCategory` type with 12 categories added to `CatalogEntry`.

### ✅ 7 new species added — done 2026-06-28
Kalanchoe, Haworthia, Saintpaulia (African Violet), Phalaenopsis (Moth Orchid), Begonia tuberhybrida, Ornamental Pepper, Cherry Tomato. Total: 19 species.

---

### T15.4b — Expand catalog to 40+ species

Target: ~40 species total (19 now, need ~21 more). Priority candidates:

**Tropical / decorative:**
Philodendron (Heartleaf), Chinese Evergreen (Aglaonema), Dieffenbachia, Croton (Codiaeum), Schefflera, Bird of Paradise (Strelitzia), Anthurium (Flamingo Flower), Hoya (Wax Plant), Tradescantia, Peperomia, Pilea (Chinese Money Plant)

**Palms / large:**
Parlor Palm (Chamaedorea), Ponytail Palm (Beaucarnea), Yucca

**Succulents / cacti:**
Echeveria, String of Pearls (Senecio rowleyanus), Christmas Cactus (Schlumbergera)

**Ferns / other:**
Boston Fern (Nephrolepis exaltata), Prayer Plant (Maranta), Cast Iron Plant (Aspidistra)

**Task:** For each new species add a full `CatalogEntry` (all fields including `care`, `propagation`, `diseases`, `pests`, `category`) plus a bundled WebP photo in `src/assets/catalog/`. Update `CREDITS.md`. Build + lint clean.

**Verify:** Catalog browser shows 40+ cards; all photos load; search and filters work on new entries; group by category is correctly tagged; TypeScript clean.

---

## Phase 16 — UX improvements

- [ ] **T16.1 — Plant list search + sort**
  Task: Add a search bar above the plant list (filters by name) and a sort picker (by next watering, by name A–Z, by last watered). Session-only state. i18n.
  Verify: search filters live; sort changes order; clear search restores all plants.

- [ ] **T16.2 — Plant notes**
  Task: Extend `CareLog` with `note?: string`. Add a "Add note" quick-entry on PlantDetail (saves `CareLog` with `type: 'note'`). Show notes in history with a note icon. Include in export/import. Increment DB version if `CareLog` doesn't have the field yet.
  Verify: add a note → appears in history; export → import round-trips it.

- [ ] **T16.3 — Plant archive (soft delete)**
  Task: Add `Plant.archivedAt?: Date` via DB v7 migration. "Archive" replaces "Delete" in PlantDetail menu. Archived plants hidden by default; toggle "Show archived" in settings reveals them. Include in export/import; bump export schema version.
  Verify: archive → disappears; toggle → reappears; history preserved; round-trips export.

- [ ] **T16.4 — PWA badge count (Badging API)**
  Task: Call `navigator.setAppBadge(count)` with overdue plant count when the app is backgrounded. Clear on foreground with zero overdue. Gate behind feature detection. No backend.
  Verify: overdue plant → badge appears on home screen icon; watering clears it.

- [ ] **T16.5 — "Share plant" card**
  Task: "Share" action on PlantDetail using Web Share API (`navigator.share`). Shares text card: name, species, stats, hash-URL deep link. Fallback: clipboard copy. i18n.
  Verify: native share sheet opens; text has name + stats; desktop copies to clipboard.

---

## Backlog / ideas (not scheduled)

- Multiple photos per plant (gallery carousel on PlantDetail).
- Rooms / locations grouping (tag plant with a room; filter list by room).
- Themes beyond light/dark (seasonal palettes).
- Plant graveyard view (memorial page for archived plants, Phase 16.3 hook).
- AI-assisted plant identification (camera → species name) — **requires a backend or third-party API; blocked by no-backend constraint unless done client-side via WASM model.**
- Scheduled local notifications via Notifications API (no push, triggered on `visibilitychange` or SW `periodicsync`) — complex, deprioritized.
- Catalog card: "Add to my plants" shortcut directly from the catalog detail view (currently only available via the Add Plant form flow).
