// Centralised validation middleware using express-validator
// Provides reusable validators for various routes

import { body, validationResult } from 'express-validator';

export const createResourceValidation = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Name must be 2–120 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10–1000 characters'),
  body('category').isIn(['Clinic','Dentist','Pharmacy','Support Group','Hospital','Wellness Center']).withMessage('Invalid category'),
  body('region').trim().isLength({ min: 2, max: 80 }).withMessage('Region must be 2–80 characters'),
  body('country').trim().isLength({ min: 2, max: 80 }).withMessage('Country must be 2–80 characters'),
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude out of range'),
  body('lon').isFloat({ min: -180, max: 180 }).withMessage('Longitude out of range'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const createReviewValidation = [
  body('resource_id').isInt({ min: 1 }).withMessage('Valid resource_id required'),
  body('review').trim().isLength({ min: 1, max: 500 }).withMessage('Review must be 1–500 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

