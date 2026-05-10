import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const JIKAN = process.env.JIKAN_BASE || 'https://api.jikan.moe/v4';
const ANILIST = 'https://graphql.anilist.co';

export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
});

app.use(cors());
app.use(express.json());

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function jikanGet(path: string) {
  const url = `${JIKAN}${path}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`Jikan ${res.status}: ${path}`);
  return res.json();
}

// Anilist GraphQL — fetches high-quality banner + cover images
async function anilistGet(query: string, variables: Record<string, unknown>) {
  try {
    const res = await fetch(ANILIST, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

const ANILIST_MEDIA_QUERY = `
query ($search: String, $type: MediaType) {
  Media(search: $search, type: $type, sort: POPULARITY_DESC) {
    id
    title { romaji english native }
    bannerImage
    coverImage { extraLarge large color }
    description(asHtml: false)
    averageScore
    popularity
    status
    episodes
    chapters
    volumes
    startDate { year month day }
    endDate { year month day }
    studios(isMain: true) { nodes { name siteUrl } }
    staff(sort: RELEVANCE, perPage: 5) {
      edges {
        role
        node { name { full } siteUrl image { large } }
      }
    }
    relations {
      edges {
        relationType(version: 2)
        node {
          id type title { romaji english }
          coverImage { large }
          status
        }
      }
    }
    genres
    tags { name rank isMediaSpoiler }
    trailer { id site }
    externalLinks { url site icon color }
    nextAiringEpisode { airingAt episode }
    season seasonYear
  }
}`;

const ANILIST_PERSON_QUERY = `
query ($search: String) {
  Staff(search: $search, sort: FAVOURITES_DESC) {
    id
    name { full native }
    image { large }
    description(asHtml: false)
    primaryOccupations
    dateOfBirth { year month day }
    homeTown
    siteUrl
    staffMedia(sort: POPULARITY_DESC, perPage: 10) {
      edges {
        staffRole
        node {
          title { romaji english }
          coverImage { large }
          type popularity
        }
      }
    }
  }
}`;

// ─── Health ───────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), jikan: JIKAN });
});

// ─── LIVE: Jikan + Anilist combined ──────────────────────────────────────────

// Search — returns MAL results (fast)
app.get('/api/live/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || (q as string).length < 2) return res.json({ anime: [], manga: [] });
    const [anime, manga] = await Promise.all([
      jikanGet(`/anime?q=${encodeURIComponent(q as string)}&limit=8&sfw=true`),
      jikanGet(`/manga?q=${encodeURIComponent(q as string)}&limit=5&sfw=true`),
    ]);
    res.json({ anime: anime.data || [], manga: manga.data || [] });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Single anime — Jikan full + Anilist banner/extra
app.get('/api/live/anime/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [main, relations, characters] = await Promise.all([
      jikanGet(`/anime/${id}/full`),
      jikanGet(`/anime/${id}/relations`),
      jikanGet(`/anime/${id}/characters`),
    ]);
    const d = main.data;
    // Fetch Anilist for banner image
    const aniTitle = d?.title_english || d?.title;
    let aniData = null;
    if (aniTitle) {
      await sleep(200);
      const result = await anilistGet(ANILIST_MEDIA_QUERY, { search: aniTitle, type: 'ANIME' });
      aniData = result?.Media || null;
    }
    res.json({
      ...d,
      relations: relations.data || [],
      characters: (characters.data || []).slice(0, 20),
      anilist: aniData,
      bannerImage: aniData?.bannerImage || null,
      coverImageXL: aniData?.coverImage?.extraLarge || d?.images?.jpg?.large_image_url || null,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Single manga — Jikan full + Anilist banner/extra
app.get('/api/live/manga/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [main, relations, characters] = await Promise.all([
      jikanGet(`/manga/${id}/full`),
      jikanGet(`/manga/${id}/relations`),
      jikanGet(`/manga/${id}/characters`),
    ]);
    const d = main.data;
    const aniTitle = d?.title_english || d?.title;
    let aniData = null;
    if (aniTitle) {
      await sleep(200);
      const result = await anilistGet(ANILIST_MEDIA_QUERY, { search: aniTitle, type: 'MANGA' });
      aniData = result?.Media || null;
    }
    res.json({
      ...d,
      relations: relations.data || [],
      characters: (characters.data || []).slice(0, 20),
      anilist: aniData,
      bannerImage: aniData?.bannerImage || null,
      coverImageXL: aniData?.coverImage?.extraLarge || d?.images?.jpg?.large_image_url || null,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Upcoming seasons
app.get('/api/live/upcoming', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = await jikanGet(`/seasons/upcoming?page=${page}&sfw=true`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Currently airing
app.get('/api/live/season/now', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const data = await jikanGet(`/seasons/now?limit=24&page=${page}&sfw=true`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Past seasons list
app.get('/api/live/seasons', async (_req, res) => {
  try {
    const data = await jikanGet('/seasons');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Top anime/manga
app.get('/api/live/top/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { filter = 'bypopularity', page = 1, limit = 24 } = req.query;
    const safeType = ['anime', 'manga'].includes(type) ? type : 'anime';
    const data = await jikanGet(`/top/${safeType}?filter=${filter}&page=${page}&limit=${limit}&sfw=true`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Airing schedule by day
app.get('/api/live/schedule', async (req, res) => {
  try {
    const { day } = req.query;
    const path = day ? `/schedules?filter=${day}&limit=25&sfw=true` : '/schedules?limit=25&sfw=true';
    const data = await jikanGet(path);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Anilist — full universe for a franchise title (banner + relations)
app.get('/api/live/universe', async (req, res) => {
  try {
    const { q, type = 'ANIME' } = req.query;
    if (!q) return res.json({ results: [] });
    await sleep(200);
    const [jikanAnime, jikanManga, aniData] = await Promise.all([
      jikanGet(`/anime?q=${encodeURIComponent(q as string)}&limit=6&sfw=true`),
      jikanGet(`/manga?q=${encodeURIComponent(q as string)}&limit=6&sfw=true`),
      anilistGet(ANILIST_MEDIA_QUERY, { search: q, type }),
    ]);
    res.json({
      anime: jikanAnime.data || [],
      manga: jikanManga.data || [],
      anilist: aniData?.Media || null,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Person/creator detail by MAL id
app.get('/api/live/people/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [person, works] = await Promise.all([
      jikanGet(`/people/${id}/full`),
      jikanGet(`/people/${id}/anime`),
    ]);
    res.json({ ...person.data, anime_works: works.data || [] });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Person search (MAL)
app.get('/api/live/people', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ data: [] });
    const data = await jikanGet(`/people?q=${encodeURIComponent(q as string)}&limit=12`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Anilist creator search (richer data)
app.get('/api/live/creator', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ staff: null });
    const data = await anilistGet(ANILIST_PERSON_QUERY, { search: q });
    res.json({ staff: data?.Staff || null });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Genres list
app.get('/api/live/genres', async (_req, res) => {
  try {
    const [anime, manga] = await Promise.all([
      jikanGet('/genres/anime'),
      jikanGet('/genres/manga'),
    ]);
    res.json({ anime: anime.data || [], manga: manga.data || [] });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Browse by genre
app.get('/api/live/genre/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const { page = 1 } = req.query;
    const safeType = ['anime', 'manga'].includes(type) ? type : 'anime';
    const data = await jikanGet(`/${safeType}?genres=${id}&order_by=popularity&sort=desc&page=${page}&limit=24&sfw=true`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── DB: Franchises ───────────────────────────────────────────────────────────

app.get('/api/franchises', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, COUNT(DISTINCT t.id)::int AS title_count,
             ROUND(AVG(t.avg_rating)::numeric, 2) AS avg_rating
      FROM franchises f LEFT JOIN titles t ON t.franchise_id = f.id
      GROUP BY f.id ORDER BY f.name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/franchises/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const fr = await pool.query('SELECT * FROM franchises WHERE slug = $1', [slug]);
    if (!fr.rows.length) return res.status(404).json({ error: 'Not found' });
    const f = fr.rows[0];
    const [titles, timelines] = await Promise.all([
      pool.query(`
        SELECT t.*, STRING_AGG(DISTINCT tg.name, ',') AS tags
        FROM titles t LEFT JOIN title_tags tt ON tt.title_id = t.id
        LEFT JOIN tags tg ON tg.id = tt.tag_id
        WHERE t.franchise_id = $1
        GROUP BY t.id ORDER BY t.release_order NULLS LAST, t.release_date
      `, [f.id]),
      pool.query(`
        SELECT tl.*, json_agg(json_build_object('title_id', tt.title_id, 'position', tt.position_in_timeline)) AS titles
        FROM timelines tl LEFT JOIN title_timelines tt ON tt.timeline_id = tl.id
        WHERE tl.franchise_id = $1 GROUP BY tl.id
      `, [f.id]),
    ]);
    res.json({ ...f, titles: titles.rows, timelines: timelines.rows });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── DB: Titles ───────────────────────────────────────────────────────────────

app.get('/api/titles', async (req, res) => {
  try {
    const { media_type, franchise_id, search, limit = 50, offset = 0 } = req.query;
    let q = `
      SELECT t.*, f.name AS franchise_name, f.slug AS franchise_slug,
             STRING_AGG(DISTINCT tg.name, ',') AS tags
      FROM titles t LEFT JOIN franchises f ON f.id = t.franchise_id
      LEFT JOIN title_tags tt ON tt.title_id = t.id LEFT JOIN tags tg ON tg.id = tt.tag_id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let p = 1;
    if (media_type) { q += ` AND t.media_type = $${p++}`; params.push(media_type); }
    if (franchise_id) { q += ` AND t.franchise_id = $${p++}`; params.push(franchise_id); }
    if (search) { q += ` AND (t.title ILIKE $${p} OR t.synopsis ILIKE $${p})`; params.push(`%${search}%`); p++; }
    q += ` GROUP BY t.id, f.name, f.slug ORDER BY t.popularity_score DESC NULLS LAST LIMIT $${p} OFFSET $${p+1}`;
    params.push(limit, offset);
    const result = await pool.query(q, params);
    res.json({ data: result.rows, pagination: { limit, offset } });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/titles/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const tr = await pool.query(`
      SELECT t.*, f.name AS franchise_name, f.slug AS franchise_slug
      FROM titles t LEFT JOIN franchises f ON f.id = t.franchise_id WHERE t.slug = $1
    `, [slug]);
    if (!tr.rows.length) return res.status(404).json({ error: 'Not found' });
    const t = tr.rows[0];
    const [out, inc, tags, reviews] = await Promise.all([
      pool.query(`SELECT c.*, t2.title AS target_title, t2.slug AS target_slug, t2.media_type AS target_media_type, t2.cover_image AS target_cover FROM connections c JOIN titles t2 ON t2.id = c.target_title_id WHERE c.source_title_id = $1 ORDER BY c.weight DESC`, [t.id]),
      pool.query(`SELECT c.*, t1.title AS source_title, t1.slug AS source_slug, t1.media_type AS source_media_type, t1.cover_image AS source_cover FROM connections c JOIN titles t1 ON t1.id = c.source_title_id WHERE c.target_title_id = $1 ORDER BY c.weight DESC`, [t.id]),
      pool.query(`SELECT tg.* FROM tags tg JOIN title_tags tt ON tt.tag_id = tg.id WHERE tt.title_id = $1`, [t.id]),
      pool.query(`SELECT r.*, u.username, u.avatar FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.title_id = $1 ORDER BY r.created_at DESC LIMIT 20`, [t.id]),
    ]);
    res.json({ ...t, connections: { outgoing: out.rows, incoming: inc.rows }, tags: tags.rows, reviews: reviews.rows });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── DB: Search ───────────────────────────────────────────────────────────────

app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || (q as string).length < 2) return res.json({ results: [] });
    const result = await pool.query(`
      SELECT t.id, t.title, t.slug, t.media_type, t.release_date, t.cover_image, t.avg_rating,
             f.name AS franchise_name, f.slug AS franchise_slug, 'title' AS result_type
      FROM titles t LEFT JOIN franchises f ON f.id = t.franchise_id
      WHERE t.title ILIKE $1 OR t.synopsis ILIKE $1
      UNION ALL
      SELECT f.id, f.name, f.slug, NULL, NULL, f.cover_image, NULL, NULL, NULL, 'franchise'
      FROM franchises f WHERE f.name ILIKE $1 OR f.description ILIKE $1
      LIMIT 50
    `, [`%${q}%`]);
    res.json({ results: result.rows, query: q });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── DB: Timelines ────────────────────────────────────────────────────────────

app.get('/api/timelines/:franchise_slug/:timeline_slug', async (req, res) => {
  try {
    const { franchise_slug, timeline_slug } = req.params;
    const result = await pool.query(`
      SELECT tl.*, json_agg(json_build_object('title', t.*, 'position', tt.position_in_timeline) ORDER BY tt.position_in_timeline) AS timeline_entries
      FROM timelines tl JOIN franchises f ON f.id = tl.franchise_id
      JOIN title_timelines tt ON tt.timeline_id = tl.id JOIN titles t ON t.id = tt.title_id
      WHERE f.slug = $1 AND tl.slug = $2 GROUP BY tl.id
    `, [franchise_slug, timeline_slug]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hash]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!result.rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    const { password_hash: _, ...safe } = user;
    res.json({ user: safe, token });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(port, () => console.log(`🚀 LoreZone API → http://localhost:${port}`));
