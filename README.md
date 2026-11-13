# LoreZone

**Explore anime and manga across a connected catalogue of titles, people, and franchises.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

LoreZone is a web application with a Next.js frontend, an Express/TypeScript backend, and a PostgreSQL database. The backend combines live catalogue data from Jikan with selected enrichment from AniList and also exposes database-backed franchise, title, and timeline routes.

## Current Features

- Browse anime and manga catalogue pages.
- Search live anime and manga results through Jikan.
- Open anime and manga detail pages with related metadata.
- Explore seasonal, popular, upcoming, schedule, genre, and people endpoints.
- Store franchise, title, connection, timeline, account, and review schema in PostgreSQL.
- Register and log in through backend authentication endpoints.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | Node.js 20, Express, TypeScript |
| Database | PostgreSQL 15 |
| External catalogue sources | Jikan API and AniList GraphQL |

## Quick Start with Docker Compose

Docker Compose is the easiest way to start the database, API, and frontend together.

```bash
git clone https://github.com/Gitcoder12/Lorezone.git
cd Lorezone
cp .env.example .env
```

Edit `.env` and replace `POSTGRES_PASSWORD` and `JWT_SECRET` with local secrets, then run:

```bash
docker compose up --build
```

Open the frontend at `http://localhost:3000`. The backend health endpoint is `http://localhost:5000/api/health`.

The database schema is mounted as a first-run initialization script. PostgreSQL only runs files in its initialization directory when the data volume is first created. To reinitialize a disposable development database after schema changes, remove the volume explicitly:

```bash
docker compose down -v
docker compose up --build
```

**Warning:** the commands above are for local development. Do not reuse development credentials or expose the database port, JWT secret, or service ports directly in a production deployment without adding production-grade secret management, network restrictions, and TLS.

## Run Services Separately

### 1. Database

Create a PostgreSQL database named `lorezone`, then apply the schema:

```bash
psql -U lorezone -d lorezone -f backend/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Configure `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`, and `JWT_SECRET` in `backend/.env`.

### 3. Frontend

Open another terminal:

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

The frontend expects `NEXT_PUBLIC_API_URL=http://localhost:5000` by default.

## API Overview

The backend currently exposes these route groups:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Backend health |
| GET | `/api/live/search?q=...` | Search live anime and manga |
| GET | `/api/live/anime/:id` | Anime details and relations |
| GET | `/api/live/manga/:id` | Manga details and relations |
| GET | `/api/live/top/:type` | Popular anime or manga |
| GET | `/api/live/season/now` | Current season catalogue |
| GET | `/api/live/upcoming` | Upcoming catalogue |
| GET | `/api/live/schedule` | Schedule data |
| GET | `/api/live/people` and `/api/live/people/:id` | People and creator details |
| GET | `/api/live/genres` and `/api/live/genre/:type/:id` | Genre catalogue and filtered results |
| GET | `/api/franchises` and `/api/franchises/:slug` | Database-backed franchise records |
| GET | `/api/titles` and `/api/titles/:slug` | Database-backed title records |
| GET | `/api/search` | Database-backed search |
| GET | `/api/timelines/:franchise_slug/:timeline_slug` | Franchise timeline |
| POST | `/api/auth/register`, `/api/auth/login` | Account registration and login |

## Project Structure

```text
Lorezone/
├── backend/
│   ├── src/index.ts      # Express API routes and provider integrations
│   ├── schema.sql        # PostgreSQL schema
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/app/          # Next.js route pages
│   ├── src/components/   # Shared interface components
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── .env.example
```

## Scope and Limitations

The database schema includes user-list and review tables, but the current backend route list does not expose a complete user-list or review-management API. Database-backed franchise and title data must be populated before those pages can show project-managed records. Live catalogue routes depend on Jikan and AniList availability and rate limits.

The Docker Compose credentials are intended for a local development environment only. Protect all secrets and use a production deployment design before exposing this service publicly.

## License

MIT. See [LICENSE](LICENSE).

---

## Project handbook

- [Activity log](ACTIVITY_LOG.md) · [Feature upgrade plan](FEATURE_UPGRADE_PLAN.md)
- [Company and team fit](COMPANY_FIT.md) · [README explanation draft](README_ADDENDUM_DRAFT.md)
- [README quality checklist](README_QUALITY_CHECKLIST.md)
- [Contributing](CONTRIBUTING.md) · [Agent instructions](AGENTS.md) · [Agent skills](SKILLS.md)
