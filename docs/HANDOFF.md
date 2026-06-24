# Handoff — Plant Care PWA

## Status

**Branch:** `main`  
**Build:** passes (`npm run build` + `npm run lint` both clean)  
**Uncommitted work:** photo feature (5 files changed but not staged — see below)

```
modified:   src/AddPlantForm.tsx
modified:   src/PlantCard.tsx
modified:   src/i18n/en.json
modified:   src/i18n/ru.json
untracked:  src/compressImage.ts
```

Commit these first before starting the next task.

---

## Done — Phases 1–4 complete

| Phase | Commit | What it delivered |
|---|---|---|
| 1 — CI/CD | `65f5121` | GitHub Actions workflow; `vite.config.ts` base set to `/plant-care-pwa/` |
| 2 — Data layer | `be8fc1e` | Dexie (`plant-care-db` v1), `Plant` model, `PlantList`, `AddPlantForm` |
| 3 — i18n | `ce6e05d` | react-i18next, EN + RU locales, RU plural forms, `LanguageSwitcher`, localStorage persistence |
| 4 — PWA | `9305362` | vite-plugin-pwa, web manifest, Workbox offline precache, `UpdatePrompt` (explicit update button) |

All four phases are stable and have been deployed (origin/main is up to date).

---

## In Progress — Phase 5: App features

### Committed sub-task: watering cycle (`46c2d83 add watering`)

- `src/watering.ts` — pure functions: `nextWateringDate(plant)` and `daysUntilWatering(plant)` (returns negative/0/positive; never-watered plants → 0)
- `src/PlantCard.tsx` — card showing name, photo slot, interval, next-watering date, status text, **Watered** button (writes `lastWateredAt = now` to IndexedDB)
- `src/TodayScreen.tsx` — three buckets: **Overdue** (days < 0), **Due today** (days = 0, incl. never-watered), **Due soon** (days > 0)
- `src/PlantList.tsx` — replaced inline `<li>` text with `PlantCard`; added `onRefresh` prop
- `src/App.tsx` — two-tab nav ("Today" / "My Plants"), unified `refresh` callback, removed old `plantsHeading` h2
- i18n keys added: `tabToday`, `tabPlants`, `overdueHeading`, `dueTodayHeading`, `dueSoonHeading`, `nextWatering`, `neverWatered`, `dueToday`, `overdueDays`, `dueSoonDays`, `watered` (all with RU plural forms)

### Uncommitted sub-task: photo compression (working directory only)

- `src/compressImage.ts` *(new)* — `compressImage(file: File): Promise<Blob>`: loads via `<img>`, draws to canvas scaled to max 1024px longest-side, encodes WebP (falls back to JPEG if `blob.type !== 'image/webp'`, e.g. Safari < 17)
- `src/AddPlantForm.tsx` — file input (`accept="image/*"`), compresses before storing, shows object-URL preview, resets input ref on submit
- `src/PlantCard.tsx` — hidden file input behind a `<label>` ("Add photo" / "Change photo"); compress + `db.plants.update` on pick; `useMemo` creates object URL, `useEffect` revokes it on cleanup
- `src/i18n/{en,ru}.json` — added `labelPhoto`, `addPhoto`, `changePhoto`

**Where Phase 5 stops:** photos are functionally complete but uncommitted. The next two MVP requirements have not been started at all.

---

## Next Steps (to finish Phase 5 / reach MVP)

1. **Commit the photo work** — stage the 5 files above, write a commit.

2. **Data export / import (JSON)** — CLAUDE.md requires this as an explicit MVP item.  
   - Export: `JSON.stringify(await db.plants.toArray())` with Blob photos serialised as base64 data-URLs (use `FileReader.readAsDataURL`), then `URL.createObjectURL(new Blob([json]))` + `<a download>` trigger.  
   - Import: file input → parse JSON → deserialise base64 back to Blob → `db.plants.bulkPut(...)` (not bulkAdd, so re-import is idempotent).  
   - Add to "My Plants" tab; add i18n keys `exportData` / `importData`.

3. **Install guide for iPhone / Android** — CLAUDE.md lists this as an MVP item.  
   - A simple static page or collapsible section explaining: iOS: Share → Add to Home Screen; Android: browser menu → Install.  
   - Add a "How to install" link/button visible on first visit (can be dismissed, persist dismissal in localStorage).

