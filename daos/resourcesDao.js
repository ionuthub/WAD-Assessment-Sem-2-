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
    ORDER BY COALESCE(hr.recommendations, 0) DESC, hr.name ASC
  `;

  const processResults = (resources) =>
    resources.map(r => {
      const rec = r.recommendations ?? r.likes ?? 0;
      const { reviews_concat, ...rest } = r;
      const out = {
        ...rest,
        recommendations: rec,
        reviews: reviews_concat ? reviews_concat.split('|||').map(review => ({ review })) : []
      };
      // Remove legacy key if present to avoid confusion
      if ('likes' in out) delete out.likes;
      return out;
    });

  if (region) {
    const stmt = db.prepare(`${query.replace('ORDER BY COALESCE(hr.recommendations, 0) DESC, hr.name ASC', '')} WHERE hr.region LIKE ? COLLATE NOCASE ORDER BY COALESCE(hr.recommendations, 0) DESC, hr.name ASC`);
    const resources = stmt.all(`%${region}%`);
    return processResults(resources);
  }

  const resources = db.prepare(query).all();
  return processResults(resources);
}

export function create(resource) {
  const { name, category, country, description, region, lat, lon } = resource;
  const stmt = db.prepare(`INSERT INTO healthcare_resources (name, category, country, description, region, lat, lon) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const info = stmt.run(name, category, country, description, region, Number(lat), Number(lon));
  return db.prepare('SELECT * FROM healthcare_resources WHERE id = ?').get(info.lastInsertRowid);
}

export function incrementRecommendations(id) {
  try {
    const update = db.prepare('UPDATE healthcare_resources SET recommendations = COALESCE(recommendations, 0) + 1 WHERE id = ?');
    const info = update.run(id);
    if (info.changes === 0) return null;
    return db.prepare('SELECT * FROM healthcare_resources WHERE id = ?').get(id);
  } catch (err) {
    // Auto-migrate legacy column name 'likes' -> 'recommendations'
    if (String(err.message || '').includes('no such column: recommendations')) {
      try {
        db.exec('ALTER TABLE healthcare_resources RENAME COLUMN likes TO recommendations;');
        const info = db.prepare('UPDATE healthcare_resources SET recommendations = COALESCE(recommendations, 0) + 1 WHERE id = ?').run(id);
        if (info.changes === 0) return null;
        return db.prepare('SELECT * FROM healthcare_resources WHERE id = ?').get(id);
      } catch (e) {
        throw e;
      }
    }
    throw err;
  }
}

