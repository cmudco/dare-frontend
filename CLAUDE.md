# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the React frontend of the DARE project.

## Project Architecture

This is a React/TypeScript frontend for an AI-powered research and conversation platform with real-time WebSocket communication, file management, and multi-LLM support.

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Code quality
npm run lint      # ESLint
npm run format    # Prettier
npm run preview   # Preview build

# Package management
npm install       # Install dependencies
```

## Tech Stack & Patterns

### Core Technologies
- **React 18**: Functional components with hooks
- **TypeScript**: Full type safety
- **Vite**: Build tool and dev server
- **Redux Toolkit**: State management with RTK Query
- **React Router v6**: Client-side routing
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Headless component primitives
- **Shadcn/ui**: Component library built on Radix UI

### State Management Architecture

**Redux Store Structure:**
```typescript
store: {
  user: userSlice,           // Authentication & user preferences
  files: fileSlice,          // File upload & management
  conversation: conversationSlice, // Chat state & messages
  prompt: promptSlice,       // Prompt templates
  websocket: websocketSlice, // Real-time connection state
  tags: tagsSlice,           // File tagging system
  workflow: workflowSlice,   // Automation workflows
  billing: billingSlice,     // Usage tracking & billing
  theme: themeSlice,         // Dark/light mode
  notification: notificationSlice // Toast notifications
}
```

**Redux Patterns:**
- Use `createSlice` for all state slices
- Async operations with `createAsyncThunk`
- Type-safe hooks: `useSelector<RootState>` and `useDispatch<AppDispatch>`
- Normalized state structure for complex data

### Component Architecture

**Component Organization:**
```
src/components/
├── ui/              # Reusable UI components (Shadcn/ui)
├── Auth/            # Authentication components
├── Conversation/    # Chat interface components
├── FileManager/     # File upload & management
├── Dashboard/       # Analytics & overview
└── Layout/          # Layout components
```

**Component Patterns:**
- Functional components with TypeScript interfaces
- Custom hooks for reusable logic
- Compound component pattern for complex UI
- Controlled components with form libraries (Formik)

### Styling Patterns

**Tailwind CSS Architecture:**
- Custom design system via `tailwind.config.ts`
- CSS custom properties for theme switching
- Brand gradient: `bg-dare-gradient`
- Dark mode support with `dark:` prefix
- Component variants using `class-variance-authority`

**Design System:**
```typescript
// Custom colors
colors: {
  'dare': 'hsl(var(--dare))',
  'dark-primary': '#030a12',
  'dark-blue': '#162B4B',
  // Brand gradient
  'dare-gradient': 'linear-gradient(92.18deg, #EE183C -38.97%, #023572 132.6%)'
}
```

**Component Styling Pattern:**
```typescript
import { cn } from '@/lib/utils'

const Button = ({ className, variant, ...props }) => (
  <button 
    className={cn(buttonVariants({ variant }), className)}
    {...props}
  />
)
```

### API Integration Patterns

**API Layer Structure:**
```
src/api/
├── config.ts         # Base URLs & configuration
├── auth.ts           # Authentication endpoints
├── conversation.ts   # Chat endpoints
├── files.ts          # File management endpoints
└── index.ts          # Exports
```

**Request Pattern:**
```typescript
export const getConversationsAPI = async (): Promise<ConversationResponse> => {
  return await baseRequest<ConversationResponse>({
    url: 'api/conversations/',
    method: METHOD.GET,
  })
}
```

**Error Handling:**
- Centralized error handling in `utils/errorHandler.ts`
- Axios interceptors for token refresh
- User-friendly error messages extracted from API responses

### Real-time Communication

**WebSocket Integration:**
- Custom WebSocket middleware in Redux
- Connection state management
- Message streaming for AI responses
- Automatic reconnection handling

**WebSocket Pattern:**
```typescript
// Connection management
dispatch(connectWebSocket({ conversationId, token }))

// Message handling
useEffect(() => {
  if (wsMessage?.message) {
    dispatch(addStreamingMessage(wsMessage))
  }
}, [wsMessage])
```

### Form Management

**Form Patterns:**
- **Formik** for complex forms with validation
- **Yup** for schema validation
- Controlled components with proper TypeScript typing
- Error state management and display

**Form Structure:**
```typescript
interface FormValues {
  field: string
}

const validationSchema = yup.object({
  field: yup.string().required('Field is required')
})
```

### Route Architecture

**Route Organization:**
```typescript
// Protected routes
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Public routes
<Route path="/login" element={<LoginScreen />} />
```

**Route Patterns:**
- Protected route wrapper component
- Route listener for analytics
- Dynamic route parameters with TypeScript
- Programmatic navigation with `useNavigate`

### File Upload & Management

**File Upload Pattern:**
- Drag-and-drop interface with visual feedback
- Background processing with status polling
- Tag-based organization system
- Folder support for file grouping

**File Processing States:**
```typescript
enum FileStatus {
  PROCESSING = 1,
  COMPLETED = 2,
  FAILED = 3
}
```

### UI Component Patterns

**Shadcn/ui Integration:**
- Headless components from Radix UI
- Customizable via CSS custom properties
- Consistent component API patterns
- Theme-aware styling

**Component Composition:**
```typescript
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Utility Functions

**Common Utilities:**
- `cn()`: Tailwind class merging utility
- `debounce()`: Input debouncing
- `errorHandler()`: Centralized error processing
- `localStorage()`: Type-safe local storage
- `conversationUtils()`: Chat-specific helpers

### TypeScript Patterns

**Type Organization:**
```
src/redux/types/
├── conversation.ts   # Chat-related types
├── files.ts         # File management types
├── user.ts          # User & auth types
└── ...
```

**Type Patterns:**
- Interface over type aliases for object shapes
- Strict typing for API responses
- Generic types for reusable components
- Discriminated unions for state management

### Environment Configuration

**Environment Variables:**
```typescript
// src/api/config.ts
export const BASE_URL = import.meta.env.VITE_DJANGO_BACKEND_URL
export const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL
```

**Vite Configuration:**
- Path aliases (`@/` points to `src/`)
- Environment-specific builds
- Asset optimization

### Development Patterns

**Code Quality:**
- **ESLint**: Consistent code style
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks
- **lint-staged**: Pre-commit formatting

**Performance Patterns:**
- Component lazy loading
- Memoization with `useMemo` and `useCallback`
- Virtual scrolling for large lists
- Image optimization

### Testing Considerations

- Component testing with React Testing Library
- Redux state testing
- WebSocket connection mocking
- API endpoint mocking

### Dark Mode Implementation

**Theme System:**
```typescript
// Theme slice pattern
const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: 'light' },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
    }
  }
})
```

**CSS Custom Properties:**
- Light/dark theme tokens
- Automatic system preference detection
- Persistent theme selection

### Common Development Tasks

**Adding New Components:**
1. Create component in appropriate directory
2. Define TypeScript interfaces
3. Implement with Tailwind styling
4. Add to component exports

**Adding New API Endpoints:**
1. Define types in `redux/types/`
2. Create API function in `api/`
3. Add async thunk if needed
4. Update Redux slice

**Adding New Routes:**
1. Create page component
2. Add route to `AppRoutes.tsx`
3. Update navigation if needed
4. Add protection if required

### Bundle Optimization

- Code splitting at route level
- Dynamic imports for heavy components
- Tree shaking for unused dependencies
- Asset compression and optimization