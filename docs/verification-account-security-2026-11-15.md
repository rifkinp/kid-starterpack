# Account security and npm 0.1.1 verification

## Published CLI

`create-kid-starter@0.1.1` was published after the owner completed npm's browser 2FA approval. Registry metadata confirmed both version `0.1.1` and the `latest` tag. A registry-installed copy generated an isolated Elysia project with `--git`; its new Git HEAD pointed to `main`, without bringing repository history into the project. Source for this package was pushed at commit `260eda4029bcfa619d799e687edc7772308272ad`.

The npm publication does not publish or deploy the later fullstack application changes.

## Fullstack changes

- Both starters provide protected `/settings` and public verification-resend pages, with navigation from the dashboard/login flows.
- PostgreSQL: display-name updates with server validation, current-password-checked password changes, safe active-session metadata and other-device signout. Settings page data excludes raw session tokens.
- PostgreSQL: email verification is now required by default. Signup issues no session before verification; verification links do not auto-sign the user in. Verification and reset share a production email transport that fails when unconfigured or unavailable, with links logged only during development.
- Supabase: session-validated profile actions, password recovery to the authenticated account email, other-device refresh-session revocation, and fixed-destination confirmation/recovery routes supporting token-hash email templates. Editable display metadata is never used for authorization.
- No new runtime dependency or database schema migration is included. `REQUIRE_EMAIL_VERIFICATION=true` is documented in the PostgreSQL environment example; existing unverified users must verify before their next sign-in.

## Local verification

| Check | Result |
| --- | --- |
| Maintainer regression tests | 23 passed |
| CLI regression tests | 12 passed before release; package lifecycle tests also passed during publication |
| PostgreSQL email transport tests | 3 passed |
| Supabase route tests | 16 passed: settings, provider failures, reset, resend, PKCE allowlists and token-hash confirmation |
| Website and both fullstack Svelte checks | Passed with no application errors or warnings |
| Website and both fullstack builds | Passed |
| Isolated fullstack extraction | Both passed frozen install, checks, tests, build and HTTP welcome/404 smoke |
| PostgreSQL HTTP integration | Passed on temporary PostgreSQL WASM via the pg protocol: unverified-login denial, confirmation, profile validation, settings without tokens, password change, other-session revocation, task isolation and password reset |
| Lint, diff whitespace and 400-line limit | Passed |

Module tests attach their unused HMR server to an unbound HTTP server so concurrent test files do not compete for Vite's default WebSocket port. This changes test resources only, not application HMR.

Native PostgreSQL verification runs in the existing CI service job after pushing this branch. The local WASM result does not establish native PostgreSQL deployment behavior; remote CI status should be checked for the final commit.

## External verification still required

The owner previously requested Supabase test preparation without provisioning a disposable project. Supabase live provider/RLS tests remain unrun. The prepared provider suite now also checks display-name changes and other-device refresh-token revocation, but cannot prove browser/inbox behavior without the configured external environment.

Resend delivery to a real inbox, Supabase email-template setup, links opened across browsers, secure production cookies and deployed-host behavior remain separate verification requirements. Supabase access tokens may stay usable until expiry after other-device signout; its UI explicitly distinguishes this from refresh-token revocation. Better Auth session freshness can require reauthentication for session-management operations.

See the two template READMEs for setup and the root [testing guide](testing.md) for repeatable commands. No production services, real user accounts or databases were modified by the template checks.
