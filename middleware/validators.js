// Centralised validation middleware using express-validator
// Provides reusable validators for various routes

import { body, param, validationResult } from 'express-validator';

export const createResourceValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('region').trim().notEmpty().withMessage('Region is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be valid'),
  body('lon').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be valid'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const createReviewValidation = [
  body('resource_id').isInt({ gt: 0 }).withMessage('resource_id must be a positive integer'),
  body('review').trim().notEmpty().withMessage('review cannot be empty'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
