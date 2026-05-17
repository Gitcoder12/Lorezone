/* ============================================================
   LOREZONE — app.js
   Advanced data, search, watchlist, recommendations, stats
   ============================================================ */

// ── Content Warnings System ────────────────────────────────
const ContentWarnings = {
  violence: { icon: '⚠️', label: 'Violence', color: '#ff4444' },
  gore: { icon: '🩸', label: 'Gore', color: '#8b0000' },
  psychological: { icon: '🧠', label: 'Psychological', color: '#9b5de5' },
  sexual: { icon: '🔞', label: 'Sexual Content', color: '#dc2f02' },
  suicide: { icon: '⛔', label: 'Suicide/Self-harm', color: '#ff0000' },
  dark: { icon: '🌑', label: 'Very Dark', color: '#1a1a2e' }
};

// ── Demographics ───────────────────────────────────────────
const Demographics = {
  'Kids': '👶',
  'Shounen': '👦',
  'Shoujo': '👧',
  'Seinen': '👨',
  'Josei': '👩',
  'Family': '👨‍👩‍👧‍👦',
  'PG-13': '🎬',
  'Mature': '🔞',
  'Adult': '🚫'
};

// ── Media Database ──────────────────────────────────────────
const LOREZONE_DB = [
  {
    id: 1, type: 'anime', title: 'Attack on Titan',
    image: 'https://cdn.myanimelist.net/images/anime/10/47347l.jpg',
    year: 2013, status: 'Completed', rating: 9.0,
    demographic: 'Shounen',
    genres: ['Action','Drama','Fantasy','Mystery'],
    warnings: ['violence','gore','psychological'],
    synopsis: 'Humanity lives inside cities surrounded by enormous walls due to the Titans, gigantic humanoid beings who devour humans.',
    episodes: 87, studios: ['Wit Studio','MAPPA'],
    related: [2, 3], franchise: 'Attack on Titan',
    trailer: 'https://www.youtube.com/watch?v=MGRm4IzK1SQ',
    characters: [
      { name: 'Eren Yeager', role: 'Protagonist', img: 'https://cdn.myanimelist.net/images/characters/10/216895.jpg' },
      { name: 'Mikasa Ackerman', role: 'Deuteragonist', img: 'https://cdn.myanimelist.net/images/characters/9/215563.jpg' },
      { name: 'Levi Ackerman', role: 'Ally', img: 'https://cdn.myanimelist.net/images/characters/2/241413.jpg' }
    ]
  },
  {
    id: 2, type: 'manga', title: 'Attack on Titan',
    image: 'https://cdn.myanimelist.net/images/manga/2/37846l.jpg',
    year: 2009, status: 'Completed', rating: 8.5,
    demographic: 'Shounen',
    genres: ['Action','Drama','Fantasy'],
    warnings: ['violence','gore'],
    synopsis: 'The original manga by Hajime Isayama. 34 volumes of humanity fighting for survival.',
    volumes: 34, chapters: 139, author: 'Hajime Isayama',
    related: [1], franchise: 'Attack on Titan',
    characters: []
  },
  {
    id: 3, type: 'anime', title: 'Fullmetal Alchemist: Brotherhood',
    image: 'https://cdn.myanimelist.net/images/anime/1223/96541l.jpg',
    year: 2009, status: 'Completed', rating: 9.1,
    demographic: 'Shounen',
    genres: ['Action','Adventure','Drama','Fantasy'],
    warnings: ['violence','psychological'],
    synopsis: 'Two brothers search for the Philosopher\'s Stone to restore what they lost in an alchemic experiment gone wrong.',
    episodes: 64, studios: ['Bones'],
    related: [4], franchise: 'Fullmetal Alchemist',
    trailer: 'https://www.youtube.com/watch?v=--IcmZkvL0Q',
    characters: []
  },
  {
    id: 4, type: 'manga', title: 'Fullmetal Alchemist',
    image: 'https://cdn.myanimelist.net/images/manga/3/243675l.jpg',
    year: 2001, status: 'Completed', rating: 9.0,
    demographic: 'Shounen',
    genres: ['Action','Adventure','Drama','Fantasy'],
    warnings: ['violence'],
    synopsis: 'The original manga by Hiromu Arakawa. A story of sacrifice, redemption, and the price of power.',
    volumes: 27, chapters: 108, author: 'Hiromu Arakawa',
    related: [3], franchise: 'Fullmetal Alchemist',
    characters: []
  },
  {
    id: 5, type: 'anime', title: 'Demon Slayer',
    image: 'https://cdn.myanimelist.net/images/anime/1286/99889l.jpg',
    year: 2019, status: 'Ongoing', rating: 8.7,
    demographic: 'Shounen',
    genres: ['Action','Fantasy','Historical','Supernatural'],
    warnings: ['violence','gore'],
    synopsis: 'A boy raised as a demon slayer seeks a cure for his sister, turned into a demon.',
    episodes: 44, studios: ['ufotable'],
    related: [6], franchise: 'Demon Slayer',
    trailer: 'https://www.youtube.com/watch?v=VQGCKyvzIM4',
    characters: []
  },
  {
    id: 6, type: 'manga', title: 'Demon Slayer: Kimetsu no Yaiba',
    image: 'https://cdn.myanimelist.net/images/manga/3/179023l.jpg',
    year: 2016, status: 'Completed', rating: 8.2,
    demographic: 'Shounen',
    genres: ['Action','Fantasy','Historical'],
    warnings: ['violence'],
    synopsis: 'The manga by Koyoharu Gotouge that sparked a global phenomenon.',
    volumes: 23, chapters: 205, author: 'Koyoharu Gotouge',
    related: [5], franchise: 'Demon Slayer',
    characters: []
  },
  {
    id: 7, type: 'anime', title: 'One Piece',
    image: 'https://cdn.myanimelist.net/images/anime/6/73245l.jpg',
    year: 1999, status: 'Ongoing', rating: 8.7,
    demographic: 'Shounen',
    genres: ['Action','Adventure','Comedy','Fantasy'],
    warnings: [],
    synopsis: 'Monkey D. Luffy and his crew sail the Grand Line to find the legendary treasure One Piece.',
    episodes: 1100, studios: ['Toei Animation'],
    related: [8], franchise: 'One Piece',
    trailer: 'https://www.youtube.com/watch?v=S8_YwFLCh4U',
    characters: []
  },
  {
    id: 8, type: 'manga', title: 'One Piece',
    image: 'https://cdn.myanimelist.net/images/manga/2/253146l.jpg',
    year: 1997, status: 'Ongoing', rating: 9.2,
    demographic: 'Shounen',
    genres: ['Action','Adventure','Comedy','Fantasy'],
    warnings: [],
    synopsis: 'Eiichiro Oda\'s masterpiece. Over 1100 chapters of the greatest adventure in manga history.',
    volumes: 107, chapters: 1100, author: 'Eiichiro Oda',
    related: [7], franchise: 'One Piece',
    characters: []
  },
  {
    id: 9, type: 'anime', title: 'Jujutsu Kaisen',
    image: 'https://cdn.myanimelist.net/images/anime/1171/109222l.jpg',
    year: 2020, status: 'Ongoing', rating: 8.6,
    demographic: 'Shounen',
    genres: ['Action','Fantasy','Horror','Supernatural'],
    warnings: ['violence','gore','dark'],
    synopsis: 'Yuji Itadori eats a cursed object and becomes the host of a powerful Curse, beginning his journey as a Jujutsu Sorcerer.',
    episodes: 47, studios: ['MAPPA'],
    related: [10], franchise: 'Jujutsu Kaisen',
    trailer: 'https://www.youtube.com/watch?v=4A_X-Dvl0ws',
    characters: []
  },
  {
    id: 10, type: 'manga', title: 'Jujutsu Kaisen',
    image: 'https://cdn.myanimelist.net/images/manga/3/210341l.jpg',
    year: 2018, status: 'Completed', rating: 8.3,
    demographic: 'Shounen',
    genres: ['Action','Fantasy','Horror'],
    warnings: ['violence','gore'],
    synopsis: 'Gege Akutami\'s dark fantasy manga about cursed energy and sorcerers.',
    volumes: 27, chapters: 271, author: 'Gege Akutami',
    related: [9], franchise: 'Jujutsu Kaisen',
    characters: []
  },
  {
    id: 11, type: 'anime', title: 'Death Note',
    image: 'https://cdn.myanimelist.net/images/anime/9/9453l.jpg',
    year: 2006, status: 'Completed', rating: 8.6,
    demographic: 'Shounen',
    genres: ['Mystery','Psychological','Supernatural','Thriller'],
    warnings: ['psychological','dark'],
    synopsis: 'A high school student discovers a supernatural notebook that kills anyone whose name is written in it.',
    episodes: 37, studios: ['Madhouse'],
    related: [12], franchise: 'Death Note',
    trailer: 'https://www.youtube.com/watch?v=NlJZ-YgAt-c',
    characters: []
  },
  {
    id: 12, type: 'manga', title: 'Death Note',
    image: 'https://cdn.myanimelist.net/images/manga/2/54453l.jpg',
    year: 2003, status: 'Completed', rating: 8.6,
    demographic: 'Shounen',
    genres: ['Mystery','Psychological','Supernatural'],
    warnings: ['psychological'],
    synopsis: 'The original manga by Tsugumi Ohba and Takeshi Obata — a god-and-detective cat-and-mouse thriller.',
    volumes: 12, chapters: 108, author: 'Tsugumi Ohba',
    related: [11], franchise: 'Death Note',
    characters: []
  },
  {
    id: 13, type: 'comic', title: 'Batman: The Dark Knight Returns',
    image: 'https://upload.wikimedia.org/wikipedia/en/8/8a/Dark_knight_returns.jpg',
    year: 1986, status: 'Completed', rating: 9.0,
    demographic: 'Mature',
    genres: ['Action','Drama','Superhero','Dystopia'],
    warnings: ['violence','dark'],
    synopsis: 'An aging Bruce Wayne comes out of retirement in a dark, dystopian Gotham City.',
    issues: 4, author: 'Frank Miller', publisher: 'DC Comics',
    related: [14], franchise: 'Batman',
    characters: []
  },
  {
    id: 14, type: 'comic', title: 'Watchmen',
    image: 'https://upload.wikimedia.org/wikipedia/en/a/a2/Watchmen%2C_issue_1.jpg',
    year: 1986, status: 'Completed', rating: 9.2,
    demographic: 'Mature',
    genres: ['Drama','Mystery','Superhero','Political'],
    warnings: ['violence','sexual','psychological'],
    synopsis: 'A deconstruction of the superhero genre — what if superheroes existed in the real world?',
    issues: 12, author: 'Alan Moore', publisher: 'DC Comics',
    related: [], franchise: 'Watchmen',
    characters: []
  },
  {
    id: 15, type: 'movie', title: 'Spirited Away',
    image: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    year: 2001, status: 'Released', rating: 9.3,
    demographic: 'Family',
    genres: ['Adventure','Animation','Fantasy','Family'],
    warnings: [],
    synopsis: 'A young girl enters the spirit world and must find a way to free herself and her parents.',
    runtime: 125, director: 'Hayao Miyazaki', studio: 'Studio Ghibli',
    related: [16], franchise: 'Studio Ghibli',
    trailer: 'https://www.youtube.com/watch?v=ByXuk9QqQkk',
    characters: []
  },
  {
    id: 16, type: 'movie', title: 'Princess Mononoke',
    image: 'https://image.tmdb.org/t/p/w500/4RqmAUl7bnT8b9w4Y2M1mD8YVUA.jpg',
    year: 1997, status: 'Released', rating: 8.9,
    demographic: 'Family',
    genres: ['Action','Adventure','Animation','Fantasy'],
    warnings: ['violence'],
    synopsis: 'A prince becomes embroiled in a war between forest gods and the humans who consume their resources.',
    runtime: 134, director: 'Hayao Miyazaki', studio: 'Studio Ghibli',
    related: [15], franchise: 'Studio Ghibli',
    characters: []
  },
  {
    id: 17, type: 'show', title: 'Arcane',
    image: 'https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg',
    year: 2021, status: 'Completed', rating: 9.0,
    demographic: 'Mature',
    genres: ['Action','Animation','Drama','Fantasy','Sci-Fi'],
    warnings: ['violence','dark'],
    synopsis: 'Set in the League of Legends universe — two sisters on opposite sides of a brewing war.',
    seasons: 2, episodes: 18, studio: 'Fortiche',
    related: [], franchise: 'League of Legends',
    trailer: 'https://www.youtube.com/watch?v=4Ps6nV4wiCE',
    characters: []
  },
  {
    id: 18, type: 'show', title: 'Avatar: The Last Airbender',
    image: 'https://image.tmdb.org/t/p/w500/cHsBEEQO2WBc5dERO0Wq6lnBSMV.jpg',
    year: 2005, status: 'Completed', rating: 9.2,
    demographic: 'Family',
    genres: ['Action','Adventure','Animation','Comedy','Fantasy'],
    warnings: [],
    synopsis: 'A young boy who can control all four elements must save the world from the Fire Nation.',
    seasons: 3, episodes: 61, studio: 'Nickelodeon Animation',
    related: [], franchise: 'Avatar',
    trailer: 'https://www.youtube.com/watch?v=d1EnW4ltUKI',
    characters: []
  },
  {
    id: 19, type: 'book', title: 'The Way of Kings',
    image: 'https://covers.openlibrary.org/b/id/8166196-L.jpg',
    year: 2010, status: 'Published', rating: 9.1,
    demographic: 'Mature',
    genres: ['Epic Fantasy','Adventure','Drama'],
    warnings: ['violence'],
    synopsis: 'Book 1 of The Stormlight Archive. An epic fantasy set in a world ravaged by highstorms, following warriors, scholars, and slaves.',
    pages: 1007, author: 'Brandon Sanderson', series: 'The Stormlight Archive',
    related: [20], franchise: 'Cosmere',
    characters: []
  },
  {
    id: 20, type: 'book', title: 'Words of Radiance',
    image: 'https://covers.openlibrary.org/b/id/8166197-L.jpg',
    year: 2014, status: 'Published', rating: 9.3,
    demographic: 'Mature',
    genres: ['Epic Fantasy','Adventure'],
    warnings: [],
    synopsis: 'Book 2 of The Stormlight Archive. The Knights Radiant must unite once more to stand against the Voidbringers.',
    pages: 1087, author: 'Brandon Sanderson', series: 'The Stormlight Archive',
    related: [19], franchise: 'Cosmere',
    characters: []
  },
  {
    id: 21, type: 'anime', title: 'Neon Genesis Evangelion',
    image: 'https://cdn.myanimelist.net/images/anime/1314/108941l.jpg',
    year: 1995, status: 'Completed', rating: 8.5,
    demographic: 'Seinen',
    genres: ['Action','Drama','Mecha','Psychological','Sci-Fi'],
    warnings: ['psychological','dark','violence'],
    synopsis: 'A teenager pilots a giant robot to fight Angels threatening humanity — but the real war is within.',
    episodes: 26, studios: ['Gainax'],
    related: [], franchise: 'Evangelion',
    characters: []
  },
  {
    id: 22, type: 'anime', title: 'Steins;Gate',
    image: 'https://cdn.myanimelist.net/images/anime/5/73199l.jpg',
    year: 2011, status: 'Completed', rating: 9.1,
    demographic: 'Seinen',
    genres: ['Drama','Mystery','Sci-Fi','Thriller'],
    warnings: ['psychological'],
    synopsis: 'A self-proclaimed mad scientist accidentally discovers time travel and must prevent a catastrophic future.',
    episodes: 24, studios: ['White Fox'],
    related: [], franchise: 'Science Adventure',
    trailer: 'https://www.youtube.com/watch?v=27OZc-ku6is',
    characters: []
  },
  {
    id: 23, type: 'anime', title: 'Hunter x Hunter (2011)',
    image: 'https://cdn.myanimelist.net/images/anime/1337/99013l.jpg',
    year: 2011, status: 'Completed', rating: 9.0,
    demographic: 'Shounen',
    genres: ['Action','Adventure','Fantasy'],
    warnings: ['violence','dark'],
    synopsis: 'A boy searches for his Hunter father, discovering a world of professional adventurers, assassins, and dark secrets.',
    episodes: 148, studios: ['Madhouse'],
    related: [], franchise: 'Hunter x Hunter',
    characters: []
  },
  {
    id: 24, type: 'movie', title: 'Your Name',
    image: 'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg',
    year: 2016, status: 'Released', rating: 8.9,
    demographic: 'Shoujo',
    genres: ['Animation','Drama','Romance','Fantasy'],
    warnings: [],
    synopsis: 'Two teenagers share a profound connection after discovering they can body-swap across time.',
    runtime: 106, director: 'Makoto Shinkai', studio: 'CoMix Wave Films',
    related: [], franchise: 'Makoto Shinkai',
    characters: []
  },
  {
    id: 25, type: 'comic', title: 'Saga',
    image: 'https://upload.wikimedia.org/wikipedia/en/2/2f/Saga_1.jpg',
    year: 2012, status: 'Ongoing', rating: 9.0,
    demographic: 'Mature',
    genres: ['Sci-Fi','Fantasy','Drama','Romance'],
    warnings: ['violence','sexual','gore'],
    synopsis: 'Two soldiers from opposite sides of a galactic war fall in love and go on the run with their child.',
    issues: 66, author: 'Brian K. Vaughan', publisher: 'Image Comics',
    related: [], franchise: 'Saga',
    characters: []
  }
];

