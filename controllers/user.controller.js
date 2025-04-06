const User = require('../models/user.model');
const asyncHandler = require('../middleware/async.middleware');
const { updateSubscriberStatus } = require('../utils/subscriber.utils');

exports.createSubscriber = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      referral,
      subscriptionType,
      dateOfSubscription,
      subscriberType
    } = req.body;

    const imagePath = req.file ? req.file.path : null;
    
    // Calculate expiration date based on subscription type and date
    const subscriptionDate = new Date(dateOfSubscription);
    let expiresOn = new Date(subscriptionDate);
    
    // Add time based on subscription type
    if (subscriptionType.includes('Monthly')) {
      expiresOn.setMonth(expiresOn.getMonth() + 1);
    } else if (subscriptionType.includes('Bi-weekly')) {
      expiresOn.setDate(expiresOn.getDate() + 14);
    } else if (subscriptionType.includes('Weekly')) {
      expiresOn.setDate(expiresOn.getDate() + 7);
    } else if (subscriptionType === 'Full day') {
      expiresOn.setDate(expiresOn.getDate() + 1);
    } else if (subscriptionType.includes('Half-day')) {
      // Half day expires same day
      expiresOn.setHours(23, 59, 59);
    }

    const subscriber = await User.create({
      username: `sub_${Date.now()}`,
      role: 'subscriber',
      subscriberDetails: {
        fullName,
        phoneNumber,
        referral,
        subscriptionType,
        dateOfSubscription,
        subscriberType,
        image: imagePath,
        expiresOn: expiresOn,
        status: 'active' // Initial status
      }
    });

    // Update status based on expiration date
    subscriber.subscriberDetails.status = updateSubscriberStatus(subscriber);
    await subscriber.save();

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
    const subscribers = await User.find({ role: 'subscriber' });
    
    // Update status for each subscriber
    for (const subscriber of subscribers) {
      const newStatus = updateSubscriberStatus(subscriber);
      if (subscriber.subscriberDetails.status !== newStatus) {
        subscriber.subscriberDetails.status = newStatus;
        await subscriber.save();
      }
    }
    
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Also update other subscriber-related functions
exports.updateSubscriber = async (req, res) => {
  try {
    const { 
      fullName, 
      phoneNumber, 
      referral, 
      subscriptionType, 
      dateOfSubscription, 
      subscriberType,
      status 
    } = req.body;

    const subscriber = await User.findOne({ _id: req.params.id, role: 'subscriber' });

    if (!subscriber) return res.status(404).json({ message: 'Subscriber not found' });

    // Update fields if provided
    if (fullName) subscriber.subscriberDetails.fullName = fullName;
    if (phoneNumber) subscriber.subscriberDetails.phoneNumber = phoneNumber;
    if (referral) subscriber.subscriberDetails.referral = referral;
    if (status) subscriber.subscriberDetails.status = status;
    if (subscriberType) subscriber.subscriberDetails.subscriberType = subscriberType;
    
    // Recalculate expiration date if subscription type or date changes
    if (subscriptionType || dateOfSubscription) {
      const newSubscriptionDate = dateOfSubscription 
        ? new Date(dateOfSubscription) 
        : new Date(subscriber.subscriberDetails.dateOfSubscription);
      
      const newSubscriptionType = subscriptionType || subscriber.subscriberDetails.subscriptionType;
      
      let expiresOn = new Date(newSubscriptionDate);
      
      // Add time based on subscription type
      if (newSubscriptionType.includes('Monthly')) {
        expiresOn.setMonth(expiresOn.getMonth() + 1);
      } else if (newSubscriptionType.includes('Bi-weekly')) {
        expiresOn.setDate(expiresOn.getDate() + 14);
      } else if (newSubscriptionType.includes('Weekly')) {
        expiresOn.setDate(expiresOn.getDate() + 7);
      } else if (newSubscriptionType === 'Full day') {
        expiresOn.setDate(expiresOn.getDate() + 1);
      } else if (newSubscriptionType.includes('Half-day')) {
        // Half day expires same day
        expiresOn.setHours(23, 59, 59);
      }
      
      if (subscriptionType) subscriber.subscriberDetails.subscriptionType = subscriptionType;
      if (dateOfSubscription) subscriber.subscriberDetails.dateOfSubscription = dateOfSubscription;
      subscriber.subscriberDetails.expiresOn = expiresOn;
    }

    await subscriber.save();

    res.status(200).json({
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
  const subscribers = await User.find({ role: 'subscriber' });
  res.json(subscribers);
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
  const { name, status, expiresOn } = req.body;

  const subscriber = await User.findOne({ _id: req.params.id, role: 'subscriber' });

  if (!subscriber) return res.status(404).json({ message: 'Subscriber not found' });

  subscriber.subscriberDetails.name = name || subscriber.subscriberDetails.name;
  subscriber.subscriberDetails.status = status || subscriber.subscriberDetails.status;
  subscriber.subscriberDetails.expiresOn = expiresOn || subscriber.subscriberDetails.expiresOn;

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

  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

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