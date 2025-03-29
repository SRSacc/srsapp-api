// routes/user.routes.js
const express = require('express');
const router = express.Router();
const { createSubscriber, getSubscribers } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/authorize.middleware');
const upload = require('../middleware/upload.middleware');

router.post(
  '/subscribers',
  protect,
  authorizeRoles('receptionist', 'manager'),
  upload.single('image'), // Accept a single file with field name "image"
  createSubscriber
);

router.get('/subscribers', protect, authorizeRoles('receptionist', 'manager'), getSubscribers);

module.exports = router;

module.exports = router;
