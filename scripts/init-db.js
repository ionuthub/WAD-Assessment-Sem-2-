// Initialize database schema for DiscoverHealth app
import db from '../db/db.js';

console.log('Initializing database schema...');

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
    review TEXT NOT NULL,
    FOREIGN KEY (resource_id) REFERENCES healthcare_resources(id) ON DELETE CASCADE
  );
`);

console.log('Database schema initialized successfully.');
process.exit();
