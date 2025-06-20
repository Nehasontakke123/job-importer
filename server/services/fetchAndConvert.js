//  Import required modules
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

/**
 * Fetches XML data from a given URL, parses it into JSON,
 * and converts it into a clean job array format.
 *
 * @param {string} url - RSS feed URL to fetch
 * @param {string} feedName - Friendly name for logging (optional)
 * @returns {Array} - Array of job objects
 */
export const fetchAndConvert = async (url, feedName = 'Unknown Feed') => {
  try {
    //  Log which feed is being fetched
    console.log(`🌐 Fetching XML from: ${url}`);

    //  Perform HTTP GET request with 10s timeout
    const response = await axios.get(url, { timeout: 10000 });

    //  Create an XML parser instance
    const parser = new XMLParser();

    //  Parse XML response to JSON
    const json = parser.parse(response.data);

    //  Extract job items from parsed structure
    const jobs = json?.rss?.channel?.item || [];

    console.log(`✅ Fetched ${jobs.length} jobs from ${feedName}`);

    //  Transform each job entry to a consistent schema
    return jobs.map((job) => ({
      jobId: job.guid,                           // Unique ID
      title: job.title,
      company: job['job:company'] || '',         // Fallback to empty string
      location: job['job:location'] || '',
      description: job.description,
      url: job.link,
      category: job.category,
    }));
  } catch (err) {
    // ❌ Log and throw a readable error if fetch or parse fails
    console.error(`❌ Error from ${feedName}:`, err.message);
    throw new Error(`Failed to fetch or convert XML from ${feedName}: ${err.message}`);
  }
};
