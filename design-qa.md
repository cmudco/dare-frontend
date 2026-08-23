# Notification popover design QA

- Source visual truth: `/var/folders/r_/1564_90n1x9gdhcg04538xs80000gn/T/TemporaryItems/NSIRD_screencaptureui_fOVduP/Screenshot 2026-08-23 at 5.39.28 AM.png`
- Implementation screenshot: `/private/tmp/dare-notification-popover-compact.png`
- Browser viewport: 1512 × 771 CSS px at 1× density
- Source pixels: 670 × 756; implementation pixels: 1512 × 827; popover target: 544 × 464
- State: authenticated DARE dashboard, notification popover open, All filter selected, populated read and unread notifications

## Full-view comparison evidence

The original 320 px popover truncated titles and messages with ellipses. The revised responsive 544 px popover fits the desktop viewport, preserves the surrounding page, and keeps a bounded vertical scroll region without feeling oversized.

## Focused-region comparison evidence

The source and compact implementation were reviewed together. Long notification titles and messages wrap across lines in the revised component with no line clamp or visible ellipsis. Each complete notification remains readable before its timestamp and separator.

## Fidelity surfaces

- Fonts and typography: existing product font, weights, and hierarchy are preserved; title and body wrapping is now unrestricted.
- Spacing and layout rhythm: width is responsive up to 34 rem; list height is the smaller of 29 rem and 60 vh; item spacing remains consistent.
- Colors and visual tokens: existing semantic warning, unread, hover, border, and surface tokens are unchanged.
- Image quality and assets: no raster assets are present in this component; existing icon-library icons are preserved.
- Copy and content: complete notification titles, messages, dates, and filter labels are visible without truncation.

## Comparison history

- P1 before: notification content was materially unreadable because the 320 px panel used one-line title and two-line message clamps.
- Fix: responsive panel width and height were increased; title and message clamps were removed; text now wraps and breaks safely.
- Post-fix evidence: the compact capture shows complete content for every fully visible notification while retaining scroll for the remaining history.

## Findings

No actionable P0, P1, or P2 visual issues remain for the requested DARE change.

The browser console contains the existing local Socket.IO connection errors and React Router future-flag warnings; no notification-popover render or interaction error was observed.

## Follow-up polish

None required for this scope.

final result: passed

# CMU Documents availability design QA

- Source visual truth: `/var/folders/r_/1564_90n1x9gdhcg04538xs80000gn/T/codex-clipboard-f7587f75-c9d1-4a99-a2e1-d7b7bac4d550.png`
- Implementation: `http://localhost:5173`
- State contract: the Documents picker is present only when MCP is enabled and the signed-in user has an active, credential-ready connection to the active `quillmark` server.

## Findings

The existing composer layout and picker are unchanged for connected CMU Documents users. For users without that server connection, the entire Documents control is omitted rather than leaving an unusable production tab. Server and Tools controls retain their original placement and behavior.

The production TypeScript/Vite build, scoped ESLint check, and scoped Prettier check pass. No P0, P1, or P2 visual or interaction issues remain for this conditional-visibility change.

final result: passed
