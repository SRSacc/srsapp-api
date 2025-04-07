// utils/updateAllStatuses.js
const User = require('../models/user.model');
const { updateSubscriberStatus } = require('./subscription.util');
const logger = require('../config/logger');

/**
 * Update status for all subscribers based on their expiry dates
 * This could be run as a scheduled job (e.g., daily)
 */
const updateAllSubscriberStatuses = async () => {
  try {
    const subscribers = await User.find({ role: 'subscriber' });
    let updated = 0;
    
    for (const subscriber of subscribers) {
      const oldStatus = subscriber.subscriberDetails.status;
      const newStatus = updateSubscriberStatus(subscriber);
      
      if (oldStatus !== newStatus) {
        await subscriber.save();
        updated++;
      }
    }
    
    logger.info(`Updated status for ${updated} subscribers`);
    return updated;
  } catch (error) {
    logger.error('Error updating subscriber statuses:', error);
    throw error;
  }
};

module.exports = updateAllSubscriberStatuses;