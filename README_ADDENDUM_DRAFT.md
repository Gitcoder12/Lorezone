# Lorezone — README Explanation Draft

## In plain language

A website for browsing anime and manga, searching a catalogue and exploring related titles, franchises and timelines.

## How it works

A visitor can browse and search anime/manga titles, open detail pages and explore connected franchise or timeline information. An account system supports registration and login. Live catalogue information depends on external providers.

## Technical explanation

Next.js frontend, Express/TypeScript backend and PostgreSQL data model. It uses Jikan for live catalogue data and selected AniList enrichment, with database-backed title/franchise/timeline routes and account authentication. Issue #3 records unrestricted CORS and a weak fallback JWT secret; treat those as security blockers before public deployment.

Document route groups, data models, provider adapters, cache behavior, authentication/session design, migrations and local setup. Explain how provider outages affect results.

## Security notes

The fallback JWT secret and unrestricted CORS issue must be fixed and verified before any public deployment. Never put secrets in frontend code or sample commits.

## Contribution

See FEATURE_UPGRADE_PLAN.md, CONTRIBUTING.md and ACTIVITY_LOG.md.
