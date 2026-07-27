---
name: check
description: Verify a DARE frontend change before opening a pull request — run the real build, not a bare type-check, plus lint and formatting. Use when the user is about to commit, push, or open a PR, or asks whether their change will pass CI or deploy cleanly.
---

# Check the DARE frontend before a PR

```bash
npm run app:build
npm run lint
npm run format
```

## Use `app:build`, not `tsc --noEmit`

`npm run app:build` runs `tsc -b && vite build`. The `-b` (build mode) flag is what deployment
uses, and it is not interchangeable with `tsc --noEmit`:

- `tsc -b` respects the project references and `include` globs in the tsconfig files, so it
  type-checks files that `--noEmit` skips — fixtures and mock data among them.
- A change that only breaks one of those skipped files passes `tsc --noEmit` cleanly and then
  fails the staging deploy.

This has bitten this repo before. Always verify with `npm run app:build`.

`npm run build` additionally builds and copies the docs site. That is what CI runs for a release,
but it is slow; `app:build` is enough for a normal change. Run the full `build` if you touched
`docs-site/` or anything it syncs from.

## What the pre-commit hook already does

A Husky pre-commit hook runs `npm run docs:sync`, stages `docs-site/content/docs`, then runs
lint-staged (`prettier --write` and `eslint --fix`) over staged `.js/.jsx/.ts/.tsx` files.

Two consequences worth knowing:

- Formatting is normally handled for you. Run `npm run format` by hand only if a commit was made
  with `--no-verify`.
- The hook adds synced docs content to your commit. If a commit contains `docs-site/content/docs`
  changes you did not write, that is the hook, not a bad merge.

## Branch and PR conventions

Feature branches are cut from `dev`, not `main`:

```bash
git checkout dev
git pull --ff-only origin dev
git checkout -b your-name/feature/short-description
```

Naming is `<author>/<feature|fix|refactor|docs|chore>/<short-description>`.

Include screenshots or a recording for any visual change — this is a UI repo and a description of
a layout change is rarely enough for a reviewer.

## Related

- `CONTRIBUTING.md` — the full contribution guide.
- `docs/RULES.md` — the repo's coding standards.
