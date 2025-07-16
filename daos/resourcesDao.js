import db from '../db/db.js';

export function getAll(region) {
  if (region) {
    const stmt = db.prepare('SELECT * FROM healthcare_resources WHERE region LIKE ? COLLATE NOCASE');
    return stmt.all(`%${region}%`);
  }
  return db.prepare('SELECT * FROM healthcare_resources').all();
}

export function create(resource) {
  const { name, category, country, description, region, lat, lon } = resource;
  const stmt = db.prepare(`INSERT INTO healthcare_resources (name, category, country, description, region, lat, lon) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const info = stmt.run(name, category, country, description, region, lat, lon);
  return db.prepare('SELECT * FROM healthcare_resources WHERE id = ?').get(info.lastInsertRowid);
}

export function incrementRecommendation(id) {
  const update = db.prepare('UPDATE healthcare_resources SET recommendations = recommendations + 1 WHERE id = ?');
  const info = update.run(id);
  if (info.changes === 0) return null;
  return db.prepare('SELECT * FROM healthcare_resources WHERE id = ?').get(id);
}
