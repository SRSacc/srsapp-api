const User = require('../models/user.model');
const asyncHandler = require('../middleware/async.middleware');
const { calculateExpirationDate, determineStatus } = require('../utils/subscription.util');
const moment = require('moment');
const SubscriptionHistory = require('../models/subscription-history.model');

exports.createSubscriber = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      referral,
      paymentMode,
      subscriptionType,
      dateOfSubscription,
      subscriberType,
      expirationDate
    } = req.body;

    const imagePath = req.file ? req.file.path : null;
    
    // Calculate expiration date based on subscription type
    const subscriptionDate = dateOfSubscription ? new Date(dateOfSubscription) : new Date();
    const expiresOn = calculateExpirationDate(subscriptionDate, subscriptionType);
    
    // Determine initial status based on expiry date
    const statusObj = determineStatus(subscriptionDate, expiresOn);
    const status = statusObj.status;

    // Add startDateTime and endDateTime
    const startDateTime = subscriptionDate;
    const endDateTime = moment(subscriptionDate).endOf('day').toDate();

    const subscriber = await User.create({
      username: `sub_${Date.now()}`,
      role: 'subscriber',
      subscriberDetails: {
        name,
        phoneNumber,
        referral,
        subscriptionType,
        dateOfSubscription: subscriptionDate,
        startDateTime,
        expirationDate,
        endDateTime,
        subscriberType,
        paymentMode,
        image: imagePath,
        status,
        expiresOn
      }
    });

    res.status(201).json({
      success: true,
      data: subscriber
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getSubscribers = async (req, res) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination metadata
    const total = await User.countDocuments({ role: 'subscriber' });
    
    // Get paginated subscribers
    const subscribers = await User.find({ role: 'subscriber' })
      .skip(skip)
      .limit(limit)
      .sort({ 'subscriberDetails.name': 1 });
    
    // Return paginated response
    res.json({
      subscribers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscribers', error: error.message });
  }
};

exports.createReceptionist = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const receptionist = await User.create({
      username,
      password,
      role: 'receptionist'
    });

    res.status(201).json({
      message: 'Receptionist created successfully',
      data: {
        id: receptionist._id,
        username: receptionist.username,
        role: receptionist.role
      }
    });
  } catch (error) {
    console.error('Error creating receptionist:', error);
    res.status(500).json({ message: 'Server error while creating receptionist' });
  }
};

exports.getReceptionists = async (req, res) => {
  const receptionists = await User.find({ role: 'receptionist' }).select('-password');
  res.json(receptionists);
};

exports.updateSubscriber = async (req, res) => {
  const { name, status, subscriptionType, dateOfSubscription } = req.body;

  const subscriber = await User.findOne({ _id: req.params.id, role: 'subscriber' });

  if (!subscriber) return res.status(404).json({ message: 'Subscriber not found' });

  // Update subscriber details
  if (name) subscriber.subscriberDetails.name = name;
  
  // Update image if provided in the request
  if (req.file) {
    subscriber.subscriberDetails.image = req.file.path;
  }
  
  // If subscription type or date changes, recalculate expiry date
  if (subscriptionType || dateOfSubscription) {
      const newSubscriptionType = subscriptionType || subscriber.subscriberDetails.subscriptionType;
      const newSubscriptionDate = dateOfSubscription ? new Date(dateOfSubscription) : 
                                 subscriber.subscriberDetails.dateOfSubscription;
      
      subscriber.subscriberDetails.subscriptionType = newSubscriptionType;
      subscriber.subscriberDetails.dateOfSubscription = newSubscriptionDate;
      subscriber.subscriberDetails.startDateTime = newSubscriptionDate; // Add this line
      
      // Calculate new expiry date
      const newExpiresOn = calculateExpirationDate(newSubscriptionDate, newSubscriptionType);
      subscriber.subscriberDetails.expiresOn = newExpiresOn;
      subscriber.subscriberDetails.expirationDate = newExpiresOn; // Add this line
      
      // Determine new status based on new dates
      const statusObj = determineStatus(newSubscriptionDate, newExpiresOn);
      subscriber.subscriberDetails.status = statusObj.status;
  } else if (status) {
    // Only update status if explicitly provided
    subscriber.subscriberDetails.status = status;
  }

  await subscriber.save();

  res.json({ message: 'Subscriber updated', subscriber });
};

exports.deleteSubscriber = async (req, res) => {
  const subscriber = await User.findOneAndDelete({ _id: req.params.id, role: 'subscriber' });
  if (!subscriber) return res.status(404).json({ message: 'Subscriber not found' });

  res.json({ message: 'Subscriber deleted successfully' });
};

exports.updateSubscriberImage = async (req, res) => {
  const subscriber = await User.findOne({ _id: req.params.id, role: 'subscriber' });

  if (!subscriber) return res.status(404).json({ message: 'Subscriber not found' });

  // When using Cloudinary, req.file.path should already contain the full URL
  const imagePath = req.file ? req.file.path : null;

  if (imagePath) subscriber.subscriberDetails.image = imagePath;
  await subscriber.save();

  res.json({ message: 'Image updated', image: subscriber.subscriberDetails.image });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: 'Password changed successfully' });
};

exports.getUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  
  res.status(200).json({
    success: true,
    data: user
  });
});

exports.getSubscriberStatus = async (req, res) => {
  try {
    const subscriber = await User.findOne({ _id: req.params.id, role: 'subscriber' });
    
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    // Get current status and expiry date
    const status = subscriber.subscriberDetails.status;
    const expiresOn = subscriber.subscriberDetails.expiresOn;

    res.json({
      success: true,
      data: {
        status,
        expiresOn,
        name: subscriber.subscriberDetails.name,
        subscriptionType: subscriber.subscriberDetails.subscriptionType
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/**
 * @desc    Resubscribe an expired user
 * @route   POST /api/subscribers/:id/resubscribe
 * @access  Private (Manager, Receptionist)
 * @param   {string} req.params.id - User ID
 * @param   {Object} req.body
 * @param   {string} req.body.subscriptionType - New subscription type
 * @param   {Date} [req.body.dateOfSubscription] - Start date of new subscription (defaults to current date)
 * @returns {Object} Updated user object
 * 
 * @example
 * // Request body
 * {
 *   "subscriptionType": "Monthly (full-access)",
 *   "dateOfSubscription": "2024-03-20" // optional
 * }
 * 
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     // Updated user object
 *   }
 * }
 */
exports.resubscribe = async (req, res) => {
  try {
    const { id } = req.params;
    const { subscriptionType, dateOfSubscription } = req.body;

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Save current subscription to history
    await SubscriptionHistory.create({
      userId: user._id,
      subscriptionType: user.subscriberDetails.subscriptionType,
      subscriberType: user.subscriberDetails.subscriberType,
      paymentMode: user.subscriberDetails.paymentMode,
      dateOfSubscription: user.subscriberDetails.dateOfSubscription,
      startDateTime: user.subscriberDetails.startDateTime,
      endDateTime: user.subscriberDetails.endDateTime,
      expirationDate: user.subscriberDetails.expirationDate,
      status: user.subscriberDetails.status
    });

    // Calculate new subscription dates
    const subscriptionDate = dateOfSubscription ? new Date(dateOfSubscription) : new Date();
    const expiresOn = calculateExpirationDate(subscriptionDate, subscriptionType);
    const statusObj = determineStatus(subscriptionDate, expiresOn);
    const startDateTime = subscriptionDate;
    const endDateTime = moment(subscriptionDate).endOf('day').toDate();

    // Update user's subscription details
    user.subscriberDetails.subscriptionType = subscriptionType;
    user.subscriberDetails.dateOfSubscription = subscriptionDate;
    user.subscriberDetails.startDateTime = startDateTime;
    user.subscriberDetails.endDateTime = endDateTime;
    user.subscriberDetails.expirationDate = expiresOn;
    user.subscriberDetails.status = statusObj.status;

    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};