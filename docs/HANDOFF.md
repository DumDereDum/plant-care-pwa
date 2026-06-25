# Handoff — Plant Care PWA

Resume file for a fresh session. Read this together with `CLAUDE.md`, `ROADMAP.md`
(the live task list + progress), `DESIGN.md`, and `PROJECT_CONTEXT.md`.

## Status (2026-06-25)

- **Working tree: clean. Everything is committed** (latest commit `b7900ab "plant details"`).
- **MVP is done** (original Phases 1–8 in `BUILD_PLAN.md`: PWA, Dexie, i18n, watering,
  photos, export/import, install guide).
- We are now in the **post-MVP redesign + features** phase, tracked task-by-task in
  **`ROADMAP.md`**. That file is the source of truth for what's done and what's next —
  the agent ticks each task there on completion.

## How to resume

1. Read `CLAUDE.md` (hard rules) and `ROADMAP.md` (tasks + progress).
2. Paste the next unchecked task from `ROADMAP.md` into the chat. One task per turn.
3. Verify per the task's "Verify" line, commit, tick the box.

**Next task: `T11.3` — flip the plant detail to the care-guide back face** (suns/drops 1–5
for light/water/humidity/difficulty via `StatBar`, perk badges, toxicity). See `ROADMAP.md`
Phase 11.

## Done this phase (all committed)

| Task | What shipped |
|---|---|
| T9.1 | Design tokens + self-hosted fonts + reset/app shell |
| T9.2 | UI primitives `src/ui/`: Card, Button, StatusPill, StatBar, icons |
| T10.1 | Redesigned "My Plants" list (avatar cards) + tap → PlantDetail |
| T10.2 | "Today" screen anchor summary + buckets + empty state |
| T10.3 | Bottom navigation + app shell (safe-area), Calendar placeholder |
| T11.1 | **DB v2 migration**: `careGuides` table + `Plant.careGuideId`; export/import v2 |
| T11.2 | Plant detail front face: photo, name, status, watered, change-photo, edit name/interval |

## Key decisions / non-obvious facts (a fresh session won't know these)

- **Styling:** plain CSS + CSS custom properties (tokens from `DESIGN.md`), **CSS Modules**
  per component (`*.module.css`). **No Tailwind** (minimal-deps rule; `vite/client` types
  make CSS modules type-check).
- **Fonts:** display = **Comfortaa** (replaced Fredoka, which has NO Cyrillic — the UI is
  bilingual). Body = Nunito Sans. Both **self-hosted** as variable woff2 (latin+cyrillic) in
  `src/assets/fonts/`, imported via `src/fonts.css`, and **precached** (`woff2` added to the
  Workbox `globPatterns` in `vite.config.ts`). No Google Fonts CDN at runtime (offline).
- **DB v2 / care guides** (`src/db.ts`): `careGuides` is a **standalone, reusable** table
  (no `plantId`) so a catalog can seed it; plants link via `Plant.careGuideId`. `CareGuide`
  uses `Rating = 1..5` for light/water/humidity/difficulty, an **open `perks: string[]`**
  (`PerkKey`/`KNOWN_PERKS` document the known ones; **toxicity is modelled as perks** —
  `toxicCats`/`toxicDogs`/`unsafeChildren`), and `source: 'user' | 'catalog'`. There is **no
  `petToxic` boolean** (it was removed to match the refined model in `ROADMAP.md`).
- **`StatBar` exists but is NOT wired into any screen yet** — T11.3 is the first task with
  real rating data; wire it there.
- **Photo editing** for existing plants now lives on the **detail screen** (`PlantDetail`),
  not the list card. New-plant photos still come from `AddPlantForm`.
- **Navigation/state** lives in `App.tsx`: `tab` (today/plants/calendar/help) + `detailId`
  (open plant). Changing tab clears the detail. No router (no HashRouter).
- **Placeholders still to build:** `CalendarScreen` (real month grid = T12.2), and the
  PlantDetail **flip / back face** (care guide = T11.3).
- **Open question for T11.3:** how to show "pet-safe" (cat-in-heart). Only negative toxicity
  perks exist, so "safe" must be derived (e.g. guide is filled AND no toxic perks → show
  safe; otherwise unknown). Decide this when building T11.3.

## Dev & verification workflow (important quirks)

- **Preview server:** `.claude/launch.json` runs `npm run dev` on **port 5180** (the user
  keeps their own dev server on 5173 — do not fight it). Start with `preview_start "dev"`.
- **Seeding test data:** the preview origin (`localhost:5180`) has its own IndexedDB. Seed
  via `preview_eval` raw IndexedDB (open `plant-care-db`, write to `plants`/`careGuides`),
  then `location.reload()`. Screenshot at **mobile** preset (375×812).
- **React state reads are async:** don't read `aria-current`/DOM state in the SAME eval right
  after a `.click()` — it shows stale values. Drive multi-step flows across separate calls,
  or use `preview_fill` / `preview_click` (trusted events).
- **Occasional preview state resets** (the open detail "forgets") — re-drive the flow; not a
  code bug.
- **DB:** name is `plant-care-db` (never rename), current Dexie version **2**
  (IndexedDB version shows as 20 = Dexie 2 ×10).

## Guardrails (from CLAUDE.md — do not violate)

PWA-only; no backend / no native / no app store / no external storage. All data in
IndexedDB. Bilingual EN/RU — every user-facing string via i18n (RU plural forms). Schema
changes ONLY via incremented Dexie `version(n).stores().upgrade()`; never break export/import
(update it in the same task). GitHub Pages base `/plant-care-pwa/`; SW update is explicit.
