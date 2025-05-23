// models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { updateSubscriberStatus } = require('../utils/subscription.util');

/**
 * User Schema
 * @typedef {Object} UserSchema
 * @property {string} username - Unique identifier for the user
 * @property {string} [password] - Required for all roles except subscriber
 * @property {('manager'|'receptionist'|'subscriber')} role - User role in the system
 * @property {Object} subscriberDetails - Details specific to subscriber role
 * @property {string} subscriberDetails.name  - Subscriber's full name
 * @property {string} subscriberDetails.phoneNumber - Contact number
 * @property {string} subscriberDetails.referral - Referral information
 * @property {string} subscriberDetails.subscriptionType - Type of subscription plan
 * @property {('Regular Subscriber'|'SRS Worker')} subscriberDetails.subscriberType - Category of subscriber
 * @property {Date} subscriberDetails.dateOfSubscription - Start date of subscription
 * @property {Date} subscriberDetails.startDateTime - Start date and time of subscription
 * @property {Date} subscriberDetails.endDateTime - Daily access end time
 * @property {Date} subscriberDetails.expirationDate - Subscription expiry date
 * @property {string} subscriberDetails.image - Profile image URL
 * @property {('active'|'expiring'|'expired'|'pending')} subscriberDetails.status - Current subscription status
 */

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function () {
      return this.role !== 'subscriber';
    }
  },
  role: {
    type: String,
    enum: ['manager', 'receptionist', 'subscriber'],
    required: true
  },
  subscriberDetails: {
    name: String,
    phoneNumber: String,
    referral: String,
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
    dateOfSubscription: Date,
    startDateTime: Date,
    endDateTime: Date,
    expirationDate: Date,
    image: String,
    status: {
      type: String,
      enum: ['active', 'expiring', 'expired', 'pending'],
      default: 'active'
    }
  }
}, { timestamps: true });

// Password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Update status based on expiry date before saving
userSchema.pre('save', function(next) {
  if (this.role === 'subscriber' && this.subscriberDetails && this.subscriberDetails.expirationDate) {
    updateSubscriberStatus(this);
  }
  next();
});

userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
