import db from '../db/db.js';

export function create(resourceId, userId, content) {
  const insert = db.prepare('INSERT INTO reviews (resource_id, user_id, review) VALUES (?, ?, ?)');
  insert.run(resourceId, userId, content);
}

export function resourceExists(id) {
  return !!db.prepare('SELECT 1 FROM healthcare_resources WHERE id = ?').get(id);
}

export function list(resourceId) {
  return db.prepare('SELECT review FROM reviews WHERE resource_id = ? ORDER BY id DESC').all(resourceId);
}
