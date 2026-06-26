# Plant Care PWA — Project Context & Working Agreement

A brief for any new Claude Code session. Read this together with `CLAUDE.md` and
`docs/HANDOFF.md`. Those are the source of truth; this file captures decisions and
working practices that don't fit in CLAUDE.md.

## Where we are

- The MVP (original BUILD_PLAN.md Phases 1–8) is **done**: GitHub Pages deploy, Dexie
  data layer, i18n (RU/EN), installable PWA, watering cycle, photos, export/import,
  install guide.
- Post-MVP redesign + feature phase is also largely done:
  - **Phase 9–10:** design system, UI primitives, screen redesign, bottom nav.
  - **Phase 11:** DB v2 careGuides migration, plant detail (front face + care-guide back
    face + edit form).
  - **Phase 12:** DB v3 careLogs migration, real calendar month grid, watering history.
  - **Phase 13:** micro-interactions, empty/loading/error states, real app icons,
    achievements/care points, locale cleanup.
  - **Bug fixes:** photo loss on iOS/Android (Blob → ArrayBuffer in IndexedDB), Watered
    button losing state on reload (persist via `lastWateredAt`).
  - **Phase 14:** fertilize/repot care events, fertilize interval reminders (DB v5),
    keyboard auto-open bug fix (removed `autoFocus`), bundled care guide catalog
    (12 species, `src/catalog.ts`).
- **DB is at version 5.** See `docs/HANDOFF.md` for the full migration chain.
- **See `docs/HANDOFF.md`** for the current task state, non-obvious technical facts, and
  next steps.

## Source-of-truth files

| File | Purpose |
|---|---|
| `CLAUDE.md` | Hard rules, constraints, data-safety, commands. Auto-loaded every session. |
| `docs/DESIGN.md` | UI design system (bright & playful direction). |
| `docs/BUILD_PLAN.md` | Original phased playbook (Phases 1–8). Historical reference. |
| `docs/HANDOFF.md` | Current state, decisions, next steps. Update before pausing; read on resume. |

## Key decisions (and why)

- **PWA-only, no backend, no native.** Distribution = GitHub Pages. All data local in
  IndexedDB. (Detailed in `CLAUDE.md`.)
- **Bilingual UI: EN + RU** via react-i18next with bundled locales. Every user-facing
  string goes through i18n keys; RU plural forms handled correctly. Code, comments,
  commits: English only.
- **CSS Modules + CSS custom properties.** No Tailwind (minimal-deps rule). Design tokens
  from `DESIGN.md`.
- **Fonts:** Comfortaa (display) + Nunito Sans (body), self-hosted woff2 (latin +
  cyrillic subsets), precached offline. No CDN. Comfortaa replaced Fredoka because
  Fredoka has no Cyrillic glyphs.
- **Data safety is paramount.** DB name `plant-care-db` never changes. Schema changes only
  via `db.version(n).stores().upgrade()` with incremented n. Export/import updated in the
  same task as any schema change. Never wipe data on update.
- **`Plant.photo` is `ArrayBuffer`, NOT `Blob`.** Blobs silently corrupt on iOS Safari /
  Android WebView when Dexie re-serializes a record (structured-clone detaches the internal
  data reference). ArrayBuffers survive structured clone on every platform. For display,
  wrap: `new Blob([photo], { type: imageMimeType(photo) })`.
- **Navigation:** `tab` + `detailId` state in `App.tsx`. No router (HashRouter not needed
  for this simple nav model; it would add complexity without benefit).
- **WateredButton** requires `lastWateredAt: Date | null` prop. Uses `isToday()` to derive
  the "already done" state from real data, so button stays disabled across remounts and
  page reloads. Bounce animation only fires when user taps in the current session
  (`justWatered` flag + `.animate` CSS class separate from `.done`).

## Achievement system (Phase 13)

Two permanent badge tracks. Badges awarded based on `longestStreak` / `totalWaterings`
and are never revoked. "On time" = watered within 1.5× the interval.

- **Streak badges** at 3 / 7 / 14 / 30 consecutive on-time waterings (Bronze→Platinum).
- **Count badges** at 1 / 10 / 25 / 50 total waterings (Bronze→Platinum).
- Score: 10 pts on-time (+3 streak bonus at streak ≥ 3), 5 pts late, 2 pts very late.
- Logic lives in `src/achievements.ts` (pure functions, zero side effects).
- Displayed in `src/ui/AchievementsPanel.tsx` (PlantDetail front face) and as a global
  score line in `TodayScreen` summary card.

## How we work (working agreement)

- One task per turn. Never "build the whole app" in one go.
- End every change with: files changed, how to verify, risks.
- `npm run build && npm run lint` must be clean after every task.
- Use plan mode (Shift+Tab) to review the plan before the agent edits files.
- UI work is a visual loop: render → screenshot → specific feedback → repeat.
- Tokens / context hygiene: `/clear` between tasks, `/compact` when context fills.
  Update HANDOFF.md before ending a session; read it at the start of the next one.
