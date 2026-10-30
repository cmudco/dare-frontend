# Security policy

This page tells you how to report a vulnerability in the DARE frontend and what happens next.

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |
| < 0.1   | No        |

Security fixes are backported to the most recent minor release on a best-effort basis.

## Reporting a vulnerability

Do not report security vulnerabilities through public GitHub issues, discussions or pull requests.

Use
[GitHub's private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability)
on this repository. If private reporting is not enabled, email vks@andrew.cmu.edu before you
disclose anything publicly.

### What to include

- A clear description of the issue and its impact
- Steps to reproduce, ideally a minimal proof of concept (HTML, browser steps or a network capture)
- Affected versions: frontend commit hash, and the deployed URL if relevant
- The browser and OS you used
- Any mitigation you suggest
- How you would like to be credited, or whether you prefer to stay anonymous

### What to expect

| Stage                                  | Target time                      |
| -------------------------------------- | -------------------------------- |
| Acknowledge receipt                    | 3 business days                  |
| Initial triage and severity assessment | 7 business days                  |
| Fix development and testing            | Varies by severity               |
| Coordinated disclosure                 | Typically 30–90 days from report |

We keep you informed throughout and credit you in the release notes unless you ask us not to.

## Scope

In scope:

- The DARE frontend SPA in this repository
- Default deployment configurations published in this repository
- First-party JavaScript dependencies pinned in `package-lock.json`

Out of scope:

- Vulnerabilities in third-party services the frontend talks to (LLM providers, Sentry). Report
  those to the provider.
- Vulnerabilities specific to a fork or modified deployment. Report those to whoever runs it.
- Self-XSS that requires the user to paste attacker-controlled content into the dev tools console
- Issues caused only by browser bugs, extensions or client-side misconfiguration
- Missing security headers when the static host sets the headers (set them at the host)

Areas that deserve the most attention:

- **Token handling.** The JWT in `localStorage`, expiry handling, and leaks through logs or
  third-party scripts.
- **XSS.** Anywhere model-generated content is rendered: chat messages, artifacts, document
  previews.
- **CSRF.** For cookie-authenticated mutations, if any.
- **Open redirects.** Auth callback flows (email confirmation, password reset) that take a return
  URL.
- **Dependency vulnerabilities.** Flagged by `npm audit` or Dependabot.
- **CSP and CORS.** Misconfiguration at the static host.

## Safe harbor

We will not pursue or support legal action against researchers who:

- Make a good-faith effort to comply with this policy
- Avoid privacy violations, destruction of data and degradation of service
- Do not exploit a vulnerability beyond the minimum needed to demonstrate it
- Give us reasonable time to fix it before public disclosure

## Hardening notes

When you deploy the DARE frontend:

- Serve over HTTPS only, and redirect HTTP to HTTPS at the edge.
- Set a strong Content Security Policy. At minimum, lock script and connect sources to your own
  origin and the configured backend and Sentry endpoints.
- Set `Strict-Transport-Security`, `X-Content-Type-Options: nosniff` and
  `Referrer-Policy: strict-origin-when-cross-origin`.
- Set `Cache-Control: no-cache` on `index.html`, and rely on Vite's content-hashed asset names with
  immutable caching for the rest.
- Keep dependencies current: run `npm audit` regularly and fix what it finds.
- Never put secrets in `VITE_*` variables. They ship to the browser.
