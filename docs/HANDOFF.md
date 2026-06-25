# Handoff — Plant Care PWA

Resume file for a fresh session. Read this together with `CLAUDE.md`, `DESIGN.md`,
and `PROJECT_CONTEXT.md`.

## Status (2026-06-25, end of session)

- **Working tree: has uncommitted changes** (all the work below). Commit before continuing.
- **MVP is done** (original Phases 1–8 in `BUILD_PLAN.md`).
- Post-MVP feature phase: Phase 13 is now **fully complete**.

## How to resume

1. Read `CLAUDE.md` (hard rules), this file, and `PROJECT_CONTEXT.md`.
2. Run `npm run build && npm run lint` — must be clean before starting new work.
3. Commit current changes if not yet committed (`git add -A && git commit`).
4. Pick the next task from the **Next steps** section below.

## Done this session (all clean, build + lint pass)

| Task | What shipped |
|---|---|
| Achievements system | `src/achievements.ts` — pure functions: streaks, score, badges. `src/ui/AchievementsPanel.tsx` + CSS — displayed at bottom of PlantDetail front face. Global score + best active streak shown in TodayScreen summary card. 8 badges across 2 tracks (see schema below). |
| Locale cleanup | Removed 6 unused i18n keys from EN+RU: `calendarTitle`, `calendarComingSoon`, `plantsHeading`, `lastWatered`, `labelPhoto`, `careSpecies`. Deleted 3 dead Vite template assets: `src/assets/hero.png`, `react.svg`, `vite.svg`. |
| Bug fix: photo loss on iOS | Root cause: Dexie `update()` re-serializes the full record via structured clone; iOS Safari / Android WebView silently corrupts `Blob` objects during that pass. Fix: store photos as `ArrayBuffer` (plain bytes survive structured clone everywhere). DB v4 migration converts existing Blobs. `imageMimeType()` in `compressImage.ts` detects WebP vs JPEG from magic bytes. All display code wraps with `new Blob([buf], { type })`. |
| Bug fix: Watered button forgets state on reload | Added `lastWateredAt: Date \| null` prop to `WateredButton`. `isToday(lastWateredAt)` makes the button show done state after reload without re-playing the animation. `.animate` CSS class split from `.done` — bounce only fires when user tapped in the current session. |

## Achievement system — rule set (important to know)

**Two permanent badge tracks** (badges never revoked):

| Track | Threshold | Tier | Key |
|---|---|---|---|
| Streak (consecutive on-time) | 3 | Bronze | `badgeOnARoll` |
| Streak | 7 | Silver | `badgeConsistent` |
| Streak | 14 | Gold | `badgeDedicated` |
| Streak | 30 | Platinum | `badgeGreenThumb` |
| Count (total waterings) | 1 | Bronze | `badgeFirstDrop` |
| Count | 10 | Silver | `badgeRegular` |
| Count | 25 | Gold | `badgeDevoted` |
| Count | 50 | Platinum | `badgePlantParent` |

- **Streak badges** awarded based on `longestStreak` (permanent — a missed watering does not revoke them).
- **Current streak** (`computeCurrentStreak`) resets to 0 if plant is currently overdue; used for the progress bar only.
- **On-time** = watered within 1.5× the plant's interval (50 % grace window).
- **Score**: 10 pts on-time, +3 streak bonus when streak ≥ 3, 5 pts late (≤ 3× interval), 2 pts very late.

## Key technical facts (non-obvious, a fresh session won't know these)

- **DB is at version 4** (IndexedDB shows 40 = Dexie v4 × 10). Migration chain: v1 plants → v2 +careGuides → v3 +careLogs → v4 Blob→ArrayBuffer for photos.
- **`Plant.photo` is `ArrayBuffer | undefined`**, NOT Blob. Always wrap for display: `new Blob([photo], { type: imageMimeType(photo) })`. Never store a Blob in IndexedDB — it will silently corrupt on iOS/Android when Dexie re-serializes the record.
- **`imageMimeType(buf)`** exported from `src/compressImage.ts` — detects `image/webp` or `image/jpeg` from first 12 bytes (magic bytes).
- **`WateredButton` requires `lastWateredAt: Date | null`** prop — all three callers pass it (PlantCard, PlantDetail, CalendarScreen). The `isToday()` helper is internal to that component.
- **PlantDetail loads ALL careLogs** (not just 5) into `allLogs` state; `history` (displayed) = `allLogs.slice(0, 5)` via `useMemo`; `achievements` is also derived from `allLogs`.
- **TodayScreen loads careLogs** alongside plants (single `Promise.all`); `globalStats` (total score + best active streak) shown in summary card when `totalScore > 0`.
- **Styling:** plain CSS + CSS Modules, CSS custom properties from `DESIGN.md`. No Tailwind.
- **Fonts:** Comfortaa (display) + Nunito Sans (body), self-hosted woff2 in `src/assets/fonts/`, precached via Workbox `globPatterns: ['**/*.woff2']`.
- **Navigation:** `tab` + `detailId` state in `App.tsx`. No router.
- **Export/import** (`src/dataTransfer.ts`): photos exported as base64 data URL (via `bufToDataURL`), imported back as `ArrayBuffer` (via `dataURLToArrayBuffer`). Schema version = 3 (unchanged — photo field type is internal; JSON format unchanged).

## Dev workflow quirks

- Preview port: **5180** (not 5173 — that's the user's own server).
- `npm run build && npm run lint` must be clean before and after each task.
- IndexedDB name is **`plant-care-db`** — never rename.

## Guardrails (from CLAUDE.md)

PWA-only; no backend / no native / no app store / no external storage. All data in IndexedDB. Bilingual EN/RU — every user-facing string via i18n (RU plural forms). Schema changes ONLY via `db.version(n).stores().upgrade()` with incremented n. Never break export/import. GitHub Pages base `/plant-care-pwa/`; SW update is explicit (user-triggered).

## Next steps (suggested Phase 14+)

- **Catalog / AI seed for care guides** — a bundled JSON catalog of common houseplants with pre-filled `CareGuide` data; or an AI-assisted lookup by species name.
- **Push-free local reminders** — the app currently only shows "water today" on open; a `setTimeout`-based reminder badge on the PWA icon (Badging API) could nudge users.
- **Plant notes / log entries** — extend `CareLog` with a `note?: string` field; show in history.
- **Multiple photos per plant** — currently one photo; a small gallery would improve the detail screen.
- **Share / duplicate a plant** — copy a plant's settings to a new one.
- **Widget / Today extension** — iOS/Android home-screen widget (requires native wrapper — violates constraints; do not pursue without explicit decision to drop PWA-only rule).
