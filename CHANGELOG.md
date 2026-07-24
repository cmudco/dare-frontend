# Changelog

All notable changes to the DARE frontend are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Documentation overhaul: added `QUICKSTART.md`, `DEPLOYMENT.md`, `docs/configuration.md`, expanded `docs/architecture.md`, `CONTRIBUTING.md`, `SECURITY.md`, and `CHANGELOG.md`.
- Split setup docs by intent: `QUICKSTART.md` is the short "run it locally" guide (`npm install` → env → `npm run dev`); `DEPLOYMENT.md` (renamed from `INSTALL.md`) covers production — building the static bundle, serving `dist/`, and an optional Docker recipe.

---

## [0.1.0] — Initial Release

First public release of the DARE frontend. Pairs with DARE backend `0.1.0`.

### Added

#### Application shell

- React 18 + TypeScript SPA, built with Vite.
- React Router v6 routing with public, protected, and feature-flagged routes.
- App layout with collapsible sidebar, header, and theme toggle.
- Light/dark mode with persisted preference and system-preference detection.

#### State management

- Redux Toolkit store with per-domain slices: `user`, `files`, `conversation`, `prompt`, `websocket`, `tags`, `workflow`, `billing`, `theme`, `notification`.
- `createAsyncThunk` wrappers for every REST integration.
- Type-safe `useSelector` / `useDispatch` hooks.

#### Authentication

- Email + password login, registration with access code, password reset, and email confirmation flows.
- JWT storage and refresh via axios interceptors.
- Protected route wrapper.

#### Multi-LLM chat

- Real-time streaming conversations against all backend-supported providers (OpenAI, Anthropic, Google, Ollama).
- Model picker with availability driven by the user's model groups.
- Per-message like/dislike feedback with optional comment.
- Conversation list, search, rename, delete, and clone.
- Token usage and cost displayed per message.

#### File management

- Drag-and-drop upload with progress and processing status (`PROCESSING` / `COMPLETED` / `FAILED`).
- Tag system and folder organization.
- Per-conversation file attachment for RAG queries.

#### Prompt templates

- Create, edit, share, and reuse parameterized prompt templates.
- Variable substitution at send time.

#### Workflow builder

- Visual DAG canvas (nodes, edges, undo/redo).
- Manual and auto execution modes.
- `/workflow` Socket.IO namespace integration with Zod-validated events.
- Per-step output streaming, batch run support.

#### Artifacts

- Rich rendering of model-emitted artifacts: code blocks (with syntax highlighting), diagrams, document previews.
- Copy and download affordances.

#### MCP integration (feature-flagged)

- UI for selecting and connecting to Model Context Protocol servers.
- Tool-call surfacing inside conversations.

#### Observability

- Sentry client integration.
- Toast notifications for user-facing success/error states.

#### Tooling

- ESLint + Prettier + Husky + lint-staged for pre-commit quality.
- Tailwind CSS + Shadcn/ui (Radix primitives) component system.
- Path alias `@/` → `src/`.
- Vite asset fingerprinting and route-level code splitting.

### Known limitations

- Test coverage is partial.
- The MCP and Memory features ship behind feature flags and are off by default.
- No offline mode — the app requires connectivity to the DARE backend.
