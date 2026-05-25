# DARE Docs Site

Fumadocs-powered documentation site for DARE. The main frontend remains a Vite
app; this docs app builds a static `/docs` site that can be copied into the
frontend `dist/` output.

## Commands

```bash
npm --prefix docs-site install
npm run docs:sync
npm run docs:build
npm run docs:copy
```

Use Node.js 22 for this docs app.
