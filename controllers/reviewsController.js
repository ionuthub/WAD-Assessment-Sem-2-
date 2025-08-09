import * as reviewsDao from '../daos/reviewsDao.js';

export function create(req, res, next) {
  try {
    const { resource_id, review } = req.body;
    if (!resource_id || !review) {
      return res.status(400).json({ error: 'resource_id and review required' });
    }
    if (!reviewsDao.resourceExists(resource_id)) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    reviewsDao.create(resource_id, req.session.user.id, review.trim());
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
