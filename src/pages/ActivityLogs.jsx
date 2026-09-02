import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { toast } from "react-toastify";

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteLogId, setDeleteLogId] = useState(null);

  const loadLogs = () => {
    const savedLogs = JSON.parse(localStorage.getItem("admin_activity_logs")) || [];
    setLogs(savedLogs);
  };

  useEffect(() => {
    loadLogs();
    window.addEventListener("activityLogsUpdated", loadLogs);
    return () => {
      window.removeEventListener("activityLogsUpdated", loadLogs);
    };
  }, []);

  const handleDeleteClick = (id) => {
    setDeleteLogId(id);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    const updatedLogs = logs.filter((log) => log.id !== deleteLogId);
    localStorage.setItem("admin_activity_logs", JSON.stringify(updatedLogs));
    setLogs(updatedLogs);
    setShowConfirm(false);
    setDeleteLogId(null);
    
    toast.success("Log deleted successfully!");
  };

  const handleClearLogs = () => {
    localStorage.removeItem("admin_activity_logs");
    setLogs([]);
    toast.success("All logs cleared successfully!");
  };

  return (
    <div className="max-w-7xl mx-auto bg-[#28133f] p-6 rounded-3xl shadow-xl border border-purple-900/50 relative z-10 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">System Activity Logs</h2>
          <p className="text-xs text-purple-200/70">Track critical security events and administrative actions in real time.</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold">
            Total Logs: {logs.length}
          </span>
          <button 
            onClick={handleClearLogs}
            className="px-3 py-1.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-500/30 transition duration-200"
          >
            Clear Logs
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-purple-900/50 text-xs font-bold text-purple-300 uppercase tracking-wider">
              <th className="pb-3 px-2">Timestamp</th>
              <th className="pb-3 px-2">User</th>
              <th className="pb-3 px-2">Action Type</th>
              <th className="pb-3 px-2">Details</th>
              <th className="pb-3 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-900/30 text-sm text-white">
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-purple-900/20 transition">
                  <td className="py-3 px-2 text-xs text-purple-200/75 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 px-2">
                    <span className="px-2.5 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold shadow-sm">
                      {log.actor}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-bold font-mono">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-purple-200">{log.details}</td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => handleDeleteClick(log.id)}
                      className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-500/30 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-6 text-center text-purple-200/70 text-sm">
                  No activity logs recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      
      {showConfirm &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-xs z-9999 px-4">
            <div className="bg-[#28133f] p-6 rounded-3xl shadow-2xl max-w-sm w-full border border-purple-900 text-center">
              <h3 className="text-lg font-extrabold text-white mb-2">
                Are you sure?
              </h3>
              <p className="text-xs text-purple-200/70 mb-6">
                Do you really want to delete this log? This action cannot be undone.
              </p>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-md"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}