import mongoose from 'mongoose';

//  Define schema for individual Job entries
const jobSchema = new mongoose.Schema({
  jobId: { type: String, unique: true },   // Unique identifier (guid or URL)
  title: String,                           // Job title
  company: String,                         // Company name
  location: String,                        // Job location
  description: String,                     // Full job description (HTML or text)
  url: String,                             // Original job posting URL
  category: String                         // Optional category or tag (e.g., 'Design')
}, {
  timestamps: true                         // ✅ Adds createdAt and updatedAt fields
});

// ✅ Export Mongoose model
export default mongoose.model('Job', jobSchema);
