# Lorezone — Activity Log

**Snapshot:** 2026-11-13

## Verified findings and history

Issue #3 identifies unrestricted CORS and a hard-coded fallback JWT secret. No source files were changed as part of that issue; security hardening remains outstanding: https://github.com/Gitcoder12/Lorezone/issues/3

## Current implementation

Next.js frontend, Express/TypeScript backend and PostgreSQL data model. It uses Jikan for live catalogue data and selected AniList enrichment, with database-backed title/franchise/timeline routes and account authentication. Issue #3 records unrestricted CORS and a weak fallback JWT secret; treat those as security blockers before public deployment.

## Append-only record

| Date | Contributor / agent | Issue / PR | Files / scope | Validation command / environment | Result | Evidence / caveats |
|---|---|---|---|---|---|---|
| YYYY-MM-DD | name | link | paths | exact command | pass / fail / not run | evidence |

Record vulnerabilities, remediation, tests and limitations. Never claim secure production deployment until authentication, CORS, dependency and API checks have actually passed.
