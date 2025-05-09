// routes/user.routes.js
const express = require('express');
const router = express.Router();
const {
  createSubscriber,
  getSubscribers,
  updateSubscriber,
  deleteSubscriber,
  getSubscriberStatus,
  updateSubscriberImage,
  createReceptionist,
  getReceptionists,
  changePassword,
  getUserDetails
} = require('../controllers/user.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/authorize.middleware');
const upload = require('../middleware/upload.middleware');

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

// Subscribers
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
 *               - fullName
 *               - phoneNumber
 *               - subscriptionType
 *               - subscriberType
 *               - dateOfSubscription
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "John Doe"
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               referral:
 *                 type: string
 *                 example: "REF123"
 *               subscriptionType:
 *                 type: string
 *                 enum: [
 *                   'Half-day (morning)',
 *                   'Half-day (night)',
 *                   'Full day',
 *                   'Weekly (day-only)',
 *                   'Weekly (full-access)',
 *                   'Bi-weekly (day-only)',
 *                   'Bi-weekly (full-access)',
 *                   'Monthly (day-only)',
 *                   'Monthly (full-access)'
 *                 ]
 *               subscriberType:
 *                 type: string
 *                 enum: ['Regular Subscriber', 'SRS Worker']
 *               dateOfSubscription:
 *                 type: string
 *                 format: date
 *                 example: "2024-03-20"
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Subscriber created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Subscriber'
 *       401:
 *         description: Unauthorized
 */
router.post('/subscribers', protect, authorizeRoles('receptionist', 'manager'), upload.single('image'), createSubscriber);

/**
 * @swagger
 * /users/subscribers:
 *   get:
 *     summary: Get all subscribers with pagination
 *     tags: [Subscribers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of subscribers with pagination metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscribers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Subscriber'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/subscribers', protect, authorizeRoles('receptionist', 'manager'), getSubscribers);

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
 *               fullName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               referral:
 *                 type: string
 *               subscriptionType:
 *                 type: string
 *                 enum: [
 *                   'Half-day (morning)',
 *                   'Half-day (night)',
 *                   'Full day',
 *                   'Weekly (day-only)',
 *                   'Weekly (full-access)',
 *                   'Bi-weekly (day-only)',
 *                   'Bi-weekly (full-access)',
 *                   'Monthly (day-only)',
 *                   'Monthly (full-access)'
 *                 ]
 *               subscriberType:
 *                 type: string
 *                 enum: ['Regular Subscriber', 'SRS Worker']
 *               dateOfSubscription:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Subscriber updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Subscriber'
 */
router.put('/subscribers/:id', protect, authorizeRoles('receptionist', 'manager'), updateSubscriber);

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
router.delete('/subscribers/:id', protect, authorizeRoles('receptionist', 'manager'), deleteSubscriber);

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
router.put('/subscribers/:id/image', protect, authorizeRoles('receptionist', 'manager'), upload.single('image'), updateSubscriberImage);

/**
 * @swagger
 * /users/subscribers/{id}/status:
 *   get:
 *     summary: Get subscriber status
 *     tags: [Subscribers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscriber status information
 *       404:
 *         description: Subscriber not found
 */
router.get('/subscribers/:id/status', protect, authorizeRoles('receptionist', 'manager'), getSubscriberStatus);

// Receptionists (Manager-only)
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
router.post('/receptionists', protect, authorizeRoles('manager'), createReceptionist);

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
router.get('/receptionists', protect, authorizeRoles('manager'), getReceptionists);

// Password Change
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
router.post('/change-password', protect, changePassword);

// User Details
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get authenticated user details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: ['manager', 'receptionist', 'subscriber']
 *                     subscriberDetails:
 *                       $ref: '#/components/schemas/Subscriber'
 *       401:
 *         description: Not authorized
 */
router.get('/me', protect, getUserDetails);

/**
 * @swagger
 * components:
 *   schemas:
 *     Subscriber:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         username:
 *           type: string
 *         role:
 *           type: string
 *           enum: ['subscriber']
 *         subscriberDetails:
 *           type: object
 *           properties:
 *             fullName:
 *               type: string
 *             phoneNumber:
 *               type: string
 *             referral:
 *               type: string
 *             subscriptionType:
 *               type: string
 *               enum: [
 *                 'Half-day (morning)',
 *                 'Half-day (night)',
 *                 'Full day',
 *                 'Weekly (day-only)',
 *                 'Weekly (full-access)',
 *                 'Bi-weekly (day-only)',
 *                 'Bi-weekly (full-access)',
 *                 'Monthly (day-only)',
 *                 'Monthly (full-access)'
 *               ]
 *             subscriberType:
 *               type: string
 *               enum: ['Regular Subscriber', 'SRS Worker']
 *             dateOfSubscription:
 *               type: string
 *               format: date
 *             image:
 *               type: string
 *             status:
 *               type: string
 *               enum: ['active', 'expiring', 'expired']
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

module.exports = router;
