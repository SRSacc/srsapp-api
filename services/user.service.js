const User = require('../models/user.model');

class UserService {
  async createSubscriber(userData, imagePath) {
    return await User.create({
      username: `sub_${Date.now()}`,
      role: 'subscriber',
      subscriberDetails: {
        name: userData.name,
        status: userData.status,
        expiresOn: userData.expiresOn,
        image: imagePath
      }
    });
  }

  async findSubscribers() {
    return await User.find({ role: 'subscriber' });
  }
}

module.exports = new UserService();