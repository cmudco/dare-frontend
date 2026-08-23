# DARE Frontend Engineering Rules

These rules are the default for new work and touched code. Exceptions need a concrete reason in the PR.

## 1. Build one typed data flow

Every server-backed feature follows one visible path:

```text
component -> thunk/command -> API or socket client -> backend
component <- selector       <- slice reducer       <- response/event
```

- Define the request, response, and event interfaces before building the UI.
- Use camelCase on the frontend; the backend owns snake_case conversion.
- Normal send, regeneration, retry, and optimistic paths share one request builder.
- Parse and normalize a server payload once at the API/socket boundary.
- Components and reducers consume trusted typed data; they do not recast or reinterpret it.
- Never send raw JSON strings when the wire contract can send a structured object.
- Use separate named fields for unrelated payload shapes instead of a generic `result` union.

## 2. Give state one owner

| State | Owner |
| --- | --- |
| Input focus, open popover, temporary draft | Local component state |
| URL, route filters, shareable navigation | Router/search params |
| Server-backed feature data and cross-page state | Redux slice |
| Derived counts, labels, and filtered views | Memoized selector |
| Remote request lifecycle | Thunk/API state |
| Streaming/socket lifecycle | Socket middleware and reducers |

- Never copy the same server object into multiple slices.
- Never persist values that can be derived reliably from canonical state.
- Components dispatch intent; reducers own state transitions.
- Reducers are pure, deterministic, and idempotent for duplicate socket events.
- Run-scoped data is reset explicitly on regenerate, retry, conversation change, and logout.

## 3. Follow the feature integration cycle

Use the existing repository layout:

```text
src/redux/types/<feature>.ts          wire and state interfaces
src/api/<feature>.ts                  HTTP calls only
src/redux/asyncThunks/<feature>.ts    commands and request lifecycle
src/redux/<feature>Slice.ts           canonical state transitions
src/components/<Feature>/             rendering and local interaction
```

- The API layer knows URLs and transport details, not UI behavior.
- Thunks coordinate API calls and return typed results.
- Slices handle pending, fulfilled, rejected, and socket-event transitions.
- Selectors own reusable derivation.
- Components render state, collect input, and dispatch intent.
- Do not bypass this flow with component-level fetches for shared feature state.

Only add a file or abstraction when it owns a distinct responsibility. A small feature does not need every file shown above.

## 4. Keep contracts explicit

- Reuse one interface for each backend response; do not recreate near-duplicates in components.
- Use interfaces for object shapes and discriminated unions for true variants.
- Avoid `any`, unchecked casts, and broad `Record<string, unknown>` state.
- Use enums or existing domain constants for finite server values; do not scatter string literals.
- Optional fields must represent a real optional state, not uncertainty about the contract.
- Compatibility transforms live in one named adapter with a removal condition.
- If a feature has not shipped, remove obsolete contracts instead of supporting old and new shapes indefinitely.

## 5. Components stay lean

- One exported component per file.
- A component should render one concept and have one reason to change.
- Extract repeated behavior into a hook and repeated visual structure into a component.
- Do not extract one-use wrappers that only rename JSX.
- Keep API parsing, socket normalization, and domain decisions out of components.
- Prefer composition over large boolean-prop matrices.
- Every asynchronous view has explicit loading, empty, error, and success states.
- Interactive controls need an accessible name, keyboard behavior, focus handling, and disabled state.

## 6. Effects are synchronization, not orchestration

- An effect synchronizes React with an external system.
- User actions belong in event handlers; server commands belong in thunks.
- Dependencies must reflect every reactive value the effect reads.
- Do not silence `react-hooks/exhaustive-deps` to force mount-only behavior.
- Split unrelated effects; combine only behavior with the same trigger and cleanup.
- Clean up subscriptions, timers, observers, and socket listeners.
- Avoid state-setting effects when a selector or render-time derivation is sufficient.

## 7. Socket and streaming behavior

