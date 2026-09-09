import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL = "https://6a90168dff2484963a5db61a.mockapi.io/activity-logs";

export default function ActivityLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteLogId, setDeleteLogId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;

  const loadLogs = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch activity logs");
      const data = await response.json();
      
      setLogs(data.reverse());
    } catch (error) {
      console.error("Error loading logs:", error);
      toast.error("Could not load activity logs from server.");
    }
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

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/${deleteLogId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete log on server");

      const updatedLogs = logs.filter((log) => log.id !== deleteLogId);
      setLogs(updatedLogs);
      setShowConfirm(false);
      setDeleteLogId(null);

      const totalPagesAfterDelete = Math.ceil(
        updatedLogs.filter((item) => {
          if (!item.action) return false;
          const isAdmin =
            item.actor?.toLowerCase() === "admin" ||
            item.details?.toLowerCase().includes("(admin)");
          return !isAdmin;
        }).length / logsPerPage
      );
      if (currentPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) {
        setCurrentPage(totalPagesAfterDelete);
      }

      toast.success("Log deleted successfully!");
    } catch (error) {
      console.error("Error deleting log:", error);
      toast.error("Failed to delete log.");
    }
  };

  const handleClearLogs = async () => {
    try {
      const logsOnly = logs.filter((log) => {
        if (!log.action) return false;
        const isAdmin =
          log.actor?.toLowerCase() === "admin" ||
          log.details?.toLowerCase().includes("(admin)");
        return !isAdmin;
      });

      await Promise.all(
        logsOnly.map((log) =>
          fetch(`${API_URL}/${log.id}`, { method: "DELETE" })
        )
      );

      const remainingSubmissions = logs.filter((log) => {
        if (!log.action) return true;
        const isAdmin =
          log.actor?.toLowerCase() === "admin" ||
          log.details?.toLowerCase().includes("(admin)");
        return isAdmin;
      });
      setLogs(remainingSubmissions);
      setCurrentPage(1);
      toast.success("Activity logs cleared successfully!");
    } catch (error) {
      console.error("Error clearing logs:", error);
      toast.error("Failed to clear all logs.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    toast.success("User logged out successfully");
    navigate("/login");
  };

  // Filter out admin logs entirely so only user logs show up
  const actualLogs = logs.filter((item) => {
    if (!item.action) return false;
    const isAdmin =
      item.actor?.toLowerCase() === "admin" ||
      item.details?.toLowerCase().includes("(admin)");
    return !isAdmin;
  });

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = actualLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(actualLogs.length / logsPerPage) || 1;

  return (
    <div
      className="min-h-screen w-full bg-[#240b3b] px-6 py-8 relative overflow-hidden text-white font-sans"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 30%, rgba(105, 30, 150, 0.45) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(190, 40, 110, 0.35) 0%, transparent 50%), #240b3b",
      }}
    >
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Panel */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center bg-[#2e1048]/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl mb-6 border border-purple-500/30 relative z-10">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-extrabold text-white tracking-wide">
            System Activity Logs
          </h1>
          <p className="text-sm text-purple-300/80 mt-0.5">
            Track critical security events and administrative actions in real time.
          </p>
        </div>
        <div className="space-x-3 flex items-center">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="px-4 py-2.5 bg-[#1b082d]/70 text-purple-200 border border-purple-500/40 rounded-xl font-bold text-sm hover:bg-[#1b082d] transition duration-200 shadow-md"
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold text-sm hover:bg-red-500/30 transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="max-w-7xl mx-auto bg-[#2e1048]/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-purple-500/30 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Activity Records</h2>
            <p className="text-xs text-purple-300/80">
              Showing log entries history
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1.5 bg-[#1b082d]/70 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold whitespace-nowrap shadow-inner">
              Total Logs: {actualLogs.length}
            </span>
            <button
              onClick={handleClearLogs}
              className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-500/30 transition duration-200"
            >
              Clear Logs
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-purple-500/30 text-xs font-bold text-purple-300 uppercase tracking-wider">
                <th className="pb-3 px-3">Timestamp</th>
                <th className="pb-3 px-3">User</th>
                <th className="pb-3 px-3">Action Type</th>
                <th className="pb-3 px-3">Details</th>
                <th className="pb-3 px-3 text-right pr-5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/20 text-sm text-purple-100">
              {currentLogs.length > 0 ? (
                currentLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-purple-900/20 transition group"
                  >
                    <td className="py-3 px-3 text-xs text-purple-300/80 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 bg-linear-to-r from-orange-500 to-pink-600 text-white rounded-lg text-xs font-bold shadow-sm inline-block">
                        {log.actor}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 bg-[#1b082d]/70 text-purple-200 border border-purple-500/40 rounded-lg text-xs font-bold font-mono inline-block">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-purple-100">
                      {log.details}
                    </td>
                    <td className="py-3 px-3 text-right">
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
                  <td
                    colSpan="5"
                    className="py-6 text-center text-purple-300/80 text-sm"
                  >
                    No activity logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {actualLogs.length > 0 && (
        <div className="max-w-7xl mx-auto mt-4 px-2 flex flex-col sm:flex-row justify-between items-center text-xs text-white relative z-10 gap-2">
          <p className="text-purple-300/80">
            Showing {indexOfFirstLog + 1} to{" "}
            {Math.min(indexOfLastLog, actualLogs.length)} of {actualLogs.length} entries
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-xl font-bold border transition shadow-md ${
                currentPage === 1
                  ? "bg-[#2e1048] text-purple-400/40 border-purple-500/20 cursor-not-allowed opacity-40"
                  : "bg-[#2e1048] text-purple-200 border-purple-500/40 hover:bg-[#1b082d]"
              }`}
            >
              Previous
            </button>

            <span className="px-3 py-1.5 bg-[#2e1048] rounded-xl font-bold text-white border border-purple-500/40 shadow-inner">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-xl font-bold border transition shadow-md ${
                currentPage === totalPages
                  ? "bg-[#2e1048] text-purple-400/40 border-purple-500/20 cursor-not-allowed opacity-40"
                  : "bg-[#2e1048] text-purple-200 border-purple-500/40 hover:bg-[#1b082d]"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs z-50 px-4">
            <div className="bg-[#2e1048] p-6 rounded-3xl shadow-2xl max-w-sm w-full border border-purple-500/40 text-center text-white">
              <h3 className="text-lg font-extrabold text-white mb-2">
                Are you sure?
              </h3>
              <p className="text-xs text-purple-300/80 mb-6">
                Do you really want to delete this log? This action cannot be
                undone.
              </p>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-[#1b082d] hover:bg-purple-900/40 text-purple-200 rounded-xl text-xs font-bold border border-purple-500/40 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-linear-to-r from-orange-500 to-pink-600 hover:opacity-95 text-white rounded-xl text-xs font-bold transition shadow-lg tracking-wide"
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