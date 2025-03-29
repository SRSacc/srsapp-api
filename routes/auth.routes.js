const express = require('express');
const router = express.Router();
const { loginReceptionist } = require('../controllers/auth.controller');

router.post('/receptionist/login', loginReceptionist);
module.exports = router;
