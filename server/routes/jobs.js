//  Import necessary modules
import express from 'express';
import Job from '../models/Job.js'; // Mongoose model for Job
import ImportLog from '../models/ImportLog.js'; // Mongoose model for storing import logs
import { fetchAndConvert } from '../services/fetchAndConvert.js'; // Service to fetch and parse XML feeds

const router = express.Router(); // Create Express router

//  XML Feed Sources with name (used for logging)
const urls = [
  { url: 'https://jobicy.com/?feed=job_feed', name: 'Jobicy - All' },
  { url: 'https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time', name: 'Jobicy - SMM Full-Time' },
  { url: 'https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france', name: 'Jobicy - Seller France' },
  { url: 'https://jobicy.com/?feed=job_feed&job_categories=design-multimedia', name: 'Jobicy - Design & Multimedia' },
  { url: 'https://jobicy.com/?feed=job_feed&job_categories=data-science', name: 'Jobicy - Data Science' },
  { url: 'https://jobicy.com/?feed=job_feed&job_categories=copywriting', name: 'Jobicy - Copywriting' },
  { url: 'https://jobicy.com/?feed=job_feed&job_categories=business', name: 'Jobicy - Business' },
  { url: 'https://jobicy.com/?feed=job_feed&job_categories=management', name: 'Jobicy - Management' },
  { url: 'https://www.higheredjobs.com/rss/articleFeed.cfm', name: 'HigherEdJobs' }
];

/**
 * @route   GET /api/jobs/import
 * @desc    Fetch jobs from multiple XML feeds, parse them, store to DB, and log import history
 * @access  Public (can be secured with auth if needed)
 */
router.get('/import', async (req, res) => {
  try {
    for (const feed of urls) {
      //  Fetch and convert XML to job objects
      const jobs = await fetchAndConvert(feed.url, feed.name);

      let total = jobs.length;
      let newCount = 0;
      let updateCount = 0;
      let failed = 0;
      let failures = [];

      //  Iterate over jobs and upsert (insert/update)
      for (const jobItem of jobs) {
        try {
          const jobId = jobItem.jobId || jobItem.url;
          const existing = await Job.findOne({ jobId });

          if (existing) {
            await Job.updateOne({ jobId }, jobItem); // 🔁 Update existing job
            updateCount++;
          } else {
            await Job.create({ jobId, ...jobItem }); // ➕ Insert new job
            newCount++;
          }
        } catch (err) {
          failed++;
          failures.push({ jobId: jobItem.jobId || jobItem.url, reason: err.message });
        }
      }

      //  Save import summary to logs collection
      await ImportLog.create({
        fileName: feed.name,
        totalFetched: total,
        totalImported: newCount + updateCount,
        newJobs: newCount,
        updatedJobs: updateCount,
        failedJobs: failures,
        timestamp: new Date()
      });
    }

    //  Final success response
    res.status(200).json({ message: '✅ Jobs imported successfully' });
  } catch (error) {
    // ❌ Error handler
    console.error('❌ Error while importing jobs:', error.message);
    res.status(500).json({
      message: 'Error importing jobs',
      error: error.message
    });
  }
});

export default router; //  Export the route
