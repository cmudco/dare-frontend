# Shared chat contract

Both frontends now consume `@cmudco/chat-socket-contract` version 0.1.0. Its canonical source lives in `cmudco/dare-frontend/packages/chat-socket-contract`; do not copy or edit an application-specific implementation.

The package owns wire types, event vocabulary, transport constants, runtime validation, message normalization, active-room routing and shared fixtures. Product features, state stores, retry policies, cancellation UI and permissions remain in their app. Unknown extension events/fields pass through; malformed known events are logged and ignored at ingress. String-based Socratic stores normalize IDs with the package helper; DARE retains the numeric IDs used by its REST history.

## Updating the contract

1. Change the source package in the DARE frontend checkout and bump its version.
2. Run `node scripts/pack-chat-contract.mjs /path/to/socraticbots-frontend` from that checkout. It builds/tests the package, packs one archive and installs that exact artifact in both repositories.
3. Run `npm run test:chat-contract` and each app build, plus the app-specific browser/socket regressions. The DARE check also compares source/compiled output with the installed artifact and fails if the archive is stale.
4. Commit the dependency manifests and versioned archive in both repos, plus the Socratic lockfile. DARE currently ignores its root lockfile; the archive is still committed and source-checked.
5. Open paired PRs. Neither app needs npm publishing or extra repository credentials to install the committed archive. Normal installs and deployments use their local `vendor/` archive.

Both PR workflows run the same package conformance suite and their app build. For breaking changes, retain backend compatibility until both consumers are deployed. Contract extraction itself requires no backend migration.

## Checks for this extraction

- The same 20 conformance tests pass against each installed artifact, covering streams, history, decimal/null usage, diagnostics, tools, progress, malformed events, opaque model IDs and room routing.
- Socratic authenticated/public browser regressions pass for completion, second send, metadata, errors and outgoing payload parity.
- Both production app builds pass. DARE full lint and Socratic changed-file lint pass.
- Local browser login/history and live provider response verification use the existing DARE/Socratic databases.
