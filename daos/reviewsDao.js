import db from '../db/db.js';

export function create(resource_id, userId, review) {
  const rid = Number.parseInt(resource_id, 10);
  const uid = Number.parseInt(userId, 10);
  if (!Number.isInteger(rid) || rid < 1) throw Object.assign(new Error('Invalid resource_id'), { status: 400 });
  if (!Number.isInteger(uid) || uid < 1) throw Object.assign(new Error('Invalid user id'), { status: 400 });
  try {
    const stmt = db.prepare('INSERT INTO reviews (resource_id, user_id, review) VALUES (?, ?, ?)');
    const info = stmt.run(rid, uid, review);
    return db.prepare(`
      SELECT rv.id, rv.resource_id, rv.review, u.username, rv.created_at
      FROM reviews rv
      JOIN users u ON u.id = rv.user_id
      WHERE rv.id = ?
    `).get(info.lastInsertRowid);
  } catch (err) {
    // Handle UNIQUE constraint (one review per user per resource)
    if (err && (err.code === 'SQLITE_CONSTRAINT' || String(err.message || '').includes('UNIQUE constraint failed'))) {
      throw Object.assign(new Error('You have already reviewed this resource'), { status: 409 });
    }
    throw err;
  }
}

export function resourceExists(id) {
  const rid = Number.parseInt(id, 10);
  if (!Number.isInteger(rid) || rid < 1) return false;
  return !!db.prepare('SELECT 1 FROM healthcare_resources WHERE id = ?').get(rid);
}

export function hasUserReviewed(resource_id, userId) {
  const stmt = db.prepare('SELECT 1 FROM reviews WHERE resource_id = ? AND user_id = ?');
  return !!stmt.get(resource_id, userId);
}

export function getForResource(resource_id, { limit = 100, offset = 0 } = {}) {
  const rid = Number.parseInt(resource_id, 10);
  if (!Number.isInteger(rid) || rid < 1) return [];
  return db.prepare(`
    SELECT rv.id, rv.resource_id, rv.review, u.username, rv.created_at
    FROM reviews rv
    JOIN users u ON u.id = rv.user_id
    WHERE rv.resource_id = ?
    ORDER BY rv.created_at DESC
    LIMIT ? OFFSET ?
  `).all(rid, limit, offset);
}
