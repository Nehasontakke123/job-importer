# 🏗️ Job Importer System – Architecture Documentation

## 📌 Objective

To design and build a scalable job import system that:
- Pulls job data from multiple external XML APIs
- Converts XML to JSON
- Pushes jobs into Redis queue
- Processes jobs using workers and Bull queue
- Inserts/updates data into MongoDB
- Tracks each import run with detailed logs
- Displays import history on a frontend admin panel
- Sends real-time updates to frontend using WebSockets

---

## 🧱 System Architecture Overview

```mermaid
graph TD
  A[XML Job Feeds] --> B[Backend API (/api/jobs/import)]
  B --> C[Redis Queue (Bull)]
  C --> D[Worker (jobWorker.js)]
  D --> E[MongoDB - Jobs Collection]
  D --> F[MongoDB - Import Logs]
  F --> G[Frontend - Next.js Admin UI]
  D --> H[Socket.IO]
  H --> G
🛠️ Technologies Used
Layer	Technology
Frontend	Next.js
Backend	Node.js + Express
Database	MongoDB (Mongoose)
Queue	Bull (Redis-based)
Realtime	Socket.IO
XML Parsing	fast-xml-parser
Deployment	Render + MongoDB Atlas + Redis Cloud

⚙️ Component Overview
1. Job Import Service
Uses axios to fetch XML job feeds

Converts to JSON using fast-xml-parser

Transforms to a consistent schema

Pushes each feed into the Bull queue

2. Redis + Bull Queue
Handles large imports asynchronously

Worker (jobWorker.js) processes them

Uses exponential backoff for retries

Batch size and concurrency set via .env

3. Worker Process
Checks if job already exists (jobId)

Creates or updates record in MongoDB

Logs:

Total Fetched

New Jobs

Updated Jobs

Failed Jobs with reason

Saves import log to import_logs collection

4. Import Logs
Stored in a separate collection: import_logs

Each log has timestamp, total, new, updated, failed

Used to display logs on frontend

5. Real-Time Updates
Worker emits io.emit('new-log')

Frontend listens via socket.on('new-log')

UI updates instantly

🖥️ Frontend (Next.js)
/ page fetches logs via /api/logs

Uses useEffect and useState

Paginated table to display logs

Modal to show failure reasons

Real-time updates via Socket.IO

🔁 Flow Summary
API Endpoint: /api/jobs/import is triggered

Each feed is fetched → parsed → queued

Worker processes queue → inserts/updates MongoDB

Import summary is saved

io.emit('new-log') is sent

Frontend updates UI in real-time

🎯 Design Decisions
Area	Decision
Feed Type	XML feed parsed via fast-xml-parser
Unique Key	jobId from guid or fallback url
Queue	Bull + Redis
Logging	Separate import_logs collection
Retry Logic	Exponential backoff with retries
Realtime	Socket.IO for instant updates

🚀 Deployment Info
Backend: Render – https://server-1-prnc.onrender.com

Frontend: Next.js (local / Vercel-ready)

MongoDB: MongoDB Atlas

Redis: Redis Cloud

🧠 Scaling Potential
Worker can be containerized (Docker / Microservice)

Cron job can run /import every hour

Auth middleware can be added for API protection

Can scale horizontally using PM2 / Load Balancer

📁 Project Structure
bash
Copy
Edit
job-importer/
├── client/               # Next.js frontend
├── server/
│   ├── routes/
│   ├── models/
│   ├── services/
│   ├── workers/
│   └── queues/
├── docs/
│   └── architecture.md   # ← This file
└── README.md
✅ Prepared By
👩‍💻 Neha Sontakke

📅 Date: June 20, 2025

💼 Task: Artha - Scalable Job Importer with Queue Processing & Tracking