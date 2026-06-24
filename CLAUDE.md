# Plant Care PWA

## About

Plant Care is a PWA for taking care of houseplants. It ships ONLY as a PWA via
GitHub Pages: the user opens the site, adds it to the home screen, and uses it as a
standalone app. All data is stored locally on the device. There is no backend.

Architecture (do not change):

    GitHub → GitHub Actions → GitHub Pages → PWA → IndexedDB on the device

## Language

- Code, identifiers, comments, commit messages, and documentation: English only.
- User-facing UI: bilingual — English and Russian — via a client-side i18n layer with
  a visible RU/EN switcher. ALL user-facing strings go through translation keys; never
  hardcode display text in components. Handle Russian plural forms correctly (use
  `Intl.PluralRules` / i18next pluralization), e.g. "1 day" / "2 days" / "5 days".
- The selected language is persisted and restored on launch; default to the device
  language, falling back to English.
- No server is involved — translations are bundled with the app.

## Tech stack

- React + Vite + TypeScript
- IndexedDB via Dexie.js
- i18n: a small client-side i18n setup (react-i18next is fine) with bundled `en` + `ru`
  locales. This is a justified dependency, exempt from the "minimal dependencies" rule.
- PWA: manifest + Service Worker (via `vite-plugin-pwa`; do not hand-write the SW)
- Hosting: GitHub Pages
- CI/CD: GitHub Actions
- Linting: ESLint (flat config). Keep `react-hooks/exhaustive-deps` enabled.

## Hard constraints (do NOT violate)

Never add, install, or suggest:

- App Store, Google Play, or any app-store distribution;
- Capacitor, React Native, Flutter, or any native iOS/Android wrapper;
- a backend, server API, server database, or server-side push notifications;
- external services for storing data or photos.

If a task appears to require any of the above, STOP and say so. Do not work around
the constraint silently.

## Data (critical — data loss is unacceptable)

All user data (plants, photos, care history, settings) lives only in IndexedDB on the
device.

Rules:

- Database name is `plant-care-db`. NEVER rename it.
- Never delete or recreate the database on an app update.
- Schema changes ONLY through Dexie migrations (`version(n).stores(...).upgrade(...)`)
  with an incremented version number. No destructive changes to existing data.
- App code updates independently from user data.
- Store photos as a compressed Blob in IndexedDB (resize + compress BEFORE writing),
  not raw multi-megabyte camera files.
- Full data export/import (JSON) must always be available as protection against data
  loss. Do not break it when changing the schema.

## GitHub Pages (common pitfalls — always account for these)

- The site lives at `/<repository-name>/`, not at the domain root.
- `vite.config.ts` must set `base: '/<repository-name>/'`.
- The Service Worker scope and asset paths must respect this `base`, or offline and
  updates will not work.
- Routing must work on static Pages hosting (HashRouter, or a correct SPA fallback).

## App updates

- A new version ships via: commit → GitHub Actions build → Pages deploy.
- The Service Worker detects the new version; the user updates by EXPLICITLY clicking
  an "Update" button (not silently, not forced).
- Local data in IndexedDB is preserved across updates.

## Notifications

- No push notifications in the MVP.
- Tasks are shown when the app opens: "water today", "overdue", "due soon"
  (as translation keys, not hardcoded strings).

## Commands

- `npm run dev` — local development
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint

## How to work on tasks

- One task per turn. Do not build "the whole app" at once.
- Do not change the architecture or step outside the constraints above without an
  explicit request.
- Minimal dependencies: do not add a library if the task can be solved with built-in
  tools (i18n and the listed stack are the agreed exceptions).
- After making changes, ALWAYS provide:
  1. the list of changed/created files;
  2. how to verify the result;
  3. risks and what might have broken.
- If a task requires a DB schema change, call it out separately and describe the
  migration.

## MVP definition of done

The MVP is done when:

- it builds without errors and opens on GitHub Pages;
- it installs to the home screen and opens as a standalone PWA;
- it works offline after the first launch;
- the UI can switch between English and Russian, and the choice persists;
- you can add a plant and a photo;
- you can mark a plant "watered" and the next watering date recalculates;
- data persists after a reload;
- an app update does not delete local data;
- there is an install guide for iPhone/Android.
