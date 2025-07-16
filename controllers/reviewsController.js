import * as reviewsDao from '../daos/reviewsDao.js';

export function create(req, res, next) {
  try {
    const { resourceId, content } = req.body;
    if (!resourceId || !content) {
      return res.status(400).json({ error: 'resourceId and content required' });
    }
    if (!reviewsDao.resourceExists(resourceId)) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    reviewsDao.create(resourceId, req.session.user.id, content.trim());
    res.json({ message: 'Review added' });
  } catch (err) {
    next(err);
  }
}

export function list(req, res, next) {
  try {
    const { id } = req.params;
    const reviews = reviewsDao.list(id);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}
