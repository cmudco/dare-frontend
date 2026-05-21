# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| 0.1.x | ✅ |
| < 0.1 | ❌ |

Security fixes are backported to the most recent minor release on a best-effort basis.

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Instead, report them privately by emailing:

> **security@<your-domain>** (replace with the maintainer security contact for your deployment)

Or, use [GitHub's private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability) on this repository.

### What to include

- A clear description of the issue and its impact.
- Steps to reproduce, ideally with a minimal proof of concept (HTML / browser steps / network capture).
- Affected version(s) — frontend commit hash and deployed URL if applicable.
- Browser and OS used during reproduction.
- Any suggested mitigation, if known.
- How you'd like to be credited (or whether you'd prefer to remain anonymous).

### What to expect

| Stage | Target time |
|---|---|
| Acknowledge receipt | 3 business days |
| Initial triage and severity assessment | 7 business days |
| Fix development and testing | varies by severity |
| Coordinated disclosure | typically 30–90 days from report |

We will keep you informed throughout the process and credit you in the release notes unless you ask us not to.

## Scope

In scope:

- The DARE frontend SPA in this repository
- Default deployment configurations published in this repository
- First-party JavaScript dependencies pinned in `package-lock.json`

Out of scope:

- Vulnerabilities in third-party services the frontend talks to (LLM providers, Sentry) — report to them directly.
- Vulnerabilities specific to a fork or modified deployment — report to the operator of the service you found them in.
- Self-XSS that requires the user to paste attacker-controlled content into the dev tools console.
- Issues caused exclusively by browser bugs, extensions, or misconfigurations on the client side.
- Lack of security headers when the headers are configured by the static host (set those at the host).

## Common areas of concern

When reporting or reviewing, particularly worth attention:

- **Token handling** — JWTs in localStorage / cookies, refresh logic, leakage via logs or third-party scripts.
- **XSS** — anywhere we render model-generated content (chat messages, artifacts, document previews).
- **CSRF** — for cookie-authenticated mutations, if used.
- **Open redirects** — auth callback flows (email confirmation, password reset) that take a return URL.
- **Dependency vulnerabilities** — flagged by `npm audit` or Dependabot.
- **Misconfigured CSP / CORS** at the static host.

## Safe harbor

We will not pursue or support legal action against researchers who:

- Make a good-faith effort to comply with this policy.
- Avoid privacy violations, destruction of data, and degradation of service.
- Do not exploit a discovered vulnerability beyond the minimum necessary to demonstrate it.
- Give us reasonable time to remediate before public disclosure.

## Hardening recommendations for operators

When deploying the DARE frontend:

- Serve over HTTPS only. Redirect HTTP → HTTPS at the edge.
- Set a strong Content Security Policy. At minimum: lock script and connect sources to your own origin and the configured backend / Sentry endpoints.
- Set `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- Set `Cache-Control: no-cache` on `index.html`; rely on Vite's content-hashed asset names + immutable caching for the rest.
- Keep dependencies current — run `npm audit` regularly and address findings.
- Rotate Sentry auth tokens used in CI.
- Never put secrets in `VITE_*` env variables — they ship to the browser.

Thank you for helping keep DARE and its users safe.
