const { body, validationResult } = require('express-validator');
const { SUBSCRIPTION_TYPES } = require('../utils/subscription.util');

exports.validateSubscriber = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('subscriptionType').isIn(Object.values(SUBSCRIPTION_TYPES)).withMessage('Invalid subscription type'),
  body('dateOfSubscription').optional().isISO8601().withMessage('Invalid date format'),
  body('status').optional().isIn(['active', 'expiring', 'expired', 'pending']).withMessage('Invalid status'),
  body('subscriberType').isIn(['Regular Subscriber', 'SRS Worker']).withMessage('Invalid subscriber type'),
  body('paymentMode').isIn(['Self', 'Company']).withMessage('Invalid payment mode'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];