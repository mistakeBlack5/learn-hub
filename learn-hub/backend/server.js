import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './config/database.js';

import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Rate limit
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API running',
    time: new Date()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/progress', progressRoutes);

// Start server
const start = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();

// Shutdown
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});