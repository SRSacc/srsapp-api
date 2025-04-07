/**
 * Updates subscriber status based on expiration date
 * @param {Object} subscriber - The subscriber document
 * @returns {String} The updated status
 */
const updateSubscriberStatus = (subscriber) => {
  if (!subscriber.subscriberDetails || !subscriber.subscriberDetails.expiresOn) {
    return subscriber.subscriberDetails?.status || 'active';
  }

  const now = new Date();
  const expiresOn = new Date(subscriber.subscriberDetails.expiresOn);
  
  // Calculate days until expiration
  const timeDiff = expiresOn.getTime() - now.getTime();
  const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  // Update status based on days until expiration
  if (daysUntilExpiration <= 0) {
    return 'expired';
  } else if (daysUntilExpiration <= 3) {
    return 'expiring';
  } else {
    return 'active';
  }
};

module.exports = {
  updateSubscriberStatus
};