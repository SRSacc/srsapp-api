// models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * @typedef {Object} User
 * @property {string} username - Unique username
 * @property {string} password - Hashed password
 * @property {string} role - User role (manager, receptionist, subscriber)
 * @property {Object} subscriberDetails - Details for subscriber users
 * @property {string} subscriberDetails.fullName - Full name of subscriber
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
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    select: false
  },
  role: {
    type: String,
    enum: ['manager', 'receptionist', 'subscriber'],
    default: 'subscriber'
  },
  subscriberDetails: {
    fullName: String,
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
      required: function() {
        return this.role === 'subscriber';
      }
    },
    subscriberType: {
      type: String,
      enum: ['Regular Subscriber', 'SRS Worker'],
      required: function() {
        return this.role === 'subscriber';
      }
    },
    dateOfSubscription: {
      type: Date,
      required: function() {
        return this.role === 'subscriber';
      }
    },
    expiresOn: {
      type: Date
    },
    image: String,
    status: {
      type: String,
      enum: ['active', 'expiring', 'expired'],
      default: 'active'
    }
  }
}, {
  timestamps: true
});

// Password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Add the comparePassword method to the schema
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Check if password exists before comparing
  if (!this.password) {
    return false;
  }
  
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);
