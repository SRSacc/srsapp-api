// models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { updateSubscriberStatus } = require('../utils/subscription.util');

/**
 * User Schema
 * @typedef {Object} User
 * @property {string} username - Unique username
 * @property {string} password - Hashed password
 * @property {string} role - User role (manager, receptionist, subscriber)
 * @property {Object} subscriberDetails - Details for subscriber users
 * @property {string} subscriberDetails.name - Full name of subscriber
 * @property {string} subscriberDetails.phoneNumber - Phone number
 * @property {string} subscriberDetails.referral - Referral information
 * @property {string} subscriberDetails.subscriptionType - Type of subscription
 * @property {string} subscriberDetails.subscriberType - Type of subscriber
 * @property {Date} subscriberDetails.dateOfSubscription - Date subscription started
 * @property {Date} subscriberDetails.expiresOn - Automatically calculated expiration date
 * @property {string} subscriberDetails.image - Path to subscriber image
 * @property {string} subscriberDetails.status - Subscription status (active, expiring, expired)
 * @property {Date} createdAt - Date user was created
 * @property {Date} updatedAt - Date user was last updated
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
    name : String,
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
    dateOfSubscription: Date,
    expiresOn: Date,  // Added expiresOn field
    image: String,
    status: {
      type: String,
      enum: ['active', 'expiring', 'expired']
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
  if (this.role === 'subscriber' && this.subscriberDetails && this.subscriberDetails.expiresOn) {
    updateSubscriberStatus(this);
  }
  next();
});

userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
