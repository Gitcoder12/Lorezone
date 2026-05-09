-- LoreZone Database Schema
-- Run: psql -U postgres -f schema.sql

CREATE DATABASE lorezone;
\c lorezone;

-- Franchises (e.g., "Naruto", "Marvel", "Bleach")
CREATE TABLE franchises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    cover_image TEXT,
    logo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Titles (individual media entries)
CREATE TABLE titles (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER REFERENCES franchises(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    media_type VARCHAR(50) NOT NULL, -- anime, manga, movie, ova, ona, special, manhwa, novel, spin_off
    release_date DATE,
    end_date DATE,
    studio VARCHAR(255),
    author VARCHAR(255),
    artist VARCHAR(255),
    publisher VARCHAR(255),
    episode_count INTEGER,
    chapter_count INTEGER,
    volume_count INTEGER,
    runtime_minutes INTEGER,
    season_number INTEGER,
    chronological_order INTEGER,
    release_order INTEGER,
    synopsis TEXT,
    cover_image TEXT,
    banner_image TEXT,
    trailer_url TEXT,
    avg_rating DECIMAL(3,2),
    popularity_score DECIMAL(5,2),
    language VARCHAR(50) DEFAULT 'Japanese',
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(franchise_id, slug)
);

-- Connections between titles
CREATE TABLE connections (
    id SERIAL PRIMARY KEY,
    source_title_id INTEGER REFERENCES titles(id) ON DELETE CASCADE,
    target_title_id INTEGER REFERENCES titles(id) ON DELETE CASCADE,
    connection_type VARCHAR(50) NOT NULL, -- sequel, prequel, adaptation, spin_off, side_story, remake, alternate_timeline
    description TEXT,
    weight INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (source_title_id != target_title_id)
);

-- Timelines (e.g., Marvel 616 vs MCU)
CREATE TABLE timelines (
    id SERIAL PRIMARY KEY,
    franchise_id INTEGER REFERENCES franchises(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Title to Timeline mapping
CREATE TABLE title_timelines (
    title_id INTEGER REFERENCES titles(id) ON DELETE CASCADE,
    timeline_id INTEGER REFERENCES timelines(id) ON DELETE CASCADE,
    position_in_timeline INTEGER,
    PRIMARY KEY (title_id, timeline_id)
);

-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar TEXT,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User lists
CREATE TABLE user_lists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- List items
CREATE TABLE list_items (
    id SERIAL PRIMARY KEY,
    list_id INTEGER REFERENCES user_lists(id) ON DELETE CASCADE,
    title_id INTEGER REFERENCES titles(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'planned', -- watching, completed, dropped, planned
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 10),
    notes TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title_id INTEGER REFERENCES titles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
    content TEXT,
    spoiler BOOLEAN DEFAULT FALSE,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, title_id)
);

-- Tags / Genres
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- Title-Tag junction
CREATE TABLE title_tags (
    title_id INTEGER REFERENCES titles(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (title_id, tag_id)
);

-- Indexes
CREATE INDEX idx_titles_franchise ON titles(franchise_id);
CREATE INDEX idx_titles_media_type ON titles(media_type);
CREATE INDEX idx_titles_release_date ON titles(release_date);
CREATE INDEX idx_connections_source ON connections(source_title_id);
CREATE INDEX idx_connections_target ON connections(target_title_id);
CREATE INDEX idx_timelines_franchise ON timelines(franchise_id);
CREATE INDEX idx_reviews_title ON reviews(title_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_title_tags_title ON title_tags(title_id);

-- Sample seed data (Bleach)
INSERT INTO franchises (name, slug, description) VALUES
('Bleach', 'bleach', 'Follow Ichigo Kurosaki, a teenager with the ability to see ghosts, who gains the powers of a Soul Reaper.'),
('Naruto', 'naruto', 'A young ninja who seeks recognition from his peers and dreams of becoming the Hokage.'),
('Attack on Titan', 'attack-on-titan', 'Humanity lives inside cities surrounded by enormous walls due to Titans, gigantic humanoid creatures.');

INSERT INTO titles (franchise_id, title, slug, media_type, release_date, episode_count, release_order, synopsis, is_completed) VALUES
(1, 'Bleach', 'bleach-anime', 'anime', '2004-10-05', 366, 1, 'The original anime adaptation following Ichigo Kurosaki.', true),
(1, 'Bleach: Manga', 'bleach-manga', 'manga', '2001-08-07', NULL, 0, 'The original manga by Tite Kubo spanning 74 volumes.', true),
(1, 'Bleach: Memories of Nobody', 'bleach-movie-1', 'movie', '2006-12-16', NULL, 2, 'First Bleach film featuring a mysterious Soul Reaper named Senna.', true),
(1, 'Bleach: The DiamondDust Rebellion', 'bleach-movie-2', 'movie', '2007-12-22', NULL, 3, 'Second Bleach film involving a stolen artifact from the Soul Society.', true),
(1, 'Bleach: Fade to Black', 'bleach-movie-3', 'movie', '2008-12-13', NULL, 4, 'Third Bleach film where two mysterious siblings erase Rukia''s memories.', true),
(1, 'Bleach: Hell Verse', 'bleach-movie-4', 'movie', '2010-12-04', NULL, 5, 'Fourth Bleach film featuring the realm of Hell.', true),
(1, 'Bleach: Thousand-Year Blood War', 'bleach-tybw', 'anime', '2022-10-11', 52, 6, 'The final arc of Bleach, covering the Quincy invasion of Soul Society.', false),
(2, 'Naruto', 'naruto-anime', 'anime', '2002-10-03', 220, 1, 'Original Naruto anime following young Naruto Uzumaki.', true),
(2, 'Naruto: Shippuden', 'naruto-shippuden', 'anime', '2007-02-15', 500, 2, 'Naruto returns after 2.5 years of training with Jiraiya.', true),
(2, 'Boruto: Naruto Next Generations', 'boruto', 'anime', '2017-04-05', 293, 3, 'Story of Naruto''s son, Boruto Uzumaki.', false),
(3, 'Attack on Titan', 'aot-anime', 'anime', '2013-04-07', 87, 1, 'The original Attack on Titan anime series.', true),
(3, 'Attack on Titan: Junior High', 'aot-junior-high', 'spin_off', '2015-10-05', 12, 2, 'Parody spinoff set in a school with Titans.', true);

INSERT INTO connections (source_title_id, target_title_id, connection_type, description, weight) VALUES
(1, 3, 'adaptation', 'Anime adaptation of the manga', 10),
(3, 1, 'sequel', 'Continuation after original anime', 9),
(8, 9, 'sequel', 'Shippuden continues after original Naruto', 10),
(9, 10, 'sequel', 'Boruto continues the next generation story', 8);

-- ===================== MORE SEED DATA =====================

-- More franchises
INSERT INTO franchises (name, slug, description) VALUES
('One Piece', 'one-piece', 'Follow Monkey D. Luffy and his crew in search of the ultimate treasure, the One Piece.'),
('Dragon Ball', 'dragon-ball', 'Follow Son Goku from childhood through adulthood as he trains in martial arts.'),
('Fullmetal Alchemist', 'fullmetal-alchemist', 'Two brothers use alchemy to try to restore their bodies after a failed ritual.'),
('Demon Slayer', 'demon-slayer', 'Tanjiro Kamado fights demons to cure his sister Nezuko after she is turned into one.'),
('My Hero Academia', 'my-hero-academia', 'In a world where most people have superpowers called Quirks, a boy born without them dreams of becoming a hero.'),
('Sword Art Online', 'sword-art-online', 'Players become trapped in a virtual reality MMORPG where death in-game means death in reality.'),
('Hunter x Hunter', 'hunter-x-hunter', 'Gon Freecss discovers his father is a world-renowned Hunter and sets out to follow in his footsteps.');

-- One Piece titles
INSERT INTO titles (franchise_id, title, slug, media_type, release_date, episode_count, release_order, synopsis, is_completed) VALUES
(4, 'One Piece', 'one-piece-anime', 'anime', '1999-10-20', NULL, 1, 'The original and ongoing One Piece anime series. Luffy and crew sail the Grand Line.', false),
(4, 'One Piece Manga', 'one-piece-manga', 'manga', '1997-07-22', NULL, 0, 'The original manga by Eiichiro Oda. Over 1100 chapters and still going.', false),
(4, 'One Piece: Dead End Adventure', 'one-piece-movie-4', 'movie', '2003-03-01', NULL, 2, 'The Straw Hats enter a secret pirate race.', true),
(4, 'One Piece Film: Strong World', 'one-piece-strong-world', 'movie', '2009-12-12', NULL, 3, 'Canon film written by Oda himself featuring Shiki the Golden Lion.', true),
(4, 'One Piece Film: Z', 'one-piece-film-z', 'movie', '2012-12-15', NULL, 4, 'The crew faces former Marine admiral Z.', true),
(4, 'One Piece Film: Red', 'one-piece-film-red', 'movie', '2022-08-06', NULL, 5, 'Uta, the world''s greatest diva and Shanks'' daughter, takes center stage.', true),
(4, 'One Piece: Episode of Nami', 'one-piece-ep-nami', 'special', '2012-08-24', NULL, 6, 'Retelling of the Arlong Park arc from Nami''s perspective.', true),
(4, 'One Piece: Romance Dawn', 'one-piece-romance-dawn', 'special', '2008-01-01', NULL, 7, 'Original pilot OVA for One Piece.', true);

-- Dragon Ball titles
INSERT INTO titles (franchise_id, title, slug, media_type, release_date, episode_count, release_order, synopsis, is_completed) VALUES
(5, 'Dragon Ball', 'dragon-ball-anime', 'anime', '1986-02-26', 153, 1, 'Young Goku''s original adventure collecting Dragon Balls.', true),
(5, 'Dragon Ball Manga', 'dragon-ball-manga', 'manga', '1984-11-20', NULL, 0, 'The original manga by Akira Toriyama, spanning 42 volumes.', true),
(5, 'Dragon Ball Z', 'dragon-ball-z', 'anime', '1989-04-26', 291, 2, 'Goku learns he is an alien and defends Earth from increasingly powerful foes.', true),
(5, 'Dragon Ball GT', 'dragon-ball-gt', 'anime', '1996-02-07', 64, 3, 'Non-canon continuation where Goku is turned back into a child.', true),
(5, 'Dragon Ball Super', 'dragon-ball-super', 'anime', '2015-07-05', 131, 4, 'After defeating Buu, Goku faces godly threats in a multiverse tournament.', true),
(5, 'Dragon Ball Z: Battle of Gods', 'dbz-battle-of-gods', 'movie', '2013-03-30', NULL, 5, 'Beerus, God of Destruction, searches for the Super Saiyan God.', true),
(5, 'Dragon Ball Super: Broly', 'dbs-broly', 'movie', '2018-12-14', NULL, 6, 'Canon film introducing Broly into the main continuity.', true),
(5, 'Dragon Ball Super: Super Hero', 'dbs-super-hero', 'movie', '2022-06-11', NULL, 7, 'Gohan and Piccolo face the Red Ribbon Army''s new Androids.', true);

-- FMA titles
INSERT INTO titles (franchise_id, title, slug, media_type, release_date, episode_count, release_order, synopsis, is_completed) VALUES
(6, 'Fullmetal Alchemist Manga', 'fma-manga', 'manga', '2001-07-12', NULL, 0, 'The original manga by Hiromu Arakawa. 27 volumes.', true),
(6, 'Fullmetal Alchemist (2003)', 'fma-2003', 'anime', '2003-10-04', 51, 1, 'The original anime adaptation, diverges from manga midway with a unique story.', true),
(6, 'Fullmetal Alchemist: Brotherhood', 'fma-brotherhood', 'anime', '2009-04-05', 64, 2, 'A faithful adaptation of the manga from start to finish. Widely considered a masterpiece.', true),
(6, 'FMA: Conqueror of Shamballa', 'fma-shamballa', 'movie', '2005-07-23', NULL, 3, 'Sequel film to the 2003 anime set in an alternate world.', true),
(6, 'FMA: The Sacred Star of Milos', 'fma-milos', 'movie', '2011-07-02', NULL, 4, 'Standalone film set in the Brotherhood continuity.', true);

-- Demon Slayer titles
INSERT INTO titles (franchise_id, title, slug, media_type, release_date, episode_count, release_order, synopsis, is_completed) VALUES
(7, 'Demon Slayer Manga', 'demon-slayer-manga', 'manga', '2016-02-15', NULL, 0, 'The original manga by Koyoharu Gotouge. 23 volumes.', true),
(7, 'Demon Slayer: Kimetsu no Yaiba', 'demon-slayer-anime', 'anime', '2019-04-06', 26, 1, 'Season 1 — Tanjiro''s journey begins and the battle against Muzan''s demons.', true),
(7, 'Demon Slayer: Mugen Train Arc', 'demon-slayer-mugen-arc', 'anime', '2021-10-10', 7, 2, 'TV adaptation of the Mugen Train movie with extra episodes.', true),
(7, 'Demon Slayer: Mugen Train', 'demon-slayer-mugen-movie', 'movie', '2020-10-16', NULL, 3, 'The Flame Hashira Rengoku faces the demon Akaza aboard the Mugen Train.', true),
(7, 'Demon Slayer: Entertainment District Arc', 'demon-slayer-s2', 'anime', '2021-12-05', 11, 4, 'Sound Hashira Tengen Uzui leads a mission in the Entertainment District.', true),
(7, 'Demon Slayer: Swordsmith Village Arc', 'demon-slayer-s3', 'anime', '2023-04-09', 11, 5, 'Tanjiro visits the Swordsmith Village and battles upper-rank demons.', true),
(7, 'Demon Slayer: Hashira Training Arc', 'demon-slayer-s4', 'anime', '2024-05-12', 8, 6, 'The Hashira prepare for the final battle against Muzan.', true);

-- Connections for One Piece
INSERT INTO connections (source_title_id, target_title_id, connection_type, description, weight) VALUES
((SELECT id FROM titles WHERE slug='one-piece-manga'), (SELECT id FROM titles WHERE slug='one-piece-anime'), 'adaptation', 'Anime adaptation of the manga', 10),
((SELECT id FROM titles WHERE slug='one-piece-anime'), (SELECT id FROM titles WHERE slug='one-piece-strong-world'), 'movie', 'Canon film released alongside the anime', 8),
((SELECT id FROM titles WHERE slug='one-piece-anime'), (SELECT id FROM titles WHERE slug='one-piece-film-red'), 'movie', 'Latest major film', 9);

-- Connections for Dragon Ball
INSERT INTO connections (source_title_id, target_title_id, connection_type, description, weight) VALUES
((SELECT id FROM titles WHERE slug='dragon-ball-anime'), (SELECT id FROM titles WHERE slug='dragon-ball-z'), 'sequel', 'DBZ continues directly after Dragon Ball', 10),
((SELECT id FROM titles WHERE slug='dragon-ball-z'), (SELECT id FROM titles WHERE slug='dragon-ball-super'), 'sequel', 'Super is set after the Buu saga in DBZ', 10),
((SELECT id FROM titles WHERE slug='dragon-ball-manga'), (SELECT id FROM titles WHERE slug='dragon-ball-anime'), 'adaptation', 'Original anime based on the manga', 10),
((SELECT id FROM titles WHERE slug='dragon-ball-super'), (SELECT id FROM titles WHERE slug='dbs-broly'), 'movie', 'Canon film set during Super', 9);

-- Connections for FMA
INSERT INTO connections (source_title_id, target_title_id, connection_type, description, weight) VALUES
((SELECT id FROM titles WHERE slug='fma-manga'), (SELECT id FROM titles WHERE slug='fma-2003'), 'adaptation', '2003 anime adapts the early manga then diverges', 8),
((SELECT id FROM titles WHERE slug='fma-manga'), (SELECT id FROM titles WHERE slug='fma-brotherhood'), 'adaptation', 'Brotherhood is a faithful manga adaptation', 10),
((SELECT id FROM titles WHERE slug='fma-2003'), (SELECT id FROM titles WHERE slug='fma-shamballa'), 'sequel', 'Movie sequel to the 2003 anime', 9),
((SELECT id FROM titles WHERE slug='fma-brotherhood'), (SELECT id FROM titles WHERE slug='fma-milos'), 'movie', 'Standalone film set in Brotherhood universe', 7);

-- Connections for Demon Slayer
INSERT INTO connections (source_title_id, target_title_id, connection_type, description, weight) VALUES
((SELECT id FROM titles WHERE slug='demon-slayer-manga'), (SELECT id FROM titles WHERE slug='demon-slayer-anime'), 'adaptation', 'Anime adaptation of the manga', 10),
((SELECT id FROM titles WHERE slug='demon-slayer-anime'), (SELECT id FROM titles WHERE slug='demon-slayer-mugen-movie'), 'sequel', 'Mugen Train picks up after Season 1', 10),
((SELECT id FROM titles WHERE slug='demon-slayer-mugen-movie'), (SELECT id FROM titles WHERE slug='demon-slayer-mugen-arc'), 'adaptation', 'TV arc covers the same events as the movie', 8),
((SELECT id FROM titles WHERE slug='demon-slayer-mugen-arc'), (SELECT id FROM titles WHERE slug='demon-slayer-s2'), 'sequel', 'Entertainment District follows Mugen Train', 10),
((SELECT id FROM titles WHERE slug='demon-slayer-s2'), (SELECT id FROM titles WHERE slug='demon-slayer-s3'), 'sequel', 'Swordsmith Village follows Entertainment District', 10),
((SELECT id FROM titles WHERE slug='demon-slayer-s3'), (SELECT id FROM titles WHERE slug='demon-slayer-s4'), 'sequel', 'Hashira Training follows Swordsmith Village', 10);

-- Tags
INSERT INTO tags (name, slug) VALUES
('Action', 'action'), ('Adventure', 'adventure'), ('Shounen', 'shounen'),
('Fantasy', 'fantasy'), ('Supernatural', 'supernatural'), ('Drama', 'drama'),
('Comedy', 'comedy'), ('Romance', 'romance'), ('Sci-Fi', 'sci-fi'),
('Horror', 'horror'), ('Mystery', 'mystery'), ('Slice of Life', 'slice-of-life'),
('Isekai', 'isekai'), ('Mecha', 'mecha'), ('Sports', 'sports'),
('Historical', 'historical'), ('Psychological', 'psychological'), ('Magic', 'magic');