4. **Basic styling** — the app is functional but completely unstyled. Not a hard MVP blocker, but a usability prerequisite for real testing. Scope it as a separate task.

5. **End-to-end smoke test on GitHub Pages** — push, let CI deploy, verify SW registers, offline works, install prompt appears.

---

## Key Decisions Made

| Decision | Why |
|---|---|
| `registerType: 'prompt'` for SW | CLAUDE.md mandates explicit user-triggered update; no silent reload |
| `useMemo` for object URLs + cleanup `useEffect` | `react-hooks/set-state-in-effect` lint rule blocks `useState` + `useEffect` for URL creation; `useMemo` is synchronous so no setState in effect |
| WebP with JPEG fallback in `compressImage` | Safari < 17 silently returns PNG when asked for WebP; code checks `blob.type === 'image/webp'` and re-encodes to JPEG rather than accepting the PNG |
| Never-watered plants → `daysUntil = 0` (Due today) | Consistent UX: a plant with no history should prompt immediate action, not wait an interval |
| `onWatered` prop kept for photo-change callback | Renaming would require touching TodayScreen + PlantList for zero user-visible gain; both actions just trigger a data refresh |
| No `i18next-browser-languagedetector` dependency | Language detection is 3 lines with `navigator.language`; CLAUDE.md says no library if built-ins suffice |

---

## Files and What Changed

```
src/
  compressImage.ts      NEW  Resize + WebP/JPEG encode, no deps, ~40 lines
  watering.ts           NEW  nextWateringDate(), daysUntilWatering() — pure, no React
  PlantCard.tsx         NEW→modified  Card UI, Watered button, photo add/change
  TodayScreen.tsx       NEW  Three-bucket watering dashboard
  AddPlantForm.tsx      modified  Added photo file input, preview, compress-before-store
  PlantList.tsx         modified  Now renders PlantCard; added onRefresh prop
  App.tsx               modified  Two-tab nav (Today / My Plants)
  db.ts                 unchanged  Plant model has photo?: Blob — no schema migration needed
  i18n/en.json          modified  +15 keys this session
  i18n/ru.json          modified  +15 keys, all with _one/_few/_many/_other variants
  i18n/index.ts         unchanged
  LanguageSwitcher.tsx  unchanged
  UpdatePrompt.tsx      unchanged

public/
  pwa-192x192.png       NEW  Solid green placeholder (generated by Node script, no tool dep)
  pwa-512x512.png       NEW  Same, 512×512

.github/workflows/
  deploy.yml            NEW  build → upload-pages-artifact → deploy-pages on push to main

vite.config.ts          modified  base + VitePWA plugin config
tsconfig.app.json       modified  Added "vite-plugin-pwa/client" to types array
```

---

## Gotchas / Non-Obvious Things

- **Dexie deserialises Blobs as new instances** on every `toArray()`. Two `plant.photo` Blobs from successive fetches will never be `===` equal even if the data is identical. This means `useMemo([plant.photo])` recomputes on every refresh — object URLs are recreated and revoked each time. Acceptable for MVP but worth noting if performance matters.

- **`canvas.toBlob` with `'image/webp'` on Safari < 17 silently falls back to PNG**, not JPEG. If you just check `if (blob)` you'll store a large PNG. The fix is `if (blob?.type === 'image/webp')`.

- **PWA icons are solid green placeholders** (`#3a7d44`). They satisfy the manifest spec (installable), but they need real artwork before the app is shown to real users.

- **Duplicate entries in SW precache** — `favicon.svg` and the two PNGs appear twice in the Workbox manifest because both `includeAssets` and `globPatterns` match them. Harmless (Workbox deduplicates at runtime); fix by dropping `includeAssets` from `vite.config.ts` if it annoys you.

- **`apple-touch-icon` is missing from `index.html`**. iOS Safari ignores the manifest `icons` array; the home-screen icon will be a screenshot until a `<link rel="apple-touch-icon">` tag is added.

- **`react-hooks/set-state-in-effect`** is enabled in this project's ESLint config. Any `useEffect` that calls `setState` synchronously in its body will fail lint. Use `useMemo` for derived values that need cleanup (object URLs), and only use `useEffect` for the revocation cleanup.

- **`lastWatered` i18n key exists but is no longer rendered** — it was in the old PlantList inline template. PlantCard now shows `nextWatering` instead. The key is harmless dead weight; remove it during a locale cleanup pass.
