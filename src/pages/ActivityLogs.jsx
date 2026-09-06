import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ActivityLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteLogId, setDeleteLogId] = useState(null);

  
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;

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
    
    
    const totalPagesAfterDelete = Math.ceil(updatedLogs.length / logsPerPage);
    if (currentPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) {
      setCurrentPage(totalPagesAfterDelete);
    }

    toast.success("Log deleted successfully!");
  };

  const handleClearLogs = () => {
    localStorage.removeItem("admin_activity_logs");
    setLogs([]);
    setCurrentPage(1);
    toast.success("All logs cleared successfully!");
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

 
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage) || 1;

  return (
    <div className="min-h-screen w-full bg-[#1a0b2e] px-4 py-8 relative overflow-hidden text-white">
    
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/35 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

     
      <div className="w-[92%] max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center bg-[#28133f] p-6 rounded-3xl shadow-xl mb-6 border border-purple-900/50 z-10 relative">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-extrabold text-white">System Activity Logs</h1>
          <p className="text-sm text-purple-200/70">
            Track critical security events and administrative actions in real time.
          </p>
        </div>
        <div className="space-x-3 flex items-center">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="px-4 py-2.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl font-bold text-sm hover:bg-purple-500/30 transition duration-200 shadow-md"
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl font-bold text-sm hover:bg-red-500/30 transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      
      <div className="w-[92%] max-w-7xl mx-auto bg-[#28133f] p-6 rounded-3xl shadow-xl border border-purple-900/50 relative z-10 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Activity Records</h2>
            <p className="text-xs text-purple-200/70">Showing log entries history</p>
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
                <th className="pb-3 px-2 text-right pr-5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/30 text-sm text-white">
              {currentLogs.length > 0 ? (
                currentLogs.map((log) => (
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

       
        {logs.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-purple-900/40 text-xs text-purple-200/70 gap-4">
            <div>
              Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, logs.length)} of {logs.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-xl font-bold border transition ${
                  currentPage === 1
                    ? "bg-purple-900/10 text-purple-400/40 border-purple-900/20 cursor-not-allowed"
                    : "bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30"
                }`}
              >
                Previous
              </button>
              
              <span className="px-3 py-1 bg-purple-900/40 rounded-xl font-bold text-white border border-purple-900/60">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-xl font-bold border transition ${
                  currentPage === totalPages
                    ? "bg-purple-900/10 text-purple-400/40 border-purple-900/20 cursor-not-allowed"
                    : "bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
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