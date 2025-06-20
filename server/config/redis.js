import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

//  Create Redis client with Redis Cloud URL from .env
export const redisClient = createClient({
  url: process.env.REDIS_URL 
});

//  Event: Connected to Redis
redisClient.on('connect', () => {
  console.log('✅ Redis connected!');
});

// ❌ Event: Redis connection error
redisClient.on('error', err => {
  console.error('❌ Redis Error:', err.message);
});

//  Connect to Redis
export const connectRedis = async () => {
  try {
    await redisClient.connect(); // Await successful connection
  } catch (err) {
    console.error('❌ Redis connect failed:', err.message); // Handle error
  }
};
