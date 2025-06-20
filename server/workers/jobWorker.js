//  Import required modules
import jobQueue from '../queues/jobQueue.js';
import Job from '../models/Job.js';
import ImportLog from '../models/ImportLog.js';
import dotenv from 'dotenv';
import { io } from '../index.js'; //  Import Socket.IO instance for real-time updates

//  Load environment variables
dotenv.config();

//  Configurable batch size and max concurrency from .env
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '100');         // Max jobs to process per batch
const MAX_CONCURRENCY = parseInt(process.env.MAX_CONCURRENCY || '5'); // Max parallel workers

//  Setup Bull queue processor with concurrency limit
jobQueue.process(MAX_CONCURRENCY, async (job, done) => {
  const { data, fileName } = job.data;

  //  Only take first N jobs from queue using batch size
  const limitedData = data.slice(0, BATCH_SIZE);

  //  Track counters for logging
  let total = limitedData.length;
  let newCount = 0;
  let updateCount = 0;
  let failed = 0;
  let failures = [];

  //  Retry logic with exponential backoff (resilient error handling)
  const retryWithBackoff = async (fn, maxAttempts = 3, baseDelay = 500) => {
    let attempt = 0;
    while (attempt < maxAttempts) {
      try {
        return await fn();
      } catch (err) {
        attempt++;
        if (attempt === maxAttempts) throw err; // ❌ Give up after max attempts
        const delay = baseDelay * 2 ** (attempt - 1); // ⏱ Exponential delay
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  //  Iterate over each job item and insert/update in MongoDB
  for (const jobItem of limitedData) {
    const jobId = jobItem.guid || jobItem.url; // ✅ Unique identifier fallback

    try {
      await retryWithBackoff(async () => {
        const existing = await Job.findOne({ jobId });

        if (existing) {
          await Job.updateOne({ jobId }, jobItem); // Update existing job
          updateCount++;
        } else {
          await Job.create({ jobId, ...jobItem }); // Insert new job
          newCount++;
        }
      });
    } catch (err) {
      failed++;
      failures.push({ jobId, reason: err.message }); // ✅ Capture failure reason
    }
  }

  //  Prepare log document
  const logData = {
    fileName,
    totalFetched: total,
    totalImported: newCount + updateCount,
    newJobs: newCount,
    updatedJobs: updateCount,
    failedJobs: failures,
    timestamp: new Date() // ✅ Store current timestamp
  };

  //  Save import log in MongoDB
  await ImportLog.create(logData);

  //  Emit live update to frontend via WebSocket
  io.emit('new-log', logData);

  done(); //  Mark job as completed
});
