const { body, validationResult } = require('express-validator');

exports.validateSubscriber = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').isIn(['active', 'expiring', 'expired']).withMessage('Invalid status'),
  body('expiresOn').isISO8601().withMessage('Invalid date format'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];