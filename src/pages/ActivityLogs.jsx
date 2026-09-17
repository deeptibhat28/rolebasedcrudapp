import React, { useState, useEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import ExportModal from "../components/ExportModal";

const API_URL = "https://6a90168dff2484963a5db61a.mockapi.io/activity-logs";

function StatCard({ label, value, onClick }) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`bg-white border border-blue-100 dark:bg-purple-900/60 dark:border-purple-500/30 rounded-2xl p-4 shadow-lg transition duration-200 group ${
        onClick
          ? "cursor-pointer hover:bg-blue-600 hover:border-blue-600 hover:-translate-y-0.5 dark:hover:border-purple-400/60 dark:hover:bg-purple-900/80"
          : ""
      }`}
    >
      <p
        className={`text-[11px] uppercase tracking-wide font-bold transition duration-200 ${onClick ? "text-blue-600/70 group-hover:text-white dark:text-purple-300/80" : "text-blue-600/70 dark:text-purple-300/80"}`}
      >
        {label}
      </p>
      <p
        className={`text-2xl font-extrabold mt-1.5 transition duration-200 ${onClick ? "text-gray-900 group-hover:text-white dark:text-white" : "text-gray-900 dark:text-white"}`}
      >
        {value}
      </p>
    </div>
  );
}

function RegistrationsModal({ logs, onClose }) {
  const [visibleCount, setVisibleCount] = useState(15);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      setVisibleCount((prev) => Math.min(prev + 15, logs.length));
    }
  };

  const visibleLogs = logs.slice(0, visibleCount);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#2e1048] border border-blue-100 dark:border-purple-500/30 rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-blue-100 dark:border-purple-500/30">
          <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
            New Registrations ({logs.length})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-blue-600 dark:text-purple-300 dark:hover:text-white text-xl leading-none px-2"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-y-auto p-5 space-y-2"
        >
          {logs.length === 0 ? (
            <p className="text-gray-500 dark:text-purple-300/70 text-sm">
              No registrations found.
            </p>
          ) : (
            <>
              {visibleLogs.map((log) => (
                <div
                  key={log.actor}
                  className="flex items-center justify-between bg-blue-50/60 dark:bg-[#1b082d]/70 border border-blue-100 dark:border-purple-500/20 rounded-xl px-4 py-2.5 gap-3"
                >
                  <div className="min-w-0">
                    <span className="text-gray-900 dark:text-white font-semibold text-sm block truncate">
                      {log.actor}
                    </span>
                    <span className="text-blue-600/70 dark:text-purple-300/70 text-xs block truncate">
                      {log.details}
                    </span>
                  </div>
                  <span className="text-blue-600/70 dark:text-purple-300/70 text-xs whitespace-nowrap shrink-0">
                    {log.timestamp}
                  </span>
                </div>
              ))}
              {visibleCount < logs.length && (
                <p className="text-center text-blue-400 dark:text-purple-400/60 text-xs py-2">
                  Loading more...
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function getActionBadgeStyle(action) {
  const a = (action || "").toUpperCase();
  if (a.includes("LOGIN")) {
    return "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-300 dark:border-green-500/30";
  }
  if (a.includes("LOGOUT")) {
    return "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30";
  }
  if (a.includes("REGISTER")) {
    return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-200 dark:border-purple-400/30";
  }
  if (a.includes("DELETE")) {
    return "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30";
  }
  if (a.includes("CREATE")) {
    return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30";
  }
  if (a.includes("UPDATE")) {
    return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-300 dark:border-yellow-500/30";
  }
  return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-[#1b082d]/70 dark:text-purple-200 dark:border-purple-500/40";
}

export default function ActivityLogs() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [logs, setLogs] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteLogId, setDeleteLogId] = useState(null);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const [actionFilter, setActionFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");
  const [showLoginsTodayOnly, setShowLoginsTodayOnly] = useState(false);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

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

  useEffect(() => {
    setCurrentPage(1);
  }, [showLoginsTodayOnly]);

  const actualLogs = logs.filter((item) => {
    if (!item.action) return false;
    const isAdmin =
      item.actor?.toLowerCase() === "admin" ||
      item.details?.toLowerCase().includes("(admin)");
    return !isAdmin;
  });

  const todayDisplayStr = new Date().toLocaleDateString("en-GB");

  const isLoginTodayLog = (log) =>
    (log.action || "").toUpperCase().includes("LOGIN") &&
    !(log.action || "").toUpperCase().includes("LOGOUT") &&
    log.timestamp?.startsWith(todayDisplayStr);

  const loginsToday = actualLogs.filter(isLoginTodayLog).length;

  const registrationLogs = actualLogs.filter((log) =>
    (log.action || "").toUpperCase().includes("REGISTER"),
  );
  const newRegistrations = registrationLogs.length;

  const actionOptions = useMemo(() => {
    const unique = [
      ...new Set(actualLogs.map((log) => log.action).filter(Boolean)),
    ];
    return unique.sort();
  }, [actualLogs]);

  const userOptions = useMemo(() => {
    const unique = [
      ...new Set(actualLogs.map((log) => log.actor).filter(Boolean)),
    ];
    return unique.sort();
  }, [actualLogs]);

  const filteredLogs = actualLogs.filter((log) => {
    const matchesAction = actionFilter === "All" || log.action === actionFilter;
    const matchesUser = userFilter === "All" || log.actor === userFilter;
    const matchesLoginToday = !showLoginsTodayOnly || isLoginTodayLog(log);
    return matchesAction && matchesUser && matchesLoginToday;
  });

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage) || 1;

  const handleActionFilterChange = (e) => {
    setActionFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleUserFilterChange = (e) => {
    setUserFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleCheckboxChange = (id) => {
    setSelectedLogs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageIds = currentLogs.map((log) => log.id);
      setSelectedLogs((prev) => [...new Set([...prev, ...pageIds])]);
    } else {
      const pageIds = currentLogs.map((log) => log.id);
      setSelectedLogs((prev) => prev.filter((id) => !pageIds.includes(id)));
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteLogId(id);
    setShowConfirm(true);
  };

  const handleMainButtonClick = () => {
    if (!isSelectMode) {
      setIsSelectMode(true);
    } else {
      if (selectedLogs.length > 0) {
        setDeleteLogId("selected");
        setShowConfirm(true);
      } else {
        setIsSelectMode(false);
        setSelectedLogs([]);
      }
    }
  };

  const confirmDelete = async () => {
    try {
      if (deleteLogId === "selected") {
        await Promise.all(
          selectedLogs.map((id) =>
            fetch(`${API_URL}/${id}`, { method: "DELETE" }),
          ),
        );
        const updatedLogs = logs.filter(
          (log) => !selectedLogs.includes(log.id),
        );
        setLogs(updatedLogs);
        setSelectedLogs([]);
        setIsSelectMode(false);
        toast.success("Selected logs deleted successfully!");
      } else {
        const response = await fetch(`${API_URL}/${deleteLogId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete log on server");

        const updatedLogs = logs.filter((log) => log.id !== deleteLogId);
        setLogs(updatedLogs);
        setSelectedLogs((prev) => prev.filter((id) => id !== deleteLogId));
        toast.success("Log deleted successfully!");
      }

      setShowConfirm(false);
      setDeleteLogId(null);

      const remainingActualLogs = logs.filter((item) => {
        if (!item.action) return false;
        const isAdmin =
          item.actor?.toLowerCase() === "admin" ||
          item.details?.toLowerCase().includes("(admin)");
        return !isAdmin;
      });
      const totalPagesAfterDelete = Math.ceil(
        (remainingActualLogs.length -
          (deleteLogId === "selected" ? selectedLogs.length : 1)) /
          logsPerPage,
      );
      if (currentPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) {
        setCurrentPage(totalPagesAfterDelete);
      }
    } catch (error) {
      console.error("Error deleting log(s):", error);
      toast.error("Failed to delete log(s).");
    }
  };

  const handleClearLogs = async () => {
    try {
      await Promise.all(
        actualLogs.map((log) =>
          fetch(`${API_URL}/${log.id}`, { method: "DELETE" }),
        ),
      );

      const remainingSubmissions = logs.filter((log) => {
        if (!log.action) return true;
        const isAdmin =
          log.actor?.toLowerCase() === "admin" ||
          log.details?.toLowerCase().includes("(admin)");
        return isAdmin;
      });
      setLogs(remainingSubmissions);
      setSelectedLogs([]);
      setIsSelectMode(false);
      setCurrentPage(1);
      setActionFilter("All");
      setUserFilter("All");
      setShowLoginsTodayOnly(false);
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

  const isAllCurrentSelected =
    currentLogs.length > 0 &&
    currentLogs.every((log) => selectedLogs.includes(log.id));

  const exportColumns = [
    { key: "timestamp", label: "Timestamp" },
    { key: "actor", label: "User" },
    { key: "action", label: "Action Type" },
    { key: "details", label: "Details" },
  ];

  const exportRows = filteredLogs.map((log) => ({
    timestamp: log.timestamp || "",
    actor: log.actor || "",
    action: log.action || "",
    details: log.details || "",
  }));

  return (
    <div
      className="min-h-screen w-full bg-blue-50 dark:bg-[#240b3b] px-4 sm:px-6 py-6 sm:py-8 relative overflow-hidden text-gray-900 dark:text-white font-sans transition-colors duration-200"
      style={
        theme === "dark"
          ? {
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(105, 30, 150, 0.45) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(190, 40, 110, 0.35) 0%, transparent 50%), #240b3b",
            }
          : {
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.06) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(96, 165, 250, 0.06) 0%, transparent 50%)",
            }
      }
    >
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200/20 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-300/20 dark:bg-pink-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/95 dark:bg-[#2e1048]/95 backdrop-blur-md p-5 sm:p-6 rounded-3xl shadow-2xl mb-6 border-2 border-blue-200 dark:border-purple-500/30 relative z-10 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-wide">
            System Activity Logs
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-purple-300/80 mt-0.5">
            Track critical security events and administrative actions in real
            time.
          </p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-end">
          <ThemeToggle />
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-[#1b082d]/70 dark:text-purple-200 dark:border-purple-500/45 rounded-xl font-bold text-xs sm:text-sm hover:bg-blue-100  dark:hover:bg-[#1b082d] transition duration-200 shadow-md"
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 rounded-xl font-bold text-xs sm:text-sm hover:bg-red-100 dark:hover:bg-red-500/30 transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 relative z-10">
        <StatCard label="Total Logs" value={actualLogs.length} />
        <StatCard
          label="Logins Today"
          value={loginsToday}
          onClick={() => setShowLoginsTodayOnly(true)}
        />
        <StatCard
          label="New Registrations"
          value={newRegistrations}
          onClick={() => setShowRegistrationsModal(true)}
        />
      </div>

      <div className="max-w-7xl mx-auto bg-white/95 dark:bg-[#2e1048]/95 backdrop-blur-md p-4 sm:p-6 rounded-3xl shadow-2xl border border-blue-100 dark:border-purple-500/30 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              Activity Records
            </h2>
            <p className="text-xs text-gray-500 dark:text-purple-300/80">
              Showing log entries history
            </p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap gap-y-2 w-full sm:w-auto">
            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-[#1b082d]/70 dark:text-purple-300 dark:border-purple-500/40 rounded-xl text-xs font-bold whitespace-nowrap shadow-inner">
              Total Logs: {actualLogs.length}
            </span>

            <button
              onClick={() => setShowExportModal(true)}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-[#1b082d]/70 dark:text-purple-300 dark:border-purple-500/40 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-[#1b082d] transition duration-200 shadow-md"
            >
              Export Data
            </button>

            <button
              onClick={handleMainButtonClick}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition duration-200 shadow-md border ${
                !isSelectMode
                  ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-[#1b082d]/70 dark:text-purple-200 dark:border-purple-500/40 dark:hover:bg-[#1b082d]"
                  : selectedLogs.length > 0
                    ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-500/30 dark:text-red-300 dark:border-red-500/40 dark:hover:bg-red-500/40 animate-pulse"
                    : "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-500/40 dark:hover:bg-purple-900/60"
              }`}
            >
              {!isSelectMode
                ? "Select All"
                : selectedLogs.length > 0
                  ? `Delete Selected (${selectedLogs.length})`
                  : "Cancel Selection"}
            </button>

            <button
              onClick={handleClearLogs}
              className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-500/30 transition duration-200"
            >
              Clear All Logs
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-4">
          <select
            value={actionFilter}
            onChange={handleActionFilterChange}
            className="px-3 py-2 bg-blue-50 border border-blue-200 dark:bg-[#1b082d]/70 dark:border-purple-500/40 rounded-xl text-xs text-gray-700 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-purple-500 shadow-inner [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-[#1b082d] dark:[&>option]:text-white"
          >
            <option value="All">All Actions</option>
            {actionOptions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>

          <select
            value={userFilter}
            onChange={handleUserFilterChange}
            className="px-3 py-2 bg-blue-50 border border-blue-200 dark:bg-[#1b082d]/70 dark:border-purple-500/40 rounded-xl text-xs text-gray-700 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-purple-500 shadow-inner [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-[#1b082d] dark:[&>option]:text-white"
          >
            <option value="All">All Users</option>
            {userOptions.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </select>

          {(actionFilter !== "All" || userFilter !== "All") && (
            <button
              onClick={() => {
                setActionFilter("All");
                setUserFilter("All");
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-[#1b082d]/70 dark:text-purple-300 dark:border-purple-500/40 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-[#1b082d] transition whitespace-nowrap"
            >
              Reset Filters
            </button>
          )}
        </div>

        {showLoginsTodayOnly && (
          <div className="mb-6 flex items-center gap-2">
            <span className="px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30 rounded-xl text-xs font-bold">
              Showing: Today's logins only
            </span>
            <button
              onClick={() => setShowLoginsTodayOnly(false)}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-[#1b082d]/70 dark:text-purple-200 dark:border-purple-500/40 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-[#1b082d] transition"
            >
              Clear
            </button>
          </div>
        )}

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-blue-100 dark:border-purple-500/30 text-xs font-bold text-blue-600/70 dark:text-purple-300 uppercase tracking-wider">
                {isSelectMode && (
                  <th className="pb-3 px-3 w-12 text-center animate-fadeIn">
                    <input
                      type="checkbox"
                      checked={isAllCurrentSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded-md border-blue-300 dark:border-purple-400/50 bg-white dark:bg-[#1b082d] text-orange-500 focus:ring-0 focus:ring-offset-0 cursor-pointer transition shadow-inner accent-orange-500"
                    />
                  </th>
                )}
                <th className="pb-3 px-3">Timestamp</th>
                <th className="pb-3 px-3">User</th>
                <th className="pb-3 px-3">Action Type</th>
                <th className="pb-3 px-3">Details</th>
                <th className="pb-3 px-3 text-right pr-5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100 dark:divide-purple-500/20 text-sm text-gray-700 dark:text-purple-100">
              {currentLogs.length > 0 ? (
                currentLogs.map((log) => {
                  const isChecked = selectedLogs.includes(log.id);
                  return (
                    <tr
                      key={log.id}
                      className={`transition group ${
                        isChecked
                          ? "bg-blue-50 dark:bg-purple-900/30"
                          : "hover:bg-blue-50/60 dark:hover:bg-purple-900/20"
                      }`}
                    >
                      {isSelectMode && (
                        <td className="py-3 px-3 text-center animate-fadeIn">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCheckboxChange(log.id)}
                            className="w-4 h-4 rounded-md border-blue-300 dark:border-purple-400/50 bg-white dark:bg-[#1b082d] text-orange-500 focus:ring-0 focus:ring-offset-0 cursor-pointer transition shadow-inner accent-orange-500"
                          />
                        </td>
                      )}
                      <td className="py-3 px-3 text-xs text-gray-500 dark:text-purple-300/80 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 bg-linear-to-r from-orange-500 to-pink-600 text-white rounded-lg text-xs font-bold shadow-sm inline-block">
                          {log.actor}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono inline-block border ${getActionBadgeStyle(
                            log.action,
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-700 dark:text-purple-100 wrap-break-word max-w-xs">
                        {log.details}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteClick(log.id)}
                          className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-500/30 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={isSelectMode ? 6 : 5}
                    className="py-6 text-center text-gray-500 dark:text-purple-300/80 text-sm"
                  >
                    No activity logs match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="block md:hidden space-y-3">
          {currentLogs.length > 0 ? (
            currentLogs.map((log) => {
              const isChecked = selectedLogs.includes(log.id);
              return (
                <div
                  key={log.id}
                  className={`p-4 rounded-2xl border transition shadow-inner ${
                    isChecked
                      ? "bg-blue-50 border-blue-300 dark:bg-purple-900/40 dark:border-purple-400"
                      : "bg-blue-50/40 border-blue-100 dark:bg-[#1b082d]/70 dark:border-purple-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {isSelectMode && (
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(log.id)}
                          className="w-4 h-4 rounded-md border-blue-300 dark:border-purple-400/50 bg-white dark:bg-[#1b082d] text-orange-500 accent-orange-500 cursor-pointer"
                        />
                      )}
                      <span className="text-xs text-gray-500 dark:text-purple-300/80">
                        {log.timestamp}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteClick(log.id)}
                      className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-500/30"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-linear-to-r from-orange-500 to-pink-600 text-white rounded-md text-xs font-bold">
                      {log.actor}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold border ${getActionBadgeStyle(
                        log.action,
                      )}`}
                    >
                      {log.action}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 dark:text-purple-100 wrap-break-word">
                    <span className="font-semibold text-gray-500 dark:text-purple-300/80">
                      Details:{" "}
                    </span>
                    {log.details}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-gray-500 dark:text-purple-300/80 text-sm bg-blue-50/40 dark:bg-[#1b082d]/50 rounded-2xl border border-blue-100 dark:border-purple-500/20">
              No activity logs match the selected filters.
            </div>
          )}
        </div>
      </div>

      {filteredLogs.length > 0 && (
        <div className="max-w-7xl mx-auto mt-4 px-2 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-900 dark:text-white relative z-10 gap-3">
          <p className="text-gray-500 dark:text-purple-300/80 text-center sm:text-left">
            Showing {indexOfFirstLog + 1} to{" "}
            {Math.min(indexOfLastLog, filteredLogs.length)} of{" "}
            {filteredLogs.length} entries
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-xl font-bold border transition shadow-md ${
                currentPage === 1
                  ? "bg-white text-gray-300 border-blue-100 dark:bg-[#2e1048] dark:text-purple-400/40 dark:border-purple-500/20 cursor-not-allowed opacity-40"
                  : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50 dark:bg-[#2e1048] dark:text-purple-200 dark:border-purple-500/40 dark:hover:bg-[#1b082d]"
              }`}
            >
              Previous
            </button>

            <span className="px-3 py-1.5 bg-white text-gray-900 rounded-xl font-bold border border-blue-200 dark:bg-[#2e1048] dark:text-white dark:border-purple-500/40 shadow-inner">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-xl font-bold border transition shadow-md ${
                currentPage === totalPages
                  ? "bg-white text-gray-300 border-blue-100 dark:bg-[#2e1048] dark:text-purple-400/40 dark:border-purple-500/20 cursor-not-allowed opacity-40"
                  : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50 dark:bg-[#2e1048] dark:text-purple-200 dark:border-purple-500/40 dark:hover:bg-[#1b082d]"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showConfirm &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs z-50 px-4">
            <div className="bg-white dark:bg-[#2e1048] p-6 rounded-3xl shadow-2xl max-w-sm w-full border border-blue-200 dark:border-purple-500/40 text-center text-gray-900 dark:text-white">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2">
                Are you sure?
              </h3>
              <p className="text-xs text-gray-500 dark:text-purple-300/80 mb-6">
                {deleteLogId === "selected"
                  ? `Do you really want to delete these ${selectedLogs.length} selected logs?`
                  : "Do you really want to delete this log?"}{" "}
                This action cannot be undone.
              </p>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-[#1b082d] dark:hover:bg-purple-900/40 dark:text-purple-200 rounded-xl text-xs font-bold border border-blue-200 dark:border-purple-500/40 transition"
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
          document.body,
        )}

      {showRegistrationsModal && (
        <RegistrationsModal
          logs={registrationLogs}
          onClose={() => setShowRegistrationsModal(false)}
        />
      )}

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        columns={exportColumns}
        rows={exportRows}
        baseName="activity_logs"
        sheetName="Activity Logs"
      />
    </div>
  );
}
