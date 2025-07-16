import express from 'express';
import * as usersController from '../controllers/usersController.js';

const router = express.Router();

router.post('/signup', usersController.signup);
router.post('/login',  usersController.login);
router.post('/logout', usersController.logout);
router.get ('/me',     usersController.me);

export default router;