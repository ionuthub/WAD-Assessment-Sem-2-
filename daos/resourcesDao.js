import db from '../db/db.js';

export function getAll(region) {
  let sql = `
    SELECT
      hr.*,
      -- Concatenate reviews via a correlated subquery (no table alias needed)
      (SELECT GROUP_CONCAT(review, '|||')
         FROM reviews
        WHERE resource_id = hr.id)           AS reviews_concat,
      -- Count reviews via a correlated subquery
      (SELECT COUNT(*)
         FROM reviews
        WHERE resource_id = hr.id)           AS review_count
    FROM healthcare_resources hr
  `;
  const params = [];
  if (region) {
    sql += ` WHERE hr.region LIKE ? COLLATE NOCASE `;
    params.push(`%${region}%`);
  }
  sql += `
    ORDER BY COALESCE(hr.recommendations, 0) DESC, hr.name ASC
  `;

  const rows = db.prepare(sql).all(...params);
  return rows.map((r) => {
    const rec = r.recommendations ?? r.likes ?? 0;
    const { reviews_concat, review_count, ...rest } = r;
    const out = {
      ...rest,
      recommendations: rec,
      review_count: Number(review_count || 0),
      reviews: reviews_concat ? reviews_concat.split('|||').map((review) => ({ review })) : []
    };
    if ('likes' in out) delete out.likes;
    return out;
  });
}

export function create(resource) {
  const { name, category, country, description, region, lat, lon } = resource;
  const clean = (s) => (typeof s === 'string' ? s.replace(/\s+/g, ' ').trim() : s);
  const nameC = clean(name);
  const categoryC = clean(category);
  const countryC = clean(country);
  const descriptionC = clean(description);
  const regionC = clean(region);

  const stmt = db.prepare(`
    INSERT INTO healthcare_resources (name, category, country, description, region, lat, lon)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(nameC, categoryC, countryC, descriptionC, regionC, Number(lat), Number(lon));

  const row = db.prepare('SELECT * FROM healthcare_resources WHERE id = ?').get(info.lastInsertRowid);
  return {
    ...row,
    recommendations: row.recommendations ?? row.likes ?? 0,
    reviews: []
  };
}

export function incrementRecommendations(id) {
  const rid = Number.parseInt(id, 10);
  if (!Number.isInteger(rid) || rid < 1) return null;

  try {
    const update = db.prepare('UPDATE healthcare_resources SET recommendations = COALESCE(recommendations, 0) + 1 WHERE id = ?');
    const info = update.run(rid);
    if (info.changes === 0) return null;
    return db.prepare('SELECT * FROM healthcare_resources WHERE id = ?').get(rid);
  } catch (err) {
    // Auto-migrate legacy column name 'likes' -> 'recommendations'
    if (String(err.message || '').includes('no such column: recommendations')) {
      try {
        db.exec('ALTER TABLE healthcare_resources RENAME COLUMN likes TO recommendations;');
        const info = db.prepare('UPDATE healthcare_resources SET recommendations = COALESCE(recommendations, 0) + 1 WHERE id = ?').run(rid);
        if (info.changes === 0) return null;
        return db.prepare('SELECT * FROM healthcare_resources WHERE id = ?').get(rid);
      } catch (e) {
        throw e;
      }
    }
    throw err;
  }
}
