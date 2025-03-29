const User = require('../models/user.model');

exports.createSubscriber = async (req, res) => {
  const { name, status, expiresOn } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  const subscriber = await User.create({
    username: `sub_${Date.now()}`,
    role: 'subscriber',
    subscriberDetails: {
      name,
      status,
      expiresOn,
      image: imagePath
    }
  });

  res.status(201).json(subscriber);
};

exports.getSubscribers = async (req, res) => {
  const subscribers = await User.find({ role: 'subscriber' });
  res.json(subscribers);
};