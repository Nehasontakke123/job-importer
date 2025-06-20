// ✅ Core & Third-Party Imports
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';        // To enable WebSocket server
import { Server } from 'socket.io';         // For real-time updates

// ✅ Local Config Imports
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';

// ✅ Routes
import jobsRoute from './routes/jobs.js';
import logsRoute from './routes/logs.js';

// ✅ Load Environment Variables
dotenv.config();

// ✅ Initialize Express App
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Create HTTP Server for WebSocket Support
const server = createServer(app);

// ✅ Setup Socket.IO on top of HTTP server
export const io = new Server(server, {
  cors: {
    origin: '*', // You can replace with actual frontend URL
    methods: ['GET', 'POST'],
  },
});

// ✅ Define API Routes
app.use('/api/jobs', jobsRoute);
app.use('/api/logs', logsRoute);

// ✅ Health Check Route
app.get('/', (req, res) => {
  res.send('✅ Job Importer API is Running');
});

// ✅ Start Server
async function startServer() {
  try {
    connectDB();            // MongoDB Connection
    await connectRedis();   // Redis Connection

    const PORT = process.env.PORT || 7000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
  }
}

// ✅ Start App
startServer();

// ✅ Load Background Worker (after socket is ready)
import './workers/jobWorker.js';
