// Initialize database schema for DiscoverHealth app
import db from '../db/db.js';

console.log('Initializing database schema...');

// Ensure FK enforcement
db.exec(`PRAGMA foreign_keys = ON;`);

// Base tables (create if not exists)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    isAdmin INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS healthcare_resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    country TEXT NOT NULL,
    description TEXT,
    region TEXT NOT NULL,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    recommendations INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_id INTEGER NOT NULL,
    user_id INTEGER,
    review TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES healthcare_resources(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Backfill columns if older DB
const reviewCols = db.prepare('PRAGMA table_info(reviews)').all().map(c => c.name);
if (!reviewCols.includes('user_id')) {
  db.exec(`ALTER TABLE reviews ADD COLUMN user_id INTEGER;`);
}
if (!reviewCols.includes('created_at')) {
  db.exec(`ALTER TABLE reviews ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;`);
}

// Ensure recommendations column exists; migrate legacy 'likes' if present
try {
  db.exec(`ALTER TABLE healthcare_resources ADD COLUMN recommendations INTEGER DEFAULT 0;`);
} catch (_) { /* ignore if exists */ }
try {
  db.exec(`ALTER TABLE healthcare_resources RENAME COLUMN likes TO recommendations;`);
} catch (_) { /* ignore if likes doesn't exist */ }
db.exec(`UPDATE healthcare_resources SET recommendations = COALESCE(recommendations, 0);`);

// Indexes (idempotent)
db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique ON reviews(resource_id, user_id);
  CREATE INDEX IF NOT EXISTS idx_resources_region ON healthcare_resources(region);
  CREATE INDEX IF NOT EXISTS idx_reviews_resource ON reviews(resource_id);
`);

// Triggers to enforce review quality and non-null user_id at DB layer
db.exec(`
  DROP TRIGGER IF EXISTS trg_reviews_validate_insert;
  DROP TRIGGER IF EXISTS trg_reviews_validate_update;

  CREATE TRIGGER trg_reviews_validate_insert
  BEFORE INSERT ON reviews
  FOR EACH ROW
  BEGIN
    SELECT
      CASE
        WHEN NEW.user_id IS NULL THEN RAISE(ABORT, 'user_id required')
        WHEN length(trim(NEW.review)) < 1 THEN RAISE(ABORT, 'Review must be 1–500 chars')
        WHEN length(trim(NEW.review)) > 500 THEN RAISE(ABORT, 'Review must be 1–500 chars')
      END;
  END;

  CREATE TRIGGER trg_reviews_validate_update
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  BEGIN
    SELECT
      CASE
        WHEN NEW.user_id IS NULL THEN RAISE(ABORT, 'user_id required')
        WHEN length(trim(NEW.review)) < 1 THEN RAISE(ABORT, 'Review must be 1–500 chars')
        WHEN length(trim(NEW.review)) > 500 THEN RAISE(ABORT, 'Review must be 1–500 chars')
      END;
  END;
`);

console.log('Database schema initialized successfully.');
