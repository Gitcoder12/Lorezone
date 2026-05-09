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
