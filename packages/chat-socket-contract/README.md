# Chat socket contract

Canonical source: `cmudco/dare-frontend/packages/chat-socket-contract`.

Shared by DARE and Socratic frontend. Includes chat wire types, transport constants, inbound validation/normalization, outbound room routing and conformance fixtures. Redux, Zustand, authentication lifecycle, reconnect policy, UI and product permissions remain in the apps.

Socket generation fields use snake_case; routing uses camelCase. Replies are camelCase. IDs retain their wire representation; string-based stores use `normalizeMessageId`. `ai_stream.message` is cumulative text; completion releases streaming. Decimal-string costs stay exact. Unknown event types/fields pass through for independently shipped features; malformed known frames are rejected at ingress. No timestamps or billing values are invented.

Both repositories install the exact committed npm archive, avoiding registry/private-repository credentials at deploy time. This is one source package with versioned distribution artifacts, not two editable implementations. Update source here, bump the version, run the conformance tests, then use the root `scripts/pack-chat-contract.mjs` script to distribute the same archive to both checkouts. Commit dependency manifests and archives together, plus the Socratic lockfile (DARE ignores its root lockfile). Do not edit the archive or installed files.
