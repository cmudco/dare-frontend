# Contributing

Thanks for helping. This repo is the web frontend of the DARE platform; it works with the
[DARE backend](https://github.com/cmudco/dare-backend/).

## Filing issues

Search existing issues first, and check that the problem still happens on the latest `dev`. Use
the browser's network and console panels to tell whether it is a frontend, backend or integration
problem.

- **Bug reports.** Include:
  - Environment: OS, browser and version, frontend commit or deploy URL
  - Backend: version or commit, and where it is deployed
  - Minimal, numbered steps to reproduce
  - Expected and actual behaviour
  - Console and network output: the relevant errors and request/response excerpts (redact tokens)
  - Screenshots or a recording, especially for layout, animation and interaction issues
- **Feature requests.** Describe the user problem first and the implementation second: the
  problem, who it affects and how often, and any constraints or non-goals.
- **Security issues.** Do not open a public issue. Follow [SECURITY.md](SECURITY.md).

For larger changes (new top-level pages, state shape changes, new dependencies), file an issue
before you start.

## Pull requests

### Branching

Branch from `dev`, not `main`:

```bash
git checkout dev
git pull --ff-only origin dev
git checkout -b your-name/feature/short-description
```

Name branches `<author>/<feature|fix|refactor|docs|chore>/<short-description>`.

### Before you open a PR

Run the `check` skill, or the same commands by hand:

```bash
npm run app:build    # tsc -b + vite build; tsc --noEmit is not enough
npm run lint
npx prettier --check <the files you changed>
```

Do not run `npm run format`; it rewrites the whole repo. Test the change in a real browser against
a running backend, in both light and dark mode for UI changes. Follow the coding rules in
[docs/reference/rules.md](../docs/reference/rules.md).

### PR description

- **What.** A one-paragraph summary.
- **Why.** Link the issue (`Closes #123`) or explain the motivation.
- **How.** The approach, and any decision that is not obvious.
- **Testing.** How you verified the change.
- **Screenshots or recordings.** Required for any visible UI change. Show each relevant state
  (light/dark, empty/populated, loading/error).
- **Backend dependencies.** Link the backend PR if this change needs one.

### Review and merge

- You need at least one approving review from a maintainer.
- CI only deploys; it does not lint, type-check or test. Reviewers rely on your checks above.
- We squash-merge by default, and the squashed message feeds the release notes, so make it
  descriptive.
- Reviewers look at correctness, then design, then style, and prefix comments with `nit:`,
  `consider:` or `blocking:`.
- For UI changes, reviewers pull the branch and try it before approving.

### Commit messages

Use `<type>: <summary>`, where type is `feat`, `fix`, `refactor`, `docs`, `style`, `test` or
`chore`. Keep the summary under 70 characters.

```
feat: add MCP server picker to conversation header
fix: keep the composer draft when switching conversations
docs: fold the script list into the quick start
```

Add a body when the change needs explaining, and close issues with `Closes #123`.

## Using AI coding agents

[AGENTS.md](../AGENTS.md) holds the commands and traps every agent reads; `.claude/CLAUDE.md`
imports it for Claude Code. Task procedures (`run-frontend`, `check`) live in
`.agents/skills/<name>/SKILL.md`, and `.claude/skills/` symlinks to them; see
[.agents/README.md](../.agents/README.md). Invoke a skill by name (`/run-frontend` in Claude Code,
`$run-frontend` in Codex) or describe the task and let the agent pick it. Treat these files like code: if you change how the app
is run, built or checked, update the matching skill in the same PR.

## Getting help

Open a draft PR with your sketch and ask in the description, open an issue, or email
vks@andrew.cmu.edu.
