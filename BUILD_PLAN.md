# Plant Care PWA — Build Plan

A linear, copy-paste playbook. Each phase = one prompt = one Claude Code turn.
Work top to bottom. Don't skip ahead; each phase de-risks the next.

## How to use this plan

- **One prompt, one task, one turn.** Never merge two phases into one prompt.
- **Use plan mode for any multi-file prompt** (Shift+Tab in Claude Code). Review the
  plan and approve it *before* the agent edits files. This is your review gate.
- **After each prompt:** run the *Verify* step. If green → commit with a small,
  descriptive message. If not → tell the agent what it did vs. what it should have
  done, and let it fix. Then re-verify.
- **Test anything PWA / offline / install on a real phone**, not the desktop browser.
  The desktop will lie about installability and offline behaviour.
- `CLAUDE.md` lives in the repo root and is loaded automatically every session.

Every prompt ends with the same footer — keep it:
`Then: list changed files, how to verify, risks.`

---

## Phase 0 — One-time setup (do this yourself)

1. Create an empty GitHub repository named `plant-care-pwa`.
2. Scaffold locally:
   ```bash
   npm create vite@latest plant-care-pwa -- --template react-ts
   cd plant-care-pwa
   npm install
   npm run dev   # confirm it opens
   ```
   (In the wizard: React → TypeScript → ESLint: Yes.)
3. Put `CLAUDE.md` in the repo root. In its "GitHub Pages" section, replace
   `<repository-name>` with `plant-care-pwa`. Commit and push.
4. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions.**
   (Required so the workflow from Phase 1 can publish.)
5. Start Claude Code in the project folder: `claude`.

---

## Phase 1 — Deploy to GitHub Pages

**Goal:** an empty "Plant Care" app is live on the internet.

```text
Read CLAUDE.md and follow it.
Task (one only): set up deployment of this Vite + React + TS project to GitHub Pages.
1) add a GitHub Actions workflow in .github/workflows that builds and deploys to
   GitHub Pages on push to main;
2) set `base` in vite.config.ts to '/plant-care-pwa/'.
Add nothing beyond what is needed to deploy.
Then: list changed files, how to verify, risks.
```

**Verify:** the empty app opens at `https://<your-username>.github.io/plant-care-pwa/`.
**Commit.** The riskiest infra part is now done.

---

## Phase 2 — Data layer (Dexie)

**Goal:** you can add a plant and it survives a reload.

```text
Task (one only): add a Dexie-based data layer and a minimal UI.
1) set up Dexie; the database is named plant-care-db (from CLAUDE.md — do not rename);
2) a Plant model: id, name, wateringIntervalDays, lastWateredAt, optional photo (Blob);
3) a screen listing plants and an "Add plant" form that writes to IndexedDB.
Keep the UI minimal, no styling yet.
Then: list changed files, how to verify, risks.
```

**Verify:** add a plant → reload (F5) → it's still there. **Commit.**

> From here on, real code exists. Set up the **reviewer subagent** (see the appendix at
> the bottom) and run it on each diff before committing.

---

## Phase 3 — Internationalization (RU/EN switcher)

**Goal:** the UI speaks both languages, the choice persists. Do this *before* building
more screens so you never hardcode strings.

```text
Task (one only): add client-side internationalization with a RU/EN language switcher.
1) set up i18n (react-i18next is fine) with two bundled locales: en and ru;
2) move ALL existing user-facing strings into translation keys — no hardcoded text;
3) add a visible RU/EN switcher in the UI;
4) persist the selected language and restore it on launch; default to the device
   language, falling back to en (localStorage is fine for this preference);
5) make Russian plural forms work (Intl.PluralRules / i18next pluralization),
   e.g. "1 day" / "2 days" / "5 days".
No backend — translations are bundled with the app.
Then: list changed files, how to verify, risks.
```

**Verify:** toggle RU/EN — all visible text switches; reload → language persists; a day
count reads correctly in Russian (1 день / 2 дня / 5 дней). **Commit.**

---

## Phase 4 — Make it a real PWA

**Goal:** installable, works offline, has an explicit update button.
**This is the first fully testable PWA milestone.**

```text
Task (one only): make this an installable, offline-capable PWA using vite-plugin-pwa.
1) add and configure vite-plugin-pwa (do not hand-write the service worker);
2) add a web app manifest (name, icons, standalone display, theme color);
3) make the app load offline after the first visit;
4) add an explicit "Update" button (i18n key) shown when a new version is available;
   IndexedDB data must be preserved across updates.
Respect the GitHub Pages base path so the service worker scope is correct.
Then: list changed files, how to verify, risks.
```

