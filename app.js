// app.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const authRoutes = require('./routes/user.routes');
const subscriberRoutes = require('./routes/user.routes');

const app = express();
app.use(express.json());

connectDB(); // Connect to MongoDB

app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/subscribers', subscriberRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
