# AGENTS.md

React 18 + TypeScript SPA for DARE, built with Vite and served on port 5173. It talks REST and
Socket.IO to the `dare-backend` repo on port 8000. `docs-site/` is a separate Next.js docs app.

Read and follow `docs/reference/rules.md` before changing code. Procedures live in `.agents/skills/`:
`run-frontend`, `check`.

## Commands

```bash
npm run dev                               # :5173; needs the backend on :8000
npm run app:build                         # tsc -b + vite build: the real type check
npm run lint                              # eslint . --max-warnings 0
node scripts/test-ensemble-state.mjs      # the only automated test
```

## Traps

- **Verify with `npm run app:build`, not `tsc --noEmit`.** The root `tsconfig.json` has
  `"files": []` and only project references, so `tsc --noEmit` checks nothing and passes while
  the deploy's `tsc -b` fails.
- **`npm run build` also builds the docs site.** It runs `app:build`, then builds `docs-site/`
  (Node 22+) and copies it into `dist/docs` and `dist/_next`. Use `app:build` for normal changes.
- **There is no `npm test`.** No test runner is installed. Verify with `app:build`, `lint` and a
  real browser session against the backend.
- **Never run `npm run format`.** It is `prettier --write .` over the whole repo and rewrites
  unrelated files. Format only the files you touched: `npx prettier --write <files>`.
- **The pre-commit hook copies docs from `../dare-backend`.** It runs `docs:sync`, which renders
  docs from a sibling `dare-backend` checkout into `docs-site/content/docs` and stages them, then
  runs lint-staged (Prettier + ESLint on staged JS/TS). The commit picks up whatever branch the
  backend is on. With no sibling checkout it skips; if the backend branch lacks a synced file, it
  fails and names the file.
- **Doc files are synced by path.** Renaming or moving a file in `docs/`, `README.md` or
  `.github/` breaks `docs-site/scripts/sync-content.mjs`.
- **CI does not run lint or tests.** The workflows only deploy. Run the `check` skill yourself.
- **Style with semantic tokens only** (`bg-background`, `bg-primary`, `text-muted-foreground`).
  No hex colors and no raw palette classes (gray, slate, violet…); a new UI state uses
  `bg-primary`/`text-primary` or an existing `Badge` variant. Third-party components that need a
  light/dark value read `selectResolvedMode` from `@/redux/themeSlice`.
- **A new theme touches four places:** a CSS file in `src/themes/`, its `@import` in
  `src/index.css`, `THEME_NAMES` in `src/redux/themeSlice.ts`, and a card in
  `src/components/Settings/AppearanceSettings.tsx`.
- **Feature flags come from the backend, not `.env`.** Read them with `useFeatureFlag`
  (`src/hooks/useFeatureFlag.ts`); `src/api/featureFlags.ts` fetches `api/feature-flags/me/`.
- **The env example is `.env.example`**; the backend's is `.example.env`. Every variable is in
  `docs/reference/configuration.md`.
