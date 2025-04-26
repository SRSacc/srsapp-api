// utils/subscription.util.js
const moment = require('moment');

// Time configuration constants
const TIME_CONFIG = {
  DAY_END: '18:00',     // 6:00 PM
  NIGHT_END: '06:30',   // 6:30 AM next day
  NOTIFICATION_BEFORE: 60 // minutes before expiry
};

// Subscription types
const SUBSCRIPTION_TYPES = {
  HALF_DAY_MORNING: 'Half-day (morning)',
  HALF_DAY_NIGHT: 'Half-day (night)',
  FULL_DAY: 'Full day',
  WEEKLY_DAY: 'Weekly (day-only)',
  WEEKLY_FULL: 'Weekly (full-access)',
  BIWEEKLY_DAY: 'Bi-weekly (day-only)',
  BIWEEKLY_FULL: 'Bi-weekly (full-access)',
  MONTHLY_DAY: 'Monthly (day-only)',
  MONTHLY_FULL: 'Monthly (full-access)'
};

/**
 * Calculate daily end time based on subscription type and start time
 * @param {moment} startDateTime - Start date and time
 * @param {string} subscriptionType - Type of subscription
 * @returns {moment} End date and time for daily access
 */
const calculateEndTime = (startDateTime, subscriptionType) => {
  const isDayOnly = [
    SUBSCRIPTION_TYPES.HALF_DAY_MORNING,
    SUBSCRIPTION_TYPES.WEEKLY_DAY,
    SUBSCRIPTION_TYPES.BIWEEKLY_DAY,
    SUBSCRIPTION_TYPES.MONTHLY_DAY
  ].includes(subscriptionType);

  if (isDayOnly) {
    // Day-only access ends at 18:00 (6:00 PM) same day
    return moment(startDateTime).format('YYYY-MM-DD') + 'T' + TIME_CONFIG.DAY_END + ':00';
  } else {
    // Night/Full access ends at 06:30 (6:30 AM) next day
    return moment(startDateTime).add(1, 'day').format('YYYY-MM-DD') + 'T' + TIME_CONFIG.NIGHT_END + ':00';
  }
};

/**
 * Calculate expiration date based on subscription type and start date
 * @param {moment} startDateTime - Start date and time
 * @param {string} subscriptionType - Type of subscription
 * @returns {moment} Expiration date
 */
const calculateExpirationDate = (startDateTime, subscriptionType) => {
  const start = moment(startDateTime);
  
  switch (subscriptionType) {
    case SUBSCRIPTION_TYPES.HALF_DAY_MORNING:
      // Same day at 18:00
      return moment(start.format('YYYY-MM-DD') + 'T' + TIME_CONFIG.DAY_END + ':00');
    
    case SUBSCRIPTION_TYPES.HALF_DAY_NIGHT:
    case SUBSCRIPTION_TYPES.FULL_DAY:
      // Next day at 06:30
      return moment(start.add(1, 'day').format('YYYY-MM-DD') + 'T' + TIME_CONFIG.NIGHT_END + ':00');
    
    case SUBSCRIPTION_TYPES.WEEKLY_DAY:
    case SUBSCRIPTION_TYPES.WEEKLY_FULL:
      // Start date + 7 days
      return start.add(7, 'days').endOf('day');
    
    case SUBSCRIPTION_TYPES.BIWEEKLY_DAY:
    case SUBSCRIPTION_TYPES.BIWEEKLY_FULL:
      // Start date + 14 days
      return start.add(14, 'days').endOf('day');
    
    case SUBSCRIPTION_TYPES.MONTHLY_DAY:
    case SUBSCRIPTION_TYPES.MONTHLY_FULL:
      // Start date + 1 month - 1 day
      return start.add(1, 'month').subtract(1, 'day').endOf('day');
    
    default:
      return start.endOf('day');
  }
};

/**
 * Validate subscription timing based on type and start time
 * @param {string} subscriptionType - Type of subscription
 * @param {moment} startDateTime - Start date and time
 * @returns {Object} Validation result with isValid and message
 */
