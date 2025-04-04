const User = require('../models/user.model');
const asyncHandler = require('../middleware/async.middleware');

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
        status: 'active'
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