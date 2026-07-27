# Contributing to DARE Frontend

Thanks for your interest in contributing. This guide covers issues, pull requests, and the coding standards we follow.

## Filing issues

Before opening an issue:

1. Search the repository's existing issues to avoid duplicates.
2. Verify the bug reproduces against the latest `dev`.
3. Try to isolate whether the problem is frontend, backend, or integration — check the browser's network and console panels.

### Bug reports

Include:

- **Environment** — OS, browser + version, frontend commit / deploy URL.
- **Backend** — version or commit, deployment context.
- **Steps to reproduce** — minimal, numbered.
- **Expected vs. actual behaviour**.
- **Console / network output** — relevant errors, request/response excerpts (redact tokens).
- **Screenshots or recordings** — especially for layout, animation, and interaction issues.

### Feature requests

Frame them as user problems first, implementation second:

- The user-facing problem.
- Who is affected and how often.
- Any constraints or non-goals.

### Security issues

**Do not** open public issues for security vulnerabilities. See [SECURITY.md](SECURITY.md).

---

## Pull requests

### Before opening a PR

1. Fork the repository, sync the latest `dev`, and create a feature branch from `dev`:

   ```bash
   git checkout dev
   git pull --ff-only origin dev
   git checkout -b your-name/feature/short-description
   ```

   Naming: `<author>/<feature|fix|refactor|docs>/<short-description>`.

2. Run the full local check suite:

   ```bash
   npm run lint
   npm run format -- --check
   npx tsc --noEmit
   npm run build
   ```

3. Test the change in a real browser session against a running backend. For UI changes, exercise both light and dark modes.

### PR template

Each PR should include:

- **What** — one-paragraph summary.
- **Why** — link to the issue (`Closes #123`) or describe motivation.
- **How** — high-level approach. Call out non-obvious decisions.
- **Testing** — how you verified the change. Manual repro? New tests?
- **Screenshots / recordings** — required for any visible UI change. Include both states (light/dark, empty/populated, loading/error) where applicable.
- **Backend dependencies** — does this require a backend change? Link the corresponding backend PR.

### Review and merge

- At least one approving review from a maintainer.
- All CI checks green (lint, type-check, build).
- Squash-merge by default. The squashed message becomes part of release notes — make it descriptive.

---

## Coding standards

### TypeScript

- **Strict mode is on.** Don't disable it locally.
- Prefer `interface` over `type` for object shapes; use `type` for unions and aliases.
- No `any` without a comment explaining why. `unknown` + narrowing is almost always better.
- Public component props always typed; props interfaces named `<Component>Props`.

### React

- **Functional components only.** No new class components.
- Hooks at the top of the component, in the order: state, derived state, refs, effects, callbacks.
- One component per file unless they are tightly coupled and small.
- Keep components focused — extract sub-components or hooks before a file gets above ~300 lines.

### Redux

- Slice names match domain names (`conversationSlice`, not `chatSlice`).
- Side effects via `createAsyncThunk` — never raw `dispatch` from inside reducers or selectors.
- Selectors live next to the slice; memoize with `createSelector` if they do non-trivial work.

### Socket.IO

- All inbound `/workflow` events are validated with Zod schemas in `src/schemas/`. New event types must add a schema _before_ dispatch.
- Connection lifecycle stays inside the middleware. Components dispatch intents (`emit:foo`); they don't talk to the socket directly.

### Styling

- Tailwind utility classes by default.
- Use `cn(...)` from `@/lib/utils` to compose conditional classes.
- New brand tokens go in `tailwind.config.ts` rather than ad-hoc CSS.
- Dark mode: every visible surface must look right under both `light` and `dark`.

### Forms

- Formik + Yup for any form with validation, server submission, or multiple fields.
- Plain controlled state for trivial single-input cases.
- Yup schemas live next to the form.

### Naming

- Components: `PascalCase`.
- Hooks: `useThingy`.
- Files: match the default export — `MyComponent.tsx`, `useMyHook.ts`.
- Constants: `SCREAMING_SNAKE_CASE` only for genuinely module-level constants.

### Comments

- Default to no comments — names should carry meaning.
- Comment the _why_ when behaviour is non-obvious: a workaround for a specific bug, an invariant a future reader might miss, an intentional deviation from the obvious approach.
- Don't comment what the code does. Don't reference the PR number or task ID.

### Linting and formatting

- ESLint config: `eslint.config.js`. Don't disable rules locally without justification.
- Prettier formats on save (with editor support) and via Husky + lint-staged on commit.
- If a rule is consistently wrong for the project, raise it in an issue — don't litter the codebase with `// eslint-disable-next-line`.

### Tests

- Unit-test pure utilities and reducers.
- Component tests with React Testing Library — focus on user-observable behaviour, not internal state.
- Mock API calls and Socket.IO at the module boundary.
- Don't write tests that pin internals you wouldn't notice changing — they slow refactors and add no signal.

### Commit messages

`<type>: <summary>` where type is one of `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`. Keep summary under 70 chars.

```
feat: add MCP server picker to conversation header

Wires the new /mcp/servers endpoint into a dropdown in the
conversation header. Selecting a server emits the existing
mcp:select event over the /chat namespace.

Closes #517.
```

### Code review etiquette

- Correctness, then design, then style.
- `nit:`, `consider:`, and `blocking:` prefixes help calibrate severity.
- For UI changes, pull the branch and exercise it before approving — screenshots in PRs lie.

---

## Using AI coding agents

This repo ships shared configuration for AI coding agents, so an agent you point at a fresh clone
already knows how to run the dev server and how to verify a change before you open a PR.

| File | What it is |
| --- | --- |
| `AGENTS.md` | Project instructions — architecture, conventions, patterns. Read by Codex and other tools following the `AGENTS.md` convention. |
| `CLAUDE.md` | Imports `AGENTS.md`, plus any Claude Code-specific notes. |
| `.agents/skills/<name>/SKILL.md` | Task procedures — `run-frontend`, `check`. |
| `.claude/skills/<name>` | Symlinks to the above, because Claude Code scans a different path. |

Invoke a skill by name — `/run-frontend` in Claude Code, `$run-frontend` in Codex — or just
describe the task and let the agent load the matching skill on its own.

To add or change a skill, edit the file under `.agents/skills/`; the `.claude/skills/` symlink
needs no change. See [`.agents/README.md`](.agents/README.md) for the layout, how to add a new
skill, and the Windows symlink caveat.

Treat these files like code: they are reviewed in PRs, and a stale skill is worse than no skill.
If you change how the app is run, built, or checked, update the matching skill in the same PR.

---

## Getting help

- Stuck on a design choice? Open a draft PR with your sketch and ask in the description.
- For larger changes (new top-level pages, state shape changes, new dependencies), file an issue first.
