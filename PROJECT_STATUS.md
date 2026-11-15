# Project Status — Lorezone

**Snapshot date:** 2026-11-16  
**Status type:** Initial documentation and repository-tree assessment  
**Default branch:** main  
**Review completeness:** Partial — not a code audit or release certification

## Project purpose
Anime/manga catalogue web application using a Next.js frontend, Express/TypeScript backend, PostgreSQL and Jikan/AniList catalogue sources, according to README.

## Current maturity (README-declared or visible scaffolding; not independently verified)
README documents browse/search/detail/season/people/genre and account features, Docker Compose setup and API route groups. Root includes frontend/, backend/, Docker Compose and deployment reports. These claims have not been exercised in this status pass.

## Observed repository structure
frontend/, backend/, app.js, browse.html, detail.html, style.css, docker-compose.yml, .env.example, deployment reports and README.

## Known issues and risks to investigate
Authentication, JWT handling, database initialization, external API quotas and user-generated reviews are security-sensitive. README suggests `docker compose down -v`, which deletes the local DB volume; ensure this is labelled destructive and never used with user data. No tests/build/containers run.

## Recommended next actions
Run separate frontend/backend tests and Docker Compose clean-start; inspect auth/session/password handling and SQL parameterization; validate AniList/Jikan terms/rate limits and caching; check database migrations and volume backup/recovery; verify every README API route exists.

## Verification record
| Check | Result |
|---|---|
| Default-branch top-level tree | Inspected |
| README | Inspected |
| Deep source review | Not performed |
| Tests / build / runtime | Not run |
| Security / dependency audit | Not run |
| Live deployment / API checks | Not run |
| Independent review | Not performed |

## Change log
- 2026-11-16: Added this initial status snapshot on a review branch. No application code or existing data changed.

> Update this file only after the corresponding inspection or verification has actually been performed. Distinguish observed facts, README claims, hypotheses and unrun checks.