// utils/subscription.util.js
const moment = require('moment');

/**
 * Calculate expiration date based on subscription type and start date
 * @param {string} subscriptionType - Type of subscription
 * @param {Date} dateOfSubscription - Start date of subscription
 * @returns {Date} Expiration date
 */
const calculateExpiryDate = (subscriptionType, dateOfSubscription) => {
  const startDate = moment(dateOfSubscription);
  
  switch (subscriptionType) {
    case 'Half-day (morning)':
    case 'Half-day (night)':
    case 'Full day':
      return startDate.endOf('day').toDate();
    
    case 'Weekly (day-only)':
    case 'Weekly (full-access)':
      return startDate.add(7, 'days').endOf('day').toDate();
    
    case 'Bi-weekly (day-only)':
    case 'Bi-weekly (full-access)':
      return startDate.add(14, 'days').endOf('day').toDate();
    
    case 'Monthly (day-only)':
    case 'Monthly (full-access)':
      return startDate.add(1, 'month').endOf('day').toDate();
    
    default:
      return startDate.endOf('day').toDate();
  }
};

/**
 * Determine subscription status based on expiry date
 * @param {Date} expiryDate - Subscription expiry date
 * @returns {string} Status (active, expiring, expired)
 */
const determineStatus = (expiryDate) => {
  const now = moment();
  const expiry = moment(expiryDate);
  const daysRemaining = expiry.diff(now, 'days');
  
  if (daysRemaining < 0) {
    return 'expired';
  } else if (daysRemaining <= 3) {
    return 'expiring';
  } else {
    return 'active';
  }
};

/**
 * Update subscriber status based on current date and expiry date
 * @param {Object} subscriber - Subscriber document
 * @returns {string} Updated status
 */
const updateSubscriberStatus = (subscriber) => {
  if (!subscriber.subscriberDetails.expiresOn) {
    return subscriber.subscriberDetails.status;
  }
  
  const newStatus = determineStatus(subscriber.subscriberDetails.expiresOn);
  subscriber.subscriberDetails.status = newStatus;
  return newStatus;
};

module.exports = {
  calculateExpiryDate,
  determineStatus,
  updateSubscriberStatus
};