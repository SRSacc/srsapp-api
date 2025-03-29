// app.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger'); // ✅ Correct path


const authRoutes = require('./routes/auth.routes');        // ✅ correct file
const userRoutes = require('./routes/user.routes');        // ✅ clean, not reused

const app = express();
app.use(express.json());

connectDB();

app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);      
app.use('/api/users', userRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