- Give every event an explicit TypeScript contract and one reducer owner.
- Include stable message, conversation, tool-call, and run identifiers where applicable.
- Duplicate or late events must not duplicate rows or resurrect stale state.
- Regeneration clears prior run-scoped tool calls, traces, errors, and streaming buffers before new events merge.
- Persisted REST history and live socket events must normalize into the same state shape.
- Do not make components reconcile transport differences.

## 8. Avoid defensive bloat

- Validate at the boundary, then trust the type.
- Do not add repeated `String()`, `Number()`, optional chaining, or default values for impossible states.
- A fallback must be intentional, visible, and tested; never silently hide a broken contract.
- Regex is for bounded syntax, not natural-language classification or UI business policy.
- Delete dead branches, stale flags, compatibility aliases, duplicate formatters, and unused styles in the touched path.
- Do not refactor unrelated screens under a feature commit; record broader cleanup separately.
- Comments explain why or an invariant in one or two lines.
- Do not leave review history, experiments, or benchmark narratives in source comments.

## 9. Styling and design system

- Use Tailwind and the existing Shadcn/Radix primitives.
- Use semantic tokens such as `bg-background`, `text-foreground`, and `border-border`.
- Do not add hardcoded hex colors, gray/slate palettes, or color-only `dark:` overrides.
- Use `cn()` and existing variants for reusable styling.
- Repeated UI patterns become shared components; repeated class strings alone do not justify abstraction.
- Check light and dark modes, narrow and wide layouts, focus states, and reduced motion where relevant.

## 10. Tests are part of the feature

Use the cheapest layer that proves the behavior:

- reducer tests for state transitions, duplicate events, and regeneration resets;
- thunk/API tests for request shape and failure behavior;
- component tests for visible states and user interaction;
- end-to-end tests for socket, navigation, persistence, and backend integration.

Further rules:

- Test loading, empty, error, success, and stale-response cases.
- Pair rejection/security cases with legitimate negative cases.
- Do not assert implementation details when visible behavior or state transitions are authoritative.
- A successful toast is not proof of persistence; verify refreshed server state.
- Avoid real timers and order-dependent shared state in automated tests.

## 11. Micro-examples

Examples clarify a rule; they are not templates to copy blindly.

### Derive instead of duplicating

```typescript
// Bad: activeCount can drift from items.
interface State { items: Memory[]; activeCount: number }

// Good: canonical state plus a selector.
const selectActiveCount = createSelector(selectItems, (items) =>
  items.filter((item) => item.state === MemoryState.ACTIVE).length,
)
```

### Put user actions in handlers

```typescript
// Bad: an effect turns state into an indirect command.
useEffect(() => { if (submitted) dispatch(saveDraft(draft)) }, [submitted])

// Good: the event expresses the intent directly.
const handleSubmit = () => dispatch(saveDraft(draft))
```

### Make socket updates idempotent

```typescript
socketToolCallReceived: (state, action: PayloadAction<ToolCall>) => {
  toolCallsAdapter.upsertOne(state.toolCalls, action.payload)
}
```

### Build one request shape

```typescript
const request = buildConversationRequest(formState)
dispatch(regenerate ? regenerateMessage(request) : sendMessage(request))
```

## 12. Definition of done

A feature is ready only when:

- every field has one type, owner, default, transformation, and consumer;
- send, regenerate, REST history, and socket events agree on one state shape;
- no dead state, duplicate transform, unused flag, or compatibility branch was introduced;
- loading, empty, error, retry, and accessibility behavior are complete;
- lint, formatting, type checks, relevant tests, and production build pass;
- the diff contains no unrelated user work;
- comments and docs describe the final design, not how the patch evolved.

Leave touched code cleaner than you found it, but keep cleanup evidence-driven and inside the feature's path.

## Project conventions

- Keep imports at module scope and group React, third-party, internal, then relative imports.
- Store domain constants with their existing feature constants, not inside components.
- Use typed Redux hooks and existing centralized error handling.
- Validate upload type and size before creating `FormData`.
- Route-protected pages use the existing `ProtectedRoute` pattern.