// ── Watchlist (localStorage) ────────────────────────────────
const Watchlist = {
  get() {
    try { return JSON.parse(localStorage.getItem('lz_watchlist') || '[]'); }
    catch { return []; }
  },
  has(id) { return this.get().includes(id); },
  toggle(id) {
    const list = this.get();
    const idx = list.indexOf(id);
    if (idx === -1) list.push(id);
    else list.splice(idx, 1);
    localStorage.setItem('lz_watchlist', JSON.stringify(list));
    return idx === -1;
  },
  getItems() { return LOREZONE_DB.filter(m => this.get().includes(m.id)); },
  count() { return this.get().length; }
};

// ── Progress Tracker ────────────────────────────────────────
const Progress = {
  key(id) { return `lz_progress_${id}`; },
  get(id) {
    try { return JSON.parse(localStorage.getItem(this.key(id)) || '{"current":0}'); }
    catch { return { current: 0 }; }
  },
  set(id, current) {
    localStorage.setItem(this.key(id), JSON.stringify({ current }));
  }
};

// ── Recommendation Engine ──────────────────────────────────
function getRecommendations(itemId, limit = 4) {
  const item = LOREZONE_DB.find(i => i.id === itemId);
  if (!item) return [];
  
  const recommendations = LOREZONE_DB.filter(i => i.id !== itemId).map(candidate => {
    let score = 0;
    if (candidate.type === item.type) score += 30;
    if (candidate.demographic === item.demographic) score += 25;
    const commonGenres = (candidate.genres || []).filter(g => (item.genres || []).includes(g));
    score += commonGenres.length * 15;
    if (candidate.franchise === item.franchise) score += 50;
    return { item: candidate, score };
  }).sort((a, b) => b.score - a.score).slice(0, limit);
  
  return recommendations.map(r => r.item);
}

