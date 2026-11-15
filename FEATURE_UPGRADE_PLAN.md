# Lorezone — Feature Upgrade Plan

## Objective

A website for browsing anime and manga, searching a catalogue and exploring related titles, franchises and timelines.

## P0 — security and correctness

- [ ] Remove the fallback JWT secret and fail startup when a strong secret is missing; configure a CORS allowlist.
- [ ] Add tests for authentication, token expiry, invalid payloads, origins and permission boundaries.

## P1 — reliability and developer experience

- [ ] Document external provider quotas, caching, attribution and schema failure behavior.
- [ ] Add migration checks, database constraints and a reproducible local development seed.

## P2 — scale and trust

- [ ] Add observability and load tests for catalogue/search routes.
- [ ] Add moderation and abuse controls for user-generated reviews and profile data.

## Contributor work packages

1. Authentication secret and CORS hardening with regression tests.
2. Provider adapter contract, caching and quota handling.
3. Database schema/migration validation.
4. Account/review abuse controls and load tests.

## Definition of done

- [ ] App refuses to start with missing/weak JWT secret.
- [ ] CORS accepts only configured origins.
- [ ] Auth and permission tests cover positive and negative cases.
- [ ] External provider and database failures are observable and handled.