**Verify (on your phone):** open the Pages URL → Add to Home Screen → launch standalone
→ add a plant → enable airplane mode → reopen. It works and the plant is still there.
**Commit.** You can now install, test, and iterate on a real device.

---

## Phase 5 — Watering cycle (the core product)

**Goal:** mark a plant watered, see what needs watering today.

```text
Task (one only): implement the watering cycle.
1) a plant detail card showing name, photo, watering interval, and next watering date;
2) a "Watered" button that sets lastWateredAt to now and recalculates the next date;
3) a "Today" screen that buckets plants into: due today, overdue, and due soon
   (all labels via i18n keys, with correct RU pluralization for day counts).
Then: list changed files, how to verify, risks.
```

**Verify:** mark a plant watered → next date updates; the Today screen sorts plants into
the right buckets. **Commit.**

---

## Phase 6 — Photos (with compression)

**Goal:** attach a photo without bloating the database.

```text
Task (one only): add plant photos with client-side compression.
1) let the user attach/replace a photo for a plant (camera or file picker);
2) resize and compress the image in the browser BEFORE storing it as a Blob in
   IndexedDB (target a small size, e.g. max ~1024px, JPEG/WebP);
3) show the photo on the plant card and in the list.
Do not store raw multi-megabyte originals. No external/cloud storage.
Then: list changed files, how to verify, risks.
```

**Verify:** add a photo → it shows on the card → reload persists it → the stored size is
small (check in DevTools → Application → IndexedDB). **Commit.**

---

## Phase 7 — Export / Import (data-loss protection)

**Goal:** the user can back up and restore everything.

```text
Task (one only): add full data export and import as data-loss protection.
1) export all data (plants, care history, settings; photos as base64) to a single
   downloadable JSON file;
2) import that JSON back, restoring the data into IndexedDB;
3) include version/schema info in the export so future imports stay compatible.
Do not break existing data on import; confirm before overwriting.
Then: list changed files, how to verify, risks.
```

**Verify:** export → reinstall (or clear site data) → import → everything is restored.
**Commit.**

---

## Phase 8 — Install guide

**Goal:** a new user knows how to install the app.

```text
Task (one only): add an in-app install guide.
1) a short guide for installing the PWA on iPhone (Safari → Share → Add to Home Screen)
   and Android (Chrome → Add to Home Screen / Install);
2) all text via i18n keys (EN + RU);
3) place it where a new user can find it (e.g. a help/settings entry).
Then: list changed files, how to verify, risks.
```

**Verify:** the guide is visible and the steps actually match iOS/Android. **Commit.**

---

## Done

Run through the **MVP definition of done** in `CLAUDE.md`. When every box is checked,
the MVP is complete. After that, iterate freely — care history view, sorting, themes,
multiple watering schedules, etc. Same format: one task per prompt.

---

## Appendix — Reviewer subagent

Create `.claude/agents/reviewer.md` with the content below. Then, before each commit,
say in Claude Code: **"Use the reviewer subagent to review the current diff."**

```markdown
---
name: reviewer
description: Reviews a diff against the hard constraints in CLAUDE.md. Use after any
  code change, before committing, to catch backend/native dependencies, IndexedDB
  data-safety violations, hardcoded UI strings, and GitHub Pages base-path issues.
tools: Read, Grep, Glob, Bash
---
You are a strict code reviewer for the Plant Care PWA. Read CLAUDE.md first, then
review the current diff (use `git diff` and `git diff --staged`).

Check specifically for:
- Any backend, server API, Capacitor / React Native / Flutter, or external storage
  being introduced. Flag immediately as critical.
- IndexedDB data safety: database renamed; destructive schema change; deleting or
  recreating the DB on update; a schema change not done via a Dexie migration with an
  incremented version. Flag any of these as critical.
- Hardcoded user-facing strings that bypass i18n. All display text must use translation
  keys (en + ru).
- GitHub Pages issues: `base` not respected; service worker scope or asset paths broken.
- Photos stored as raw originals instead of resized/compressed Blobs.
- Unnecessary new dependencies beyond the agreed stack + i18n.

Output:
- A one-line verdict: APPROVE or REQUEST CHANGES.
- Issues grouped by severity (critical / warning / nit), each with file, line, and a
  concrete fix.
- Do not edit files yourself — only report.
```