// ── Utility Functions ───────────────────────────────────────
function getTotal(item) {
  return item.episodes || item.chapters || item.volumes || item.issues || item.pages || item.seasons || 1;
}
function getTotalLabel(item) {
  if (item.episodes) return `EP ${item.episodes}`;
  if (item.chapters) return `CH ${item.chapters}`;
  if (item.volumes) return `VOL ${item.volumes}`;
  if (item.issues) return `ISS ${item.issues}`;
  if (item.pages) return `${item.pages}p`;
  if (item.seasons) return `S ${item.seasons}`;
  return '';
}
function getBadgeClass(type) {
  return `badge-${type}`;
}
function getBestInGenre(genre, limit = 2) {
  return LOREZONE_DB
    .filter(item => (item.genres || []).map(g => g.toLowerCase()).includes(genre.toLowerCase()))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

function showToast(msg) {
  let t = document.getElementById('lz-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'lz-toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Theme Toggle ────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('lz_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('lz_theme', next);
}

// ── Card Builder ────────────────────────────────────────────
function buildCard(item, extraClass = '') {
  const inWatchlist = Watchlist.has(item.id);
  const prog = Progress.get(item.id);
  const total = getTotal(item);
  const pct = total > 1 ? Math.min(100, (prog.current / total) * 100) : 0;
  const hasWarnings = (item.warnings || []).length > 0;

  let warningBadge = '';
  if (hasWarnings) {
    const firstWarning = item.warnings[0];
    const warn = ContentWarnings[firstWarning];
    warningBadge = `<span style="position:absolute;top:30px;left:8px;background:${warn.color};color:white;padding:3px 7px;border-radius:4px;font-size:0.65rem;font-weight:700;z-index:5">${warn.icon}</span>`;
  }

  return `
    <div class="media-card ${extraClass}" data-id="${item.id}" onclick="goDetail(${item.id})">
      <img class="card-img" src="${item.image}" alt="${item.title}" loading="lazy"
           onerror="this.src='https://placehold.co/220x330/111118/e63946?text=No+Image'">
      <span class="card-badge ${getBadgeClass(item.type)}">${item.type}</span>
      ${warningBadge}
      <span class="card-score">★ ${item.rating}</span>
      <button class="card-watchlist-btn ${inWatchlist ? 'saved' : ''}"
              onclick="event.stopPropagation(); toggleWatchlist(${item.id}, this)"
              title="${inWatchlist ? 'Remove from list' : 'Add to list'}">
        ${inWatchlist ? '♥' : '♡'}
      </button>
      <div class="card-body">
        <div class="card-title">${item.title}</div>
        <div class="card-meta">
          <span>${item.year}</span>
          <span>${getTotalLabel(item)}</span>
          <span class="${item.status === 'Ongoing' || item.status === 'Publishing' ? 'text-accent' : ''}">${item.status}</span>
        </div>
        ${pct > 0 ? `<div class="progress-bar mt-1"><div class="progress-fill" style="width:${pct}%"></div></div>` : ''}
      </div>
    </div>
  `;
}

function toggleWatchlist(id, btn) {
  const added = Watchlist.toggle(id);
  btn.textContent = added ? '♥' : '♡';
  btn.classList.toggle('saved', added);
  showToast(added ? '❤️ Added to your list' : '💔 Removed from list');
}

function goDetail(id) {
  window.location.href = `detail.html?id=${id}`;
}

// ── Search ──────────────────────────────────────────────────
function searchDB(query, filters = {}) {
  const q = query.toLowerCase().trim();
  return LOREZONE_DB.filter(item => {
    const matchQ = !q ||
      item.title.toLowerCase().includes(q) ||
      (item.genres || []).some(g => g.toLowerCase().includes(q)) ||
      (item.author || '').toLowerCase().includes(q) ||
      (item.franchise || '').toLowerCase().includes(q) ||
      (item.synopsis || '').toLowerCase().includes(q);

    const matchType = !filters.type || filters.type === 'all' || item.type === filters.type;
    const matchStatus = !filters.status || filters.status === 'all' || item.status === filters.status;
    const matchGenre = !filters.genre || (item.genres || []).map(g=>g.toLowerCase()).includes(filters.genre.toLowerCase());
    const matchYear = !filters.year || item.year >= parseInt(filters.year);
    const matchRating = !filters.rating || item.rating >= filters.rating;
    const matchDemographic = !filters.demographic || filters.demographic === 'all' || item.demographic === filters.demographic;
    const matchWarnings = !filters.hideWarnings || !(item.warnings || []).length;

    return matchQ && matchType && matchStatus && matchGenre && matchYear && matchRating && matchDemographic && matchWarnings;
  });
}

// ── Navbar Builder ──────────────────────────────────────────
function buildNavbar(activePage = '') {
  return `
    <nav class="navbar">
      <a href="index.html" class="navbar-brand">LOREZONE</a>
      <div class="navbar-links">
        <a href="index.html" class="${activePage === 'home' ? 'active' : ''}">Home</a>
        <a href="browse.html" class="${activePage === 'browse' ? 'active' : ''}">Browse</a>
        <a href="browse.html?type=anime" class="${activePage === 'anime' ? 'active' : ''}">Anime</a>
        <a href="browse.html?type=manga" class="${activePage === 'manga' ? 'active' : ''}">Manga</a>
        <a href="browse.html?type=comic" class="${activePage === 'comic' ? 'active' : ''}">Comics</a>
        <a href="browse.html?type=movie" class="${activePage === 'movie' ? 'active' : ''}">Movies</a>
        <a href="browse.html?type=show" class="${activePage === 'show' ? 'active' : ''}">Shows</a>
        <a href="browse.html?type=book" class="${activePage === 'book' ? 'active' : ''}">Books</a>
      </div>
      <div class="navbar-actions">
        <div class="search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" id="nav-search" placeholder="Search titles..." autocomplete="off">
        </div>
        <button class="btn-icon" onclick="toggleTheme()" title="Toggle theme">☀️</button>
        <a href="browse.html?watchlist=1" class="btn-icon" title="My List (${Watchlist.count()})">♥</a>
      </div>
    </nav>
    <div id="search-dropdown" style="
      position:fixed; top:70px; right:2rem; z-index:200;
      background:var(--surface); border:1px solid var(--border);
      border-radius:var(--radius); width:340px; max-height:420px;
      overflow-y:auto; box-shadow:var(--shadow-lg); display:none;
    "></div>
  `;
}

function initNavSearch() {
  const input = document.getElementById('nav-search');
  const dropdown = document.getElementById('search-dropdown');
  if (!input || !dropdown) return;

  input.addEventListener('input', () => {
    const q = input.value.trim();
    if (q.length < 2) { dropdown.style.display = 'none'; return; }
    const results = searchDB(q).slice(0, 8);
    if (!results.length) { dropdown.style.display = 'none'; return; }

    dropdown.innerHTML = results.map(r => `
      <div onclick="goDetail(${r.id})" style="
        display:flex; gap:0.75rem; align-items:center;
        padding:0.75rem; cursor:pointer; border-bottom:1px solid var(--border);
        transition: background 0.2s;
      " onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background=''">
        <img src="${r.image}" style="width:40px;height:60px;object-fit:cover;border-radius:4px;" onerror="this.src='https://placehold.co/40x60/111118/e63946?text=?'">
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.title}</div>
          <div style="font-size:0.75rem;color:var(--text3)">${r.type} · ${r.year} · ★${r.rating}</div>
        </div>
      </div>
    `).join('');
    dropdown.style.display = 'block';
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.search-bar') && !e.target.closest('#search-dropdown')) {
      dropdown.style.display = 'none';
    }
  });
}

function buildFooter() {
  return `
    <footer class="footer">
      <p>LORE<span>ZONE</span> · Your Universe of Stories · Built with ❤️</p>
      <p style="margin-top:0.5rem;font-size:0.75rem">Anime · Manga · Comics · Movies · Shows · Books</p>
      <p style="margin-top:0.4rem;font-size:0.7rem;opacity:0.7">Data via MyAnimeList · TMDB · Open Library · Image Comics</p>
    </footer>
  `;
}

// ── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavSearch();
});
