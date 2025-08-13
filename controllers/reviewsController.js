import * as reviewsDao from '../daos/reviewsDao.js';

export function create(req, res, next) {
  try {
    const { resource_id, review } = req.body;
    const userId = req.session.user.id;

    if (reviewsDao.hasUserReviewed(resource_id, userId)) {
      return res.status(409).json({ error: 'You have already reviewed this resource.' });
    }

    if (!reviewsDao.resourceExists(resource_id)) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const newReview = reviewsDao.create(resource_id, userId, review.trim());
    res.status(201).json(newReview);
  } catch (err) {
    next(err);
  }
}
