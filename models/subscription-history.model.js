const mongoose = require('mongoose');

/**
 * Subscription History Schema
 * @typedef {Object} SubscriptionHistorySchema
 * @property {ObjectId} userId - Reference to the User model
 * @property {string} subscriptionType - Type of subscription plan
 * @property {('Regular Subscriber'|'SRS Worker')} subscriberType - Category of subscriber
 * @property {('Self'|'Company')} paymentMode - Mode of payment
 * @property {Date} dateOfSubscription - Start date of subscription
 * @property {Date} startDateTime - Start date and time of subscription
 * @property {Date} endDateTime - Daily access end time
 * @property {Date} expirationDate - Subscription expiry date
 * @property {('active'|'expiring'|'expired'|'pending')} status - Subscription status at the time of archival
 * @property {Date} createdAt - Timestamp when the record was created
 * @property {Date} updatedAt - Timestamp when the record was last updated
 */

const subscriptionHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscriptionType: {
    type: String,
    enum: [
      'Half-day (morning)',
      'Half-day (night)',
      'Full day',
      'Weekly (day-only)',
      'Weekly (full-access)',
      'Bi-weekly (day-only)',
      'Bi-weekly (full-access)',
      'Monthly (day-only)',
      'Monthly (full-access)'
    ],
    required: true
  },
  subscriberType: {
    type: String,
    enum: ['Regular Subscriber', 'SRS Worker']
  },
  paymentMode: {
    type: String,
    enum: ['Self', 'Company'],
    default: 'Self'
  },
  dateOfSubscription: {
    type: Date,
    required: true
  },
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },
  expirationDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expiring', 'expired', 'pending'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionHistory', subscriptionHistorySchema);