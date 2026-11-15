# Agent Instructions — Lorezone

Read README.md, CONTRIBUTING.md and FEATURE_UPGRADE_PLAN.md before edits.

- Prioritise the documented JWT/CORS security issues.
- Never weaken authentication, token validation or database constraints for convenience.
- Never commit real secrets or place tokens in frontend code.
- Validate external API payloads and handle provider outages safely.
- Add tests for allowed/disallowed origins, invalid tokens, permissions and malformed inputs.
- Keep dependency upgrades and migrations small and reproducible.
- Work on a branch and open a PR; human approval is required for merge/deploy.
