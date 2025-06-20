import mongoose from 'mongoose';

//  Schema for logging each job import operation
const importLogSchema = new mongoose.Schema({
  fileName: String,                         // Feed name or identifier
  timestamp: { type: Date, default: Date.now }, // When the import occurred
  totalFetched: Number,                     // Total jobs fetched from feed
  totalImported: Number,                    // Sum of new + updated jobs
  newJobs: Number,                          // Count of newly added jobs
  updatedJobs: Number,                      // Count of existing jobs updated
  failedJobs: [                             // Array of failed entries
    {
      reason: String,                       // Why it failed (e.g., DB error)
      jobId: String                         // ID of the job that failed
    }
  ]
});

// ✅ Export Mongoose model
export default mongoose.model('ImportLog', importLogSchema);
