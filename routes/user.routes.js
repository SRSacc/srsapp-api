// routes/user.routes.js
const express = require('express');
const router = express.Router();
const {
  createSubscriber,
  getSubscribers,
  updateSubscriber,
  deleteSubscriber,
  updateSubscriberImage,
  createReceptionist,
  getReceptionists,
  changePassword
} = require('../controllers/user.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/authorize.middleware');
const upload = require('../middleware/upload.middleware');

// Subscribers
router.post('/subscribers', protect, authorizeRoles('receptionist', 'manager'), upload.single('image'), createSubscriber);
router.get('/subscribers', protect, authorizeRoles('receptionist', 'manager'), getSubscribers);
router.put('/subscribers/:id', protect, authorizeRoles('receptionist', 'manager'), updateSubscriber);
router.delete('/subscribers/:id', protect, authorizeRoles('receptionist', 'manager'), deleteSubscriber);
router.put('/subscribers/:id/image', protect, authorizeRoles('receptionist', 'manager'), upload.single('image'), updateSubscriberImage);

// Receptionists (Manager-only)
router.post('/receptionists', protect, authorizeRoles('manager'), createReceptionist);
router.get('/receptionists', protect, authorizeRoles('manager'), getReceptionists);

// Password Change
router.post('/change-password', protect, changePassword);

module.exports = router;
/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication
 *   - name: Subscribers
 *     description: Subscriber Management
 *   - name: Receptionists
 *     description: Receptionist Management
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login as any user (manager, receptionist, subscriber)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: manager1
 *               password:
 *                 type: string
 *                 example: superSecure123
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /users/subscribers:
 *   post:
 *     summary: Create a new subscriber
 *     tags: [Subscribers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - status
 *               - expiresOn
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, expiring, expired]
 *               expiresOn:
 *                 type: string
 *                 format: date
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Subscriber created successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users/subscribers:
 *   get:
 *     summary: Get all subscribers
 *     tags: [Subscribers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of subscribers
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users/subscribers/{id}:
 *   put:
 *     summary: Update subscriber information
 *     tags: [Subscribers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscriber ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *               expiresOn:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Subscriber updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subscriber not found
 */

/**
 * @swagger
 * /users/subscribers/{id}/image:
 *   put:
 *     summary: Update subscriber image
 *     tags: [Subscribers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscriber ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subscriber not found
 */

/**
 * @swagger
 * /users/subscribers/{id}:
 *   delete:
 *     summary: Delete a subscriber
 *     tags: [Subscribers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscriber ID
 *     responses:
 *       200:
 *         description: Subscriber deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subscriber not found
 */

/**
 * @swagger
 * /users/receptionists:
 *   post:
 *     summary: Create a new receptionist (Manager only)
 *     tags: [Receptionists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Receptionist created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /users/receptionists:
 *   get:
 *     summary: Get all receptionists (Manager only)
 *     tags: [Receptionists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of receptionists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /users/change-password:
 *   post:
 *     summary: Change password (Authenticated users only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password
 *       401:
 *         description: Unauthorized
 */
