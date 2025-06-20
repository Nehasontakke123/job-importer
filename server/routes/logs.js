//  Import required modules
import express from 'express';
import ImportLog from '../models/ImportLog.js'; // Mongoose model for import logs

const router = express.Router(); // Create an Express router instance

/**
 * @route   GET /api/logs
 * @desc    Fetch the latest 20 import logs (sorted by timestamp)
 * @access  Public (can add auth if needed)
 */
router.get('/', async (req, res) => {
  try {
    //  Fetch the most recent 20 logs, sorted by newest first
    const logs = await ImportLog.find().sort({ timestamp: -1 }).limit(20);

    //  Send the logs as a JSON response
    res.json(logs);
  } catch (error) {
    // ❌ Handle any server or database error
    console.error('❌ Error fetching logs:', error.message);
    res.status(500).json({
      message: 'Error fetching logs',
      error: error.message,
    });
  }
});

export default router; //  Export the route handler
