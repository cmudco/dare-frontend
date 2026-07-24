---
name: run-frontend
description: Start the DARE frontend locally — the Vite dev server on port 5173, wired to a DARE backend on port 8000. Use when the user wants to run, start, boot, or serve the DARE frontend, or asks why the UI loads but chat and data do not work.
---

# Run the DARE frontend

The frontend is a static React/TypeScript SPA served by Vite in development. It talks REST and
Socket.IO to the [DARE backend](https://github.com/cmudco/dare-backend), which must be running
first.

## Prerequisites

- **Node.js 18+**.
- **A running DARE backend** on `http://localhost:8000`. The UI will load without it, but every
  request fails and chat never connects — if the app renders and then shows empty state or auth
  errors, check the backend before debugging the frontend.

## Start it

```bash
npm install
cp .env.example .env
npm run dev
```

Note the env filename is `.env.example` here; the backend repo uses `.example.env`. Point
`VITE_DJANGO_BACKEND_URL` and `VITE_WEBSOCKET_URL` at your backend — the defaults assume
`http://localhost:8000`.

Then open http://localhost:5173. Vite hot-reloads on save.

## Verify

```bash
curl -sI http://localhost:5173 | head -1     # dev server responds
curl -s  http://localhost:8000/api/ready/    # backend is actually up
```

If the page is blank, read the browser console — a failed Socket.IO handshake or a CORS rejection
from the backend is far more common than a build error, and the Vite terminal output will look
clean in both cases.

## Running it in the background

When starting the server from an agent session, detach it so it outlives the session:

```bash
nohup npm run dev > /tmp/dare-frontend.log 2>&1 & disown
lsof -ti tcp:5173        # should print a PID
tail -n 40 /tmp/dare-frontend.log
```

## Stop it

```bash
lsof -ti tcp:5173 | xargs kill
```

If 5173 is already taken, a previous run is still alive — check before starting a second one, or
Vite will quietly move to 5174 and the backend's CORS allowlist will reject it.

## Production bundle

```bash
npm run app:build     # type-check + bundle to dist/
npm run preview       # serve dist/ locally to verify
```

`npm run build` also builds and copies the docs site, which takes considerably longer. Use
`app:build` unless you specifically need the docs output.

## Related

- `check` — what to run before opening a PR.
- `README.md` for the overview, `docs/architecture.md` for the component breakdown.
