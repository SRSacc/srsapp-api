// models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: function () {
      return this.role !== 'subscriber'; // Subscriber can be created without login
    }
  },

  role: {
    type: String,
    enum: ['manager', 'receptionist', 'subscriber'],
    required: true
  },

  subscriberDetails: {
    name: String,
    image: String,
    status: {
      type: String,
      enum: ['active', 'expiring', 'expired']
    },
    expiresOn: Date
  }

}, { timestamps: true });

// Password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
