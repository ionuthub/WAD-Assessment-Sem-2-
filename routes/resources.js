import express from 'express';
import * as resourcesController from '../controllers/resourcesController.js';
import requireAuth from '../middleware/auth.js';
import { createResourceValidation } from '../middleware/validators.js';

const router = express.Router();

router.get('/', resourcesController.list);
router.post('/', requireAuth, createResourceValidation, resourcesController.create);
router.post('/:id/like', resourcesController.like);

export default router;