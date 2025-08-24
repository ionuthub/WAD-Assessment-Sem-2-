// Initialize database schema for DiscoverHealth app
import db from '../db/db.js';

console.log('Initializing database schema...');

// Base tables (create if not exists)
db.exec(`
  PRAGMA foreign_keys = ON;

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

// Migration: add columns to existing reviews table if missing
const cols = db.prepare('PRAGMA table_info(reviews)').all();
const hasUserId = cols.some(c => c.name === 'user_id');
const hasCreatedAt = cols.some(c => c.name === 'created_at');

if (!hasUserId) {
  db.exec(`ALTER TABLE reviews ADD COLUMN user_id INTEGER;`);
}
if (!hasCreatedAt) {
  db.exec(`ALTER TABLE reviews ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;`);
}

// Indexes (safe to run repeatedly)
db.exec(`
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
process.exit();
