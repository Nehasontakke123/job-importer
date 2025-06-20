//  Import required modules
import Bull from 'bull';            // Bull: A Redis-based job/task queue for Node.js
import dotenv from 'dotenv';        // dotenv: Loads environment variables from a .env file
dotenv.config();                    // ✅ Initialize dotenv to access REDIS_URL

//  Create and configure Bull queue instance
const jobQueue = new Bull(
  'job-import-queue',              // Queue name (used in Redis as key prefix)
  process.env.REDIS_URL,           // Redis connection string (secure from .env)
  {
    redis: {
      tls: {},                     // ✅ Enables SSL for Redis Cloud (required for secure Redis)
      maxRetriesPerRequest: null   // Prevents Bull from failing after too many retries
    }
  }
);

// ✅ Export queue to use in jobWorker or importJobs
export default jobQueue;
