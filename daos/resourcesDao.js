import db from '../db/db.js';

export function getAll(region) {
  const query = `
    SELECT
      hr.*,
      (
        SELECT GROUP_CONCAT(r.review, '|||')
        FROM reviews r
        WHERE r.resource_id = hr.id
      ) as reviews_concat
    FROM healthcare_resources hr
  `;

  const processResults = (resources) =>
    resources.map(r => ({
      ...r,
      reviews: r.reviews_concat ? r.reviews_concat.split('|||').map(review => ({ review })) : []
    }));

  if (region) {
    const stmt = db.prepare(`${query} WHERE hr.region LIKE ? COLLATE NOCASE`);
    const resources = stmt.all(`%${region}%`);
    return processResults(resources);
  }

  const resources = db.prepare(query).all();
  return processResults(resources);
}

export function create(resource) {
  const { name, category, country, description, region, lat, lon } = resource;
  const stmt = db.prepare(`INSERT INTO healthcare_resources (name, category, country, description, region, lat, lon) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const info = stmt.run(name, category, country, description, region, lat, lon);
  return db.prepare('SELECT * FROM healthcare_resources WHERE id = ?').get(info.lastInsertRowid);
}

export function incrementLikes(id) {
  const update = db.prepare('UPDATE healthcare_resources SET likes = likes + 1 WHERE id = ?');
  const info = update.run(id);
  if (info.changes === 0) return null;
  return db.prepare('SELECT * FROM healthcare_resources WHERE id = ?').get(id);
}
