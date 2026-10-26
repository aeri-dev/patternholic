CREATE TABLE IF NOT EXISTS beatmapsets (
  id INTEGER PRIMARY KEY,
  title TEXT,
  artist TEXT,
  creator TEXT,
  cover_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS beatmaps (
  id INTEGER PRIMARY KEY,
  beatmapset_id INTEGER,
  version TEXT,
  mode INTEGER,
  stars REAL,
  bpm REAL,
  cs REAL,
  ar REAL,
  od REAL,
  hp REAL,
  length_ms INTEGER,
  max_combo INTEGER,
  FOREIGN KEY(beatmapset_id) REFERENCES beatmapsets(id)
);

CREATE TABLE IF NOT EXISTS analyses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  beatmap_id INTEGER NOT NULL,
  algorithm_version TEXT NOT NULL,
  status TEXT NOT NULL,
  score REAL,
  metrics_json TEXT,
  events_json TEXT,
  warnings_json TEXT,
  file_hash TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  error_message TEXT,
  FOREIGN KEY(beatmap_id) REFERENCES beatmaps(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_analyses_unique ON analyses(beatmap_id, algorithm_version, file_hash);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON analyses(status);
CREATE INDEX IF NOT EXISTS idx_analyses_score ON analyses(score);

CREATE TABLE IF NOT EXISTS algorithm_versions (
  version TEXT PRIMARY KEY,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
