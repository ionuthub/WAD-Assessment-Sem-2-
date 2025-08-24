// Centralised validation middleware using express-validator
// Provides reusable validators for various routes


import { body, validationResult } from 'express-validator';

// Helper to collapse excessive internal whitespace in user-provided text
const collapseSpaces = (v) => typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : v;

export const createResourceValidation = [
  body('name').isString().withMessage('Name is required')
    .customSanitizer(collapseSpaces)
    .trim().isLength({ min: 2, max: 120 }).withMessage('Name must be 2–120 characters')
    .escape(),
  body('description').isString().withMessage('Description is required')
    .customSanitizer(collapseSpaces)
    .trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10–1000 characters')
    .escape(),
  body('category')
    .customSanitizer(v => typeof v === 'string' ? collapseSpaces(v) : v)
    .trim()
    .customSanitizer(v => typeof v === 'string' ? v.replace(/\s+/g, ' ') : v)
    .isIn(['Clinic','Dentist','Pharmacy','Support Group','Hospital','Wellness Center'])
    .withMessage('Invalid category'),
  body('region').isString().withMessage('Region is required')
    .customSanitizer(collapseSpaces)
    .trim().isLength({ min: 2, max: 80 }).withMessage('Region must be 2–80 characters')
    .escape(),
  body('country').isString().withMessage('Country is required')
    .customSanitizer(collapseSpaces)
    .trim().isLength({ min: 2, max: 80 }).withMessage('Country must be 2–80 characters')
    .escape(),
  body('lat').customSanitizer(v => typeof v === 'string' ? parseFloat(v) : v)
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude out of range'),
  body('lon').customSanitizer(v => typeof v === 'string' ? parseFloat(v) : v)
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude out of range'),
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
  body('review').isString().withMessage('Review is required')
    .customSanitizer(collapseSpaces)
    .trim().isLength({ min: 1, max: 500 }).withMessage('Review must be 1–500 characters')
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

