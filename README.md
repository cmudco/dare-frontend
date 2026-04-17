# DARE Frontend

React/TypeScript frontend for the DARE AI-powered research and conversation platform. Provides real-time chat with multiple LLM providers, file management with RAG, workflow automation, and a prompt template system.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling and dev server
- **Redux Toolkit** for state management
- **React Router v6** for client-side routing
- **Tailwind CSS** with Shadcn/ui component library (Radix UI primitives)
- **Socket.IO Client** for real-time chat and workflow streaming
- **Formik + Yup** for form validation

## Prerequisites

- Node.js 18+
- [dare-backend](../dare-backend/) running on port 8000

## Getting Started

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your backend URLs:
#   VITE_DJANGO_BACKEND_URL=http://localhost:8000
#   VITE_WEBSOCKET_URL=http://localhost:8000

# Start dev server (runs on port 5173)
npm run dev
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (port 5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |

## Project Structure

```
src/
├── api/                # API layer (one file per domain)
├── components/         # UI components organized by feature
│   ├── ui/             # Shadcn/ui primitives (Button, Dialog, etc.)
│   ├── Conversation/   # Chat interface
│   ├── WorkflowBuilder/# Visual workflow editor
│   ├── FileManager/    # File upload and management
│   ├── Artifacts/      # Artifact display and rendering
│   ├── Layout/         # App layout and navigation
│   └── ...
├── config/             # Feature flags and environment config
├── pages/              # Route-level page components
├── redux/
│   ├── slices/         # Redux state slices
│   ├── asyncThunks/    # Async operations by domain
│   ├── middleware/      # Socket.IO middleware (chat + workflow)
│   ├── types/          # TypeScript interfaces for API shapes
│   └── workflowBuilder/ # Workflow canvas state management
├── routes/             # Route definitions and guards
├── schemas/            # Zod validation schemas (Socket.IO events)
└── utils/              # Shared utilities and constants
```

## Key Features

- **Multi-LLM Chat**: Real-time streaming conversations with OpenAI, Claude, Gemini, and LLaMA models
- **Workflow Builder**: Visual DAG editor for multi-step AI workflows with manual/auto execution modes
- **File Management**: Upload, process, and use files as RAG context in conversations
- **Prompt Templates**: Create, manage, and share reusable prompt templates
- **MCP Integration**: Connect to Model Context Protocol servers for extended tool use
- **Artifact System**: Rich content rendering (code, diagrams, documents) from AI responses

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_DJANGO_BACKEND_URL` | DARE backend URL | `http://localhost:8000` |
| `VITE_WEBSOCKET_URL` | Socket.IO server URL | `http://localhost:8000` |
| `VITE_ENABLE_MCP` | Enable MCP feature | `false` |
| `VITE_ENABLE_MEMORY` | Enable Memory feature | `false` |

## Related Projects

- [dare-backend](../dare-backend/) - Django REST + Socket.IO backend
- [socraticbooks-backend](../socraticbooks-backend/) - Educational platform backend
- [socraticbooks-react](../socraticbooks-react/) - Educational platform frontend
