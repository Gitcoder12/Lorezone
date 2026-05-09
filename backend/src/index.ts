import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
});

app.use(cors());
app.use(express.json());

// ─── Health ────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// ─── Franchises ─────────────────────────────────────────────────────────────

app.get('/api/franchises', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*,
             COUNT(DISTINCT t.id)::int AS title_count,
             ROUND(AVG(t.avg_rating)::numeric, 2) AS avg_rating
      FROM franchises f
      LEFT JOIN titles t ON t.franchise_id = f.id
      GROUP BY f.id
      ORDER BY f.name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/franchises/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const franchiseResult = await pool.query(
      'SELECT * FROM franchises WHERE slug = $1',
      [slug]
    );
    if (!franchiseResult.rows.length) {
      return res.status(404).json({ error: 'Franchise not found' });
    }
    const franchise = franchiseResult.rows[0];

    const titlesResult = await pool.query(`
      SELECT t.*, STRING_AGG(DISTINCT tg.name, ',') AS tags
      FROM titles t
      LEFT JOIN title_tags tt ON tt.title_id = t.id
      LEFT JOIN tags tg ON tg.id = tt.tag_id
      WHERE t.franchise_id = $1
      GROUP BY t.id
      ORDER BY t.release_order NULLS LAST, t.release_date
    `, [franchise.id]);

    const timelinesResult = await pool.query(`
      SELECT tl.*,
             json_agg(json_build_object('title_id', tt.title_id, 'position', tt.position_in_timeline)) AS titles
      FROM timelines tl
      LEFT JOIN title_timelines tt ON tt.timeline_id = tl.id
      WHERE tl.franchise_id = $1
      GROUP BY tl.id
    `, [franchise.id]);

    res.json({ ...franchise, titles: titlesResult.rows, timelines: timelinesResult.rows });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── Titles ──────────────────────────────────────────────────────────────────

app.get('/api/titles', async (req, res) => {
  try {
    const { media_type, franchise_id, search, sort = 'popularity_score', limit = 50, offset = 0 } = req.query;
    let query = `
      SELECT t.*, f.name AS franchise_name, f.slug AS franchise_slug,
             STRING_AGG(DISTINCT tg.name, ',') AS tags
      FROM titles t
      LEFT JOIN franchises f ON f.id = t.franchise_id
      LEFT JOIN title_tags tt ON tt.title_id = t.id
      LEFT JOIN tags tg ON tg.id = tt.tag_id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let p = 1;

    if (media_type) { query += ` AND t.media_type = $${p++}`; params.push(media_type); }
    if (franchise_id) { query += ` AND t.franchise_id = $${p++}`; params.push(franchise_id); }
    if (search) { query += ` AND (t.title ILIKE $${p} OR t.synopsis ILIKE $${p})`; params.push(`%${search}%`); p++; }

    const allowed = ['popularity_score', 'avg_rating', 'release_date', 'release_order'];
    const sortCol = allowed.includes(sort as string) ? sort : 'popularity_score';
    query += ` GROUP BY t.id, f.name, f.slug ORDER BY t.${sortCol} DESC NULLS LAST LIMIT $${p} OFFSET $${p + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ data: result.rows, pagination: { limit, offset } });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/titles/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const titleResult = await pool.query(`
      SELECT t.*, f.name AS franchise_name, f.slug AS franchise_slug
      FROM titles t
      LEFT JOIN franchises f ON f.id = t.franchise_id
      WHERE t.slug = $1
    `, [slug]);

    if (!titleResult.rows.length) return res.status(404).json({ error: 'Title not found' });
    const title = titleResult.rows[0];

    const [outgoing, incoming, tags, reviews] = await Promise.all([
      pool.query(`
        SELECT c.*, t2.title AS target_title, t2.slug AS target_slug,
               t2.media_type AS target_media_type, t2.cover_image AS target_cover
        FROM connections c JOIN titles t2 ON t2.id = c.target_title_id
        WHERE c.source_title_id = $1 ORDER BY c.weight DESC
      `, [title.id]),
      pool.query(`
        SELECT c.*, t1.title AS source_title, t1.slug AS source_slug,
               t1.media_type AS source_media_type, t1.cover_image AS source_cover
        FROM connections c JOIN titles t1 ON t1.id = c.source_title_id
        WHERE c.target_title_id = $1 ORDER BY c.weight DESC
      `, [title.id]),
      pool.query(`
        SELECT tg.* FROM tags tg JOIN title_tags tt ON tt.tag_id = tg.id WHERE tt.title_id = $1
      `, [title.id]),
      pool.query(`
        SELECT r.*, u.username, u.avatar FROM reviews r JOIN users u ON u.id = r.user_id
        WHERE r.title_id = $1 ORDER BY r.created_at DESC LIMIT 20
      `, [title.id]),
    ]);

    res.json({
      ...title,
      connections: { outgoing: outgoing.rows, incoming: incoming.rows },
      tags: tags.rows,
      reviews: reviews.rows,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── Timelines ───────────────────────────────────────────────────────────────

app.get('/api/timelines/:franchise_slug/:timeline_slug', async (req, res) => {
  try {
    const { franchise_slug, timeline_slug } = req.params;
    const result = await pool.query(`
      SELECT tl.*,
             json_agg(
               json_build_object('title', t.*, 'position', tt.position_in_timeline)
               ORDER BY tt.position_in_timeline
             ) AS timeline_entries
      FROM timelines tl
      JOIN franchises f ON f.id = tl.franchise_id
      JOIN title_timelines tt ON tt.timeline_id = tl.id
      JOIN titles t ON t.id = tt.title_id
      WHERE f.slug = $1 AND tl.slug = $2
      GROUP BY tl.id
    `, [franchise_slug, timeline_slug]);
    if (!result.rows.length) return res.status(404).json({ error: 'Timeline not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── Search ──────────────────────────────────────────────────────────────────

app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || (q as string).length < 2) return res.json({ results: [] });

    const result = await pool.query(`
      SELECT t.id, t.title, t.slug, t.media_type, t.release_date,
             t.cover_image, t.avg_rating, f.name AS franchise_name,
             f.slug AS franchise_slug, 'title' AS result_type
      FROM titles t LEFT JOIN franchises f ON f.id = t.franchise_id
      WHERE t.title ILIKE $1 OR t.synopsis ILIKE $1
      UNION ALL
      SELECT f.id, f.name AS title, f.slug, NULL, NULL,
             f.cover_image, NULL, NULL, NULL, 'franchise' AS result_type
      FROM franchises f
      WHERE f.name ILIKE $1 OR f.description ILIKE $1
      LIMIT 50
    `, [`%${q}%`]);

    res.json({ results: result.rows, query: q });
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
    const result = await pool.query(
      'SELECT id, username, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );
    if (!result.rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    const { password_hash: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── User Lists ───────────────────────────────────────────────────────────────

function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET || 'secret') as { id: number };
    (req as express.Request & { userId: number }).userId = payload.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/lists/me', authMiddleware, async (req, res) => {
  try {
    const userId = (req as express.Request & { userId: number }).userId;
    const result = await pool.query(`
      SELECT ul.*, COUNT(li.id)::int AS item_count
      FROM user_lists ul LEFT JOIN list_items li ON li.list_id = ul.id
      WHERE ul.user_id = $1 GROUP BY ul.id ORDER BY ul.created_at DESC
    `, [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/lists', authMiddleware, async (req, res) => {
  try {
    const userId = (req as express.Request & { userId: number }).userId;
    const { name, description, is_public = true } = req.body;
    const result = await pool.query(
      'INSERT INTO user_lists (user_id, name, description, is_public) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, name, description, is_public]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/lists/:listId/items', authMiddleware, async (req, res) => {
  try {
    const { listId } = req.params;
    const { title_id, status = 'planned', user_rating, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO list_items (list_id, title_id, status, user_rating, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [listId, title_id, status, user_rating, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(port, () => {
  console.log(`🚀 LoreZone API running on http://localhost:${port}`);
});
