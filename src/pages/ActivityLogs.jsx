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
    toast.success("User logged out successfully");
    navigate("/login");
  };

 
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage) || 1;

 return (
    <div className="min-h-screen w-full bg-[#F9B2BC] px-4 py-8 relative overflow-hidden text-[#4a242c]">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#F67C8E]/20 rounded-full blur-3xl pointer-events-none"></div>

     
      <div className="w-[92%] max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center bg-[#FCD3DC] backdrop-blur-md p-6 rounded-3xl shadow-xl mb-6 border border-white/60 z-10 relative">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-extrabold text-[#4a242c]">
            System Activity Logs
          </h1>
          <p className="text-sm text-[#68333e]/80">
            Track critical security events and administrative actions in real time.
          </p>
        </div>
        <div className="space-x-3 flex items-center">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="px-4 py-2.5 bg-[#F6B8C2]/50 text-[#5c2d36] border border-[#D58C99] rounded-xl font-bold text-sm hover:bg-[#F6B8C2] transition duration-200 shadow-md"
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 bg-red-500/20 text-red-700 border border-red-500/30 rounded-xl font-bold text-sm hover:bg-red-500/30 transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

     
      <div className="w-[92%] max-w-7xl mx-auto bg-[#FCD3DC] backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/60 relative z-10 mb-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#4a242c]">Activity Records</h2>
            <p className="text-xs text-[#68333e]/80">
              Showing log entries history
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-[#F6B8C2]/50 text-[#5c2d36] border border-[#D58C99] rounded-xl text-xs font-bold">
              Total Logs: {logs.length}
            </span>
            <button
              onClick={handleClearLogs}
              className="px-3 py-1.5 bg-red-500/20 text-red-700 border border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-500/30 transition duration-200"
            >
              Clear Logs
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#D58C99] text-xs font-bold text-[#5c2d36] uppercase tracking-wider">
                <th className="pb-3 px-3">Timestamp</th>
                <th className="pb-3 px-3">User</th>
                <th className="pb-3 px-3">Action Type</th>
                <th className="pb-3 px-3">Details</th>
                <th className="pb-3 px-3 text-right pr-5">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#4a242c]">
              {currentLogs.length > 0 ? (
                currentLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-[#D58C99]/30 group"
                  >
                    <td className="py-3 px-3 text-xs text-[#68333e]/80 whitespace-nowrap group-hover:bg-[#F6B8C2]/30 transition">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-3 group-hover:bg-[#F6B8C2]/30 transition">
                      <span className="px-2.5 py-1 bg-[#F45B73] text-white rounded-lg text-xs font-bold shadow-sm inline-block">
                        {log.actor}
                      </span>
                    </td>
                    <td className="py-3 px-3 group-hover:bg-[#F6B8C2]/30 transition">
                      <span className="px-2.5 py-1 bg-[#F6B8C2]/50 text-[#5c2d36] border border-[#D58C99] rounded-lg text-xs font-bold font-mono inline-block">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#4a242c] group-hover:bg-[#F6B8C2]/30 transition">
                      {log.details}
                    </td>
                    <td className="py-3 px-3 text-right group-hover:bg-[#F6B8C2]/30 transition">
                      <button
                        onClick={() => handleDeleteClick(log.id)}
                        className="px-3 py-1 bg-red-500/20 text-red-700 border border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-500/30 transition"
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
                    className="py-6 text-center text-[#68333e]/80 text-sm"
                  >
                    No activity logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

     
      {logs.length > 0 && (
        <div className="w-[92%] max-w-7xl mx-auto mt-2 px-2 flex flex-col sm:flex-row justify-between items-center text-xs text-[#4a242c] relative z-10 gap-2">
          <p className="text-[#68333e]/80">
            Showing {indexOfFirstLog + 1} to{" "}
            {Math.min(indexOfLastLog, logs.length)} of {logs.length} entries
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-xl font-bold border transition ${
                currentPage === 1
                  ? "bg-[#F6B8C2]/20 text-[#68333e]/40 border-[#D58C99]/20 cursor-not-allowed"
                  : "bg-[#F6B8C2]/50 text-[#5c2d36] border-[#D58C99] hover:bg-[#F6B8C2]"
              }`}
            >
              Previous
            </button>

            <span className="px-3 py-1.5 bg-[#FCD3DC] rounded-xl font-bold text-[#4a242c] border border-[#D58C99]">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-xl font-bold border transition ${
                currentPage === totalPages
                  ? "bg-[#F6B8C2]/20 text-[#68333e]/40 border-[#D58C99]/20 cursor-not-allowed"
                  : "bg-[#F6B8C2]/50 text-[#5c2d36] border-[#D58C99] hover:bg-[#F6B8C2]"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

     
      {showConfirm &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xs z-9999 px-4">
            <div className="bg-[#FCD3DC] p-6 rounded-3xl shadow-2xl max-w-sm w-full border border-white/60 text-center">
              <h3 className="text-lg font-extrabold text-[#4a242c] mb-2">
                Are you sure?
              </h3>
              <p className="text-xs text-[#68333e]/80 mb-6">
                Do you really want to delete this log? This action cannot be
                undone.
              </p>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-[#F6B8C2]/50 hover:bg-[#F6B8C2] text-[#4a242c] rounded-xl text-xs font-bold border border-[#D58C99] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-[#F45B73] hover:bg-[#E04860] text-white rounded-xl text-xs font-bold transition shadow-md"
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