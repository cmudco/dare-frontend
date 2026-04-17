# Frontend Architecture

## State Management

Redux Toolkit with two Socket.IO middleware files:

```
redux/
├── middleware/
│   ├── socketMiddleware.ts         # /chat namespace — chat, messages, artifacts, voice
│   └── workflowSocketMiddleware.ts # /workflow namespace — execution, steps, batch
├── slices/                         # State slices by domain
├── asyncThunks/                    # Async operations by domain
└── workflowBuilder/                # Workflow canvas state (nodes, edges, history)
```

## Socket.IO Events

For the full event contract (payload schemas, directions, namespaces) see the [dare-backend Socket.IO docs](https://github.com/your-org/dare-backend/blob/main/docs/architecture/socketio-events.md).

**Key rule:** All incoming `/workflow` events are validated with Zod schemas before Redux dispatch — see [src/schemas/workflowSocket.ts](../src/schemas/workflowSocket.ts).

## API Layer

```
src/api/              # One file per domain
src/redux/types/      # TypeScript interfaces matching API response shapes
src/redux/asyncThunks/ # createAsyncThunk wrappers for each API call
```

Integration cycle: `Component → dispatch(thunk) → api/ function → Backend → slice handles states`

## Component Organization

```
src/components/
├── ui/               # Shadcn/ui primitives (Button, Dialog, etc.) — reusable
├── Conversation/     # Chat interface — domain-specific
├── WorkflowBuilder/  # Visual workflow editor — domain-specific
├── Artifacts/        # AI artifact rendering — domain-specific
├── FileManager/      # File upload/management — domain-specific
└── Layout/           # App shell and navigation
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_DJANGO_BACKEND_URL` | DARE backend REST URL (default: `http://localhost:8000`) |
| `VITE_WEBSOCKET_URL` | Socket.IO server URL (default: `http://localhost:8000`) |
| `VITE_ENABLE_MCP` | Enable MCP feature flag |
| `VITE_ENABLE_MEMORY` | Enable Memory feature flag |
