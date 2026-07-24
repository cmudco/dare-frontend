# DARE Frontend — Quick Start

Get the frontend running locally in about two minutes. This is all you need for development.
For deploying to a server, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Prerequisites

- **Node.js 18+** (20 LTS recommended)
- A **running DARE backend** — defaults assume `http://localhost:8000` (see [../dare-backend](../dare-backend/))

## Run it

```bash
# 1. Install dependencies
npm install                # or: npm ci

# 2. Configure environment
cp .env.example .env       # defaults already point at a backend on http://localhost:8000

# 3. Start the dev server (Vite, port 5173)
npm run dev
```

Open **http://localhost:5173**. The dev server hot-reloads on save.

That's it. If your backend isn't on `localhost:8000`, point `VITE_DJANGO_BACKEND_URL` and
`VITE_WEBSOCKET_URL` in `.env` at it. Full variable reference: [docs/configuration.md](docs/configuration.md).
