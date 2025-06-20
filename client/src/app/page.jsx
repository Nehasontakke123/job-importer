'use client'; // ✅ This component uses Next.js client-side rendering

import { useEffect, useState } from 'react';
import ImportLogTable from '../components/ImportLogTable';
import './page.module.css';

export default function Home() {
  // ✅ State to hold logs data from backend & loading indicator
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch logs from backend API when component mounts
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // 🔁 Call the backend API hosted on Render
        const res = await fetch('https://server-1-prnc.onrender.com/api/logs');

        // ❌ If response is not OK, throw error
        if (!res.ok) throw new Error(`Server Error: ${res.status}`);

        // ❌ Check if response is valid JSON
        const contentType = res.headers.get('content-type');
        if (!contentType.includes('application/json')) throw new Error('Invalid JSON');

        // ✅ Parse and store logs in state
        const data = await res.json();
        setLogs(data);
      } catch (error) {
        console.error('Fetch error:', error.message);
      } finally {
        setLoading(false); // ✅ Stop showing loader after fetch
      }
    };

    fetchLogs(); // ⬅️ Initial fetch trigger
  }, []);

  return (
    <main className="fullscreen-wrapper">
      <div className="center-box">
        {/* ✅ Page Heading */}
        <h1 className="title">Job Import History</h1>

        {/* ✅ Conditional rendering: Loader or Table */}
        {loading ? (
          <p className="loading">Loading...</p>
        ) : (
          <ImportLogTable logs={logs} />
        )}
      </div>
    </main>
  );
}
