import * as resourcesDao from '../daos/resourcesDao.js';

export function list(req, res, next) {
  try {
    const resources = resourcesDao.getAll(req.query.region);
    res.json(resources);
  } catch (err) {
    next(err);
  }
}

export function create(req, res, next) {
  try {
    const { name, category, country, description, region, lat, lon } = req.body;
    if (!name || !category || !country || !description || !region || lat == null || lon == null) {
      return res.status(400).json({ error: 'All fields required' });
    }
    const resource = resourcesDao.create({ name, category, country, description, region, lat, lon });
    res.status(201).json(resource);
  } catch (err) {
    next(err);
  }
}

export function like(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
    const resource = resourcesDao.incrementLikes(id);
    if (!resource) return res.status(404).json({ error: 'Not found' });
    res.json(resource);
  } catch (err) {
    next(err);
  }
}
