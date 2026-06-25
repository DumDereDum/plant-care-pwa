# Plant Care PWA — Project Context & Working Agreement

A brief for any new Claude Code session. Read this together with `CLAUDE.md`,
`docs/DESIGN.md`, and `docs/BUILD_PLAN.md`. Those three are the source of truth for the
detailed specs; this file captures the decisions, working practices, and current state.

## Where we are

- The MVP (original `BUILD_PLAN.md`, 8 phases) is **done**: GitHub Pages deploy, Dexie data
  layer, i18n (RU/EN), installable PWA, watering cycle, photos, export/import, install guide.
- We are now in the **post-MVP redesign + features** phase, tracked task-by-task in
  **`ROADMAP.md`** (the live progress file — the agent ticks tasks there).
- Done so far: design foundation + UI primitives (T9.x), screen redesign + bottom nav
  (T10.x), DB v2 `careGuides` migration (T11.1), plant detail front face (T11.2).
- **Next: T11.3** — flip the plant detail to the care-guide back face.
- See **`docs/HANDOFF.md`** for the full resume brief (decisions, dev/verify quirks).

## Source-of-truth files

- `CLAUDE.md` (repo root) — hard rules, conventions, data-safety, constraints. Auto-loaded
  every session.
- `docs/DESIGN.md` — the UI design system (the chosen "bright & playful" direction).
- `docs/BUILD_PLAN.md` — the phased playbook: the prompt for each phase, plus the reviewer
  subagent in the appendix.
- `docs/HANDOFF.md` — transient per-session state (current task, next steps). Update it
  before pausing a session; read it when resuming.

## Key decisions (and why)

- PWA-only, no backend / no native (no Capacitor, RN, Flutter). Distribution = GitHub Pages;
  all data local in IndexedDB. (Details in `CLAUDE.md`.)
- Language split: code, identifiers, comments, commits, and docs in English; the UI is
  bilingual RU/EN via react-i18next with a visible switcher and correct Russian plural forms.
  (Users may be Russian-speaking — the UI must not be English-only.)
- Linter: ESLint, not Oxlint — broadest ecosystem and agent support; keep
  `react-hooks/exhaustive-deps` on.
- Styling: plain CSS + CSS variables, no Tailwind (minimal-dependencies rule). All tokens
  taken from `DESIGN.md`.
- Data safety is paramount: the database `plant-care-db` is never renamed; schema changes
  only via Dexie migrations; the DB is never wiped on app update; export/import exists as a
  backup.

## Design direction (chosen this session)

- Bright & playful. Full spec in `DESIGN.md`: Comfortaa (display, replaces Fredoka which lacks
  Cyrillic) + Nunito Sans (UI), a green-led palette with coral (urgency) and amber (sun)
  accents, rounded shapes, mobile-first, explicit anti-generic rules, and light micro-motion.
- The styling foundation is in place (plain CSS variables from DESIGN.md, self-hosted fonts).
  The next design step is reusable Card / StatusPill / Button primitives, then restyle ONLY the
  home screen (a friendly "today" summary as the single visual anchor, plant list below). After
  it, run the screenshot loop.

## How we work with the agent (working agreement)

- One task per turn. Never "build the whole app" in one go.
- End every change with: files changed, how to verify, risks.
- Use plan mode (Shift+Tab) to review the plan before the agent edits files.
- Reviewer subagent (see BUILD_PLAN appendix): run it on each diff before committing. It
  checks constraint violations, data-safety, hardcoded UI strings (everything must go through
  i18n), and design tokens (no colors outside DESIGN.md, tap targets ≥ 44px).
- UI work is a visual loop: the agent cannot see its own output. Render → screenshot →
  specific feedback ("card padding uneven, heading too small") → repeat (~3 rounds). Lean on
  autoVerify; also test on a real phone in standalone. Keep design exploration separate from
  production-code chats.
- Models / effort: default Sonnet + medium effort; raise to high for tricky bits (service
  worker, hard bugs); use Haiku for trivial edits. Effort is the easy token lever — lower
  effort / cheaper model stretches usage limits.
- Tokens / context hygiene: `/clear` between tasks, `/compact` when context fills, keep
  CLAUDE.md lean. Subagents cost ~7x tokens — don't proliferate; the reviewer is the one to
  use. Across sessions, use the HANDOFF.md ritual instead of dragging a bloated session along.

## Next steps

Work the tasks in `ROADMAP.md` top to bottom (one per turn, commit, tick the box):

1. **T11.3** — plant detail flip to the care-guide back face (suns/drops 1–5, perks, toxicity).
2. **T11.4** — care-guide edit form (fill in the placeholder fields).
3. **Phase 12** — DB v3 `careLog` (watering history) + the real Calendar month grid.
4. **Phase 13** — micro-interactions, on-brand empty/loading/error states, real app icons,
   achievements/medals, locale cleanup.
