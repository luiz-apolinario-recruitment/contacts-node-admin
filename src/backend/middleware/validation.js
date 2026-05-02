const { body, validationResult } = require('express-validator');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array();
    return res.status(400).json({
      message: details[0]?.msg || 'Validation failed',
      errors: details
    });
  }
  next();
}

const contactValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 6 }).withMessage('Name must be more than 5 characters')
    .isLength({ max: 255 }).withMessage('Name must not exceed 255 characters'),
  body('contact')
    .trim()
    .notEmpty().withMessage('Contact is required')
    .matches(/^[0-9]{9}$/).withMessage('Contact must be exactly 9 digits'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  handleValidationErrors
];

const registerValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
    .isLength({ max: 50 }).withMessage('Username must not exceed 50 characters'),
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

const loginValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required'),
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

module.exports = { contactValidation, registerValidation, loginValidation, handleValidationErrors };
