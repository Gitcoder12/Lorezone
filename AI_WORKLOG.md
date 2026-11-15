# AI Worklog

## Assessment
- Date: 2026-11-15
- Branch: `docs/portfolio-operating-kit-2026-11-13`
- Recommendation: Improve; security hardening required before public deployment
- Maturity: Multi-service web application prototype with Next.js frontend, Express/TypeScript backend, PostgreSQL schema, and external catalogue APIs.

## Purpose and implemented scope
LoreZone provides anime/manga discovery, detail pages, creator and schedule endpoints, database-backed franchise/title/timeline routes, and account registration/login.

Verified implementation:
- Next.js frontend with package manifest and lockfile.
- Express/TypeScript backend with package manifest, Dockerfile, PostgreSQL schema, and environment example.
- Jikan and AniList integrations.
- Backend registration/login endpoints using bcrypt and JWT.
- Docker Compose development setup documented in README.

## Findings
### P1 — JWT uses a hard-coded fallback secret
Both registration and login sign tokens with `process.env.JWT_SECRET || 'secret'`. If the environment variable is missing, the application uses a predictable signing key. Fail startup when the secret is missing or too weak; never use a fallback in a deployed environment.

### P1 — CORS allows every origin
The backend calls `app.use(cors())` without an origin allow-list. Restrict production origins and define a separate local-development configuration.

### P1 — No automated test suite or CI found in inspected root tree
No backend/frontend test directories or `.github/workflows` were found in the inspected tree. Authentication, database queries, external API adapters, and frontend routes need regression coverage and CI.

### P2 — External API resilience is incomplete
Jikan requests have no explicit timeout or retry/backoff policy. AniList failures are caught and converted to null, which can hide provider outages. Add timeouts, bounded retries, provider-specific error states, and structured logs without leaking secrets.

### P2 — Backend dependency reproducibility is weaker than frontend
The frontend has a lockfile; the inspected backend tree has `package.json` but no backend lockfile. Add and commit a lockfile after confirming the intended package manager.

### P2 — Request validation and error responses need hardening
Several routes accept query/path values and return raw error messages. Add schema validation, bounded pagination, safe error responses, and request-size limits.

## Checks and evidence
- Inspected README, root tree, backend/frontend manifests, backend Dockerfile, environment examples, and `backend/src/index.ts`.
- Confirmed `cors()` with no options and JWT fallback literal `'secret'` in registration/login.
- No local build, database migration, or test execution: NOT RUN.
- No CI workflow or tests were found in the inspected root tree.
- Independent model review: NOT PERFORMED.
- Live Jikan/AniList API availability: NOT RUN.

## Next actions
1. Remove JWT fallback and validate required environment at startup.
2. Restrict CORS to configured origins.
3. Add auth, DB, route, and external-provider tests.
4. Add backend lockfile and CI for both services.
5. Add input validation, bounded pagination, timeouts, retry policy, and safe error handling.
