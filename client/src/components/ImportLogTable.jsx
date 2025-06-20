'use client'; //  Ensures this component runs on client side (Next.js)

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client'; // ✅ Import Socket.IO client
import './ImportLogTable.css';

// Initialize and connect to Socket.IO server
const socket = io('https://server-1-prnc.onrender.com/'); // 🌐 Replace with live backend URL if deployed

export default function ImportLogTable({ logs: initialLogs }) {
  // Component state
  const [logs, setLogs] = useState(initialLogs);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentFailures, setCurrentFailures] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  // Calculate pagination details
  const totalPages = Math.max(1, Math.ceil(logs.length / logsPerPage));
  const startIdx = (currentPage - 1) * logsPerPage;
  const currentLogs = logs.slice(startIdx, startIdx + logsPerPage);

  // Open modal on clicking failed job count
  const handleFailedClick = (failures) => {
    if (failures?.length) {
      setCurrentFailures(failures);
      setModalOpen(true);
    }
  };

  // Close failure modal
  const closeModal = () => {
    setModalOpen(false);
    setCurrentFailures([]);
  };

  //Format timestamp to readable date-time
  const formatDate = (timestamp) => {
    const options = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return new Intl.DateTimeFormat('en-IN', options).format(new Date(timestamp));
  };

  //Socket.IO: Listen for new logs and update UI in real-time
  useEffect(() => {
    socket.on('new-log', (newLog) => {
      setLogs((prevLogs) => [newLog, ...prevLogs]); // Prepend latest log
      setCurrentPage(1); // Reset to first page on update
    });

    return () => {
      socket.off('new-log'); // Cleanup listener on unmount
    };
  }, []);

  return (
    <div className="table-container">
      {/*Dashboard Subheading */}
      <h2 style={{ textAlign: 'left', marginBottom: '10px' }}>
        📄 Last {logs.length} Imports
      </h2>

      {/*Logs Table */}
      <table className="log-table">
        <thead>
          <tr>
            <th>Feed</th>
            <th>Timestamp</th>
            <th>Total</th>
            <th>New</th>
            <th>Updated</th>
            <th>Failed</th>
          </tr>
        </thead>
        <tbody>
          {currentLogs.map((log, idx) => (
            <tr key={idx}>
              <td>{log.fileName || '-'}</td>
              <td>{formatDate(log.timestamp)}</td>
              <td>{log.totalFetched}</td>
              <td>{log.newJobs}</td>
              <td>{log.updatedJobs}</td>
              <td
                className="failed clickable"
                onClick={() => handleFailedClick(log.failedJobs)}
                title="Click to view failure reasons"
              >
                {log.failedJobs?.length || 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/*Pagination Controls */}
      <div className="pagination-controls">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          ⬅️ Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next ➡️
        </button>
      </div>

      {/*Modal for Viewing Failure Reasons */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>❌ Failed Job Reasons</h3>
            <ul>
              {currentFailures.map((fail, index) => (
                <li key={index}>
                  #{index + 1}: {fail?.reason || '❌ Reason not provided'}
                </li>
              ))}
            </ul>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}