const validateSubscriptionTiming = (subscriptionType, startDateTime) => {
  const currentHour = moment().hour();
  const startHour = moment(startDateTime).hour();
  
  // Morning shift subscriptions cannot be registered after 18:00
  if (subscriptionType === SUBSCRIPTION_TYPES.HALF_DAY_MORNING && currentHour >= 18) {
    return {
      isValid: false,
      message: 'Morning shift subscriptions cannot be registered after 6:00 PM'
    };
  }
  
  // Night shift subscriptions must start after 18:00
  if (subscriptionType === SUBSCRIPTION_TYPES.HALF_DAY_NIGHT && startHour < 18) {
    return {
      isValid: false,
      message: 'Night shift subscriptions must start after 6:00 PM'
    };
  }
  
  return { isValid: true };
};

/**
 * Determine subscription status based on current time, start time and expiration date
 * @param {Date} startDateTime - Subscription start date and time
 * @param {Date} expirationDate - Subscription expiry date
 * @returns {Object} Status object with status, message, and additional properties
 */
const determineStatus = (startDateTime, expirationDate) => {
  const now = moment();
  const start = moment(startDateTime);
  const expiry = moment(expirationDate);
  const minutesRemaining = expiry.diff(now, 'minutes');
  
  // Pending: Current time is before start time
  if (now.isBefore(start)) {
    return {
      status: 'pending',
      message: `Subscription will be active at ${start.format('MMMM Do YYYY, h:mm a')}`
    };
  }
  
  // Expired: Current time is after expiration
  if (minutesRemaining < 0) {
    return {
      status: 'expired',
      message: 'Subscription has expired'
    };
  }
  
  // Expiring: Within 60 minutes of expiration
  if (minutesRemaining <= TIME_CONFIG.NOTIFICATION_BEFORE) {
    return {
      status: 'expiring',
      message: `Subscription expires in ${minutesRemaining} minutes`,
      endTime: expiry.toISOString(),
      urgent: minutesRemaining <= 15 // Urgent if within 15 minutes
    };
  }
  
  // Active: Current time is between start and expiration
  return {
    status: 'active',
    message: 'Subscription is active',
    endTime: expiry.toISOString()
  };
};

/**
 * Update subscriber status based on current date and expiry date
 * @param {Object} subscriber - Subscriber document
 * @returns {string} Updated status
 */
const updateSubscriberStatus = (subscriber) => {
  if (!subscriber.subscriberDetails.startDateTime || !subscriber.subscriberDetails.expirationDate) {
    return subscriber.subscriberDetails.status;
  }
  
  const statusInfo = determineStatus(
    subscriber.subscriberDetails.startDateTime,
    subscriber.subscriberDetails.expirationDate
  );
  
  subscriber.subscriberDetails.status = statusInfo.status;
  return statusInfo.status;
};

/**
 * Process subscription data to calculate all required fields
 * @param {Object} subscriptionData - Subscription data from request
 * @returns {Object} Processed subscription data with calculated fields
 */
const processSubscription = (subscriptionData) => {
  const startDateTime = moment(subscriptionData.dateOfSubscription);
  
  // Calculate end and expiration times
  const endDateTime = calculateEndTime(startDateTime, subscriptionData.subscriptionType);
  const expirationDate = calculateExpirationDate(startDateTime, subscriptionData.subscriptionType);
  
  // Determine initial status
  const statusInfo = determineStatus(startDateTime, expirationDate);
  
  return {
    ...subscriptionData,
    startDateTime: startDateTime.toISOString(),
    endDateTime: moment(endDateTime).toISOString(),
    expirationDate: expirationDate.toISOString(),
    status: statusInfo.status
  };
};

module.exports = {
  TIME_CONFIG,
  SUBSCRIPTION_TYPES,
  calculateEndTime,
  calculateExpirationDate,
  validateSubscriptionTiming,
  determineStatus,
  updateSubscriberStatus,
  processSubscription
};