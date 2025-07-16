import express from 'express';
import * as reviewsController from '../controllers/reviewsController.js';
import { createReviewValidation } from '../middleware/validators.js';
import requireAuth from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', reviewsController.list);
router.post('/', createReviewValidation, reviewsController.create);

export default router;