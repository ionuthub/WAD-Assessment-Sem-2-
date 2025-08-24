import db from '../db/db.js';

export function create(resource_id, userId, review) {
  const stmt = db.prepare('INSERT INTO reviews (resource_id, user_id, review) VALUES (?, ?, ?)');
  const info = stmt.run(resource_id, userId, review);
  return db.prepare(`
    SELECT rv.id, rv.resource_id, rv.review, u.username, rv.created_at
    FROM reviews rv
    JOIN users u ON u.id = rv.user_id
    WHERE rv.id = ?
  `).get(info.lastInsertRowid);
}

export function resourceExists(id) {
  return !!db.prepare('SELECT 1 FROM healthcare_resources WHERE id = ?').get(id);
}

export function hasUserReviewed(resource_id, userId) {
  const stmt = db.prepare('SELECT 1 FROM reviews WHERE resource_id = ? AND user_id = ?');
  return !!stmt.get(resource_id, userId);
}
