import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import passport from 'passport';
import cron from 'node-cron';
import setupPassport from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import notifRoutes from './routes/notifRoutes.js';
import Post from './models/Post.js';

// Register Google strategy AFTER dotenv has loaded
setupPassport();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

app.use((req, res, next) => { req.io = io; next(); });

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5000'], credentials: true }));
app.use(express.json());
app.use(passport.initialize());

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/reports', reportRoutes);
app.use('/admin', adminRoutes);
app.use('/chat', chatRoutes);
app.use('/notifications', notifRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'NearNotify API is running smoothly.' });
});

// Auto-expire posts every hour
cron.schedule('0 * * * *', async () => {
  try {
    const result = await Post.updateMany(
      { status: 'approved', expiryDate: { $lt: new Date() } },
      { $set: { status: 'expired' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`⏰ Auto-expired ${result.modifiedCount} post(s)`);
    }
  } catch (err) {
    console.error('Cron error:', err.message);
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  // Join personal room for targeted notifications
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on('disconnect', () => console.log(`🔌 Client disconnected: ${socket.id}`));
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
