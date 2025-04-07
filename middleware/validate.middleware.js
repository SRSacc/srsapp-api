const { body, validationResult } = require('express-validator');

exports.validateSubscriber = [
  body('fullName').trim().notEmpty().withMessage('Name is required'),
  body('subscriptionType').isIn([
    'Half-day (morning)',
    'Half-day (night)',
    'Full day',
    'Weekly (day-only)',
    'Weekly (full-access)',
    'Bi-weekly (day-only)',
    'Bi-weekly (full-access)',
    'Monthly (day-only)',
    'Monthly (full-access)'
  ]).withMessage('Invalid subscription type'),
  body('dateOfSubscription').optional().isISO8601().withMessage('Invalid date format'),
  body('status').optional().isIn(['active', 'expiring', 'expired']).withMessage('Invalid status'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];