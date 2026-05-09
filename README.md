# LoreZone 🎌

**Every anime, manga, movie, OVA, and spinoff — grouped under one franchise. Finally.**

Search "Bleach" and see the original anime, manga, 4 movies, Thousand-Year Blood War, all in one place with connections between them.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL |
| Data Source | Jikan API (MyAnimeList) |

---

## Features

- 🔗 **Connected Universes** — every title linked (sequel, prequel, adaptation, spin-off)
- 📺 **Media type tabs** — Anime / Manga / Movie / OVA / Manhwa / Novel all in one franchise page
- ⏱️ **Timeline Explorer** — chronological or release order views
- 🔍 **Global search** — search franchises and titles
- ⭐ **Reviews & ratings**
- 📋 **User lists** — watchlist, readlist, status tracking

---

## Quick Start

### 1. Database
```bash
psql -U postgres -f backend/schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# fill in your DB credentials and JWT_SECRET
npm install
npm run dev
# runs on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# runs on http://localhost:3000
```

---

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/franchises` | All franchises |
| GET | `/api/franchises/:slug` | Franchise + all titles + timelines |
| GET | `/api/titles` | All titles (filter by media_type, franchise_id, search) |
| GET | `/api/titles/:slug` | Single title + connections + reviews |
| GET | `/api/search?q=` | Global search |
| GET | `/api/timelines/:franchise/:timeline` | Timeline view |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/lists/me` | My lists (auth required) |
| POST | `/api/lists` | Create list (auth required) |
| POST | `/api/lists/:id/items` | Add item to list (auth required) |

---

## Project Structure

```
LoreZone/
├── backend/
│   ├── src/index.ts        # Express API
│   ├── schema.sql          # PostgreSQL schema + seed data
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx                          # Homepage
    │   │   ├── franchises/page.tsx               # All franchises
    │   │   ├── franchise/[slug]/page.tsx         # Franchise detail
    │   │   ├── title/[slug]/page.tsx             # Title detail + connections
    │   │   ├── titles/page.tsx                   # Browse all titles
    │   │   ├── search/page.tsx                   # Search
    │   │   └── timeline/[f]/[t]/page.tsx         # Timeline view
    │   └── components/
    │       ├── Navbar.tsx
    │       ├── TitleCard.tsx
    │       └── MediaBadge.tsx
    └── package.json
```

---

## Environment Variables

**backend/.env**
```
PORT=5000
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lorezone
JWT_SECRET=your_secret_here
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

Built by [Gitcoder12](https://github.com/Gitcoder12)
