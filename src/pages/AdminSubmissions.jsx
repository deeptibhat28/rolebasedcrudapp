import React, { useEffect, useState, useMemo } from "react";
import ReactDOM from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { deleteSubmission, getSubmissions } from "../services/api";
import { toast } from "react-toastify";
import { logActivity } from "../utils/logger";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import ExportModal from "../components/ExportModal";

function toIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatShortDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function DateRangePicker({ fromDate, toDate, onApply }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const base = fromDate ? new Date(fromDate + "T00:00:00") : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [tempFrom, setTempFrom] = useState(fromDate);
  const [tempTo, setTempTo] = useState(toDate);

  const openPicker = () => {
    setTempFrom(fromDate);
    setTempTo(toDate);
    const base = fromDate ? new Date(fromDate + "T00:00:00") : new Date();
    setViewDate(new Date(base.getFullYear(), base.getMonth(), 1));
    setOpen(true);
  };

  const handleDayClick = (dateStr) => {
    if (!tempFrom || (tempFrom && tempTo)) {
      setTempFrom(dateStr);
      setTempTo("");
    } else if (dateStr < tempFrom) {
      setTempFrom(dateStr);
    } else {
      setTempTo(dateStr);
    }
  };

  const handleApply = () => {
    onApply(tempFrom, tempTo);
    setOpen(false);
  };

  const handleCancel = () => setOpen(false);

  const handleClearRange = (e) => {
    e.stopPropagation();
    onApply("", "");
  };

  const changeMonth = (delta) => {
    setViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1),
    );
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekday = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ day: daysInPrevMonth - startWeekday + 1 + i, current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      current: true,
      dateStr: toIsoDate(new Date(year, month, d)),
    });
  }
  while (cells.length % 7 !== 0) {
    const overflowDay = cells.length - startWeekday - daysInMonth + 1;
    cells.push({ day: overflowDay, current: false });
  }

  const label =
    fromDate && toDate
      ? `${formatShortDate(fromDate)} \u2013 ${formatShortDate(toDate)}`
      : fromDate
        ? `${formatShortDate(fromDate)} \u2013 ...`
        : "Date range";

  return (
    <div className="relative">
      <button
        onClick={openPicker}
        className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 dark:bg-[#1b082d]/70 dark:border-purple-500/40 rounded-xl text-xs text-gray-700 dark:text-purple-100 hover:bg-blue-100 dark:hover:bg-[#1b082d] transition shadow-inner"
      >
        <span className="whitespace-nowrap">{label}</span>
        {fromDate && (
          <span
            onClick={handleClearRange}
            className="text-blue-400 hover:text-blue-700 dark:text-purple-400 dark:hover:text-white ml-1 leading-none"
            role="button"
            aria-label="Clear date range"
          >
            &times;
          </span>
        )}
        <span className="text-blue-400 dark:text-purple-400">&#9662;</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={handleCancel}></div>
          <div className="absolute z-50 top-full mt-2 left-0 bg-white dark:bg-[#2e1048] border border-blue-200 dark:border-purple-500/40 rounded-2xl shadow-2xl p-4 w-72">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => changeMonth(-1)}
                className="text-blue-600 hover:text-gray-900 dark:text-purple-300 dark:hover:text-white px-2 text-sm"
                aria-label="Previous month"
              >
                &#8249;
              </button>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {viewDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                onClick={() => changeMonth(1)}
                className="text-blue-600 hover:text-gray-900 dark:text-purple-300 dark:hover:text-white px-2 text-sm"
                aria-label="Next month"
              >
                &#8250;
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-blue-400/70 dark:text-purple-400/70 mb-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {cells.map((cell, idx) => {
                if (!cell.current) {
                  return (
                    <span
                      key={idx}
                      className="py-1.5 text-blue-200 dark:text-purple-600/30"
                    >
                      {cell.day}
                    </span>
                  );
                }
                const isFrom = cell.dateStr === tempFrom;
                const isTo = cell.dateStr === tempTo;
                const inRange =
                  tempFrom &&
                  tempTo &&
                  cell.dateStr > tempFrom &&
                  cell.dateStr < tempTo;
                return (
                  <button
                    key={idx}
                    onClick={() => handleDayClick(cell.dateStr)}
                    className={`py-1.5 rounded-lg transition ${
                      isFrom || isTo
                        ? "bg-linear-to-r from-orange-500 to-pink-600 text-white font-bold"
                        : inRange
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200"
                          : "text-gray-700 hover:bg-blue-50 dark:text-purple-100 dark:hover:bg-purple-800/40"
                    }`}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-blue-100 dark:border-purple-500/20">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-xs font-bold text-blue-700 border border-blue-200 dark:text-purple-200 dark:border-purple-500/40 rounded-xl hover:bg-blue-50 dark:hover:bg-[#1b082d] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-3 py-1.5 text-xs font-bold text-white bg-linear-to-r from-orange-500 to-pink-600 rounded-xl hover:opacity-95 transition shadow-lg"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminSubmissions() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [submissions, setSubmissions] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [submittedByFilter, setSubmittedByFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);

  const dateFilter = searchParams.get("date");
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/");
    } else {
      fetchAllSubmissions();
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter, submittedByFilter, genderFilter, fromDate, toDate]);

  const fetchAllSubmissions = async () => {
    try {
      const data = await getSubmissions();
      setSubmissions(data.reverse());
    } catch (err) {
      toast.error("Failed to fetch all submissions.");
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const targetSub = submissions.find(
        (sub) => String(sub.id || sub._id) === String(deleteId),
      );
      const actualId = targetSub ? targetSub.id || targetSub._id : deleteId;
      const subName = targetSub ? targetSub.fullName : `ID: ${actualId}`;

      await deleteSubmission(actualId);

      logActivity(
        "FORM_DELETE",
        `Deleted form submission for: ${subName}`,
        currentUser?.username || "Admin",
      );

      setSubmissions((prev) =>
        prev.filter((sub) => String(sub.id || sub._id) !== String(actualId)),
      );

      toast.success("Submission deleted successfully.");
    } catch (err) {
      console.error("Delete failed:", err.response || err);
      toast.error("Failed to delete submission.");
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    toast.success("User logged out successfully");
    navigate("/login");
  };

  const clearDateFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("date");
    setSearchParams(next);
  };

  const resetAllFilters = () => {
    setSubmittedByFilter("All");
    setGenderFilter("All");
    setFromDate("");
    setToDate("");
    setSearchTerm("");
    clearDateFilter();
  };

  const submittedByOptions = useMemo(() => {
    const unique = [
      ...new Set(submissions.map((sub) => sub.username).filter(Boolean)),
    ];
    return unique.sort();
  }, [submissions]);

  const genderOptions = useMemo(() => {
    const unique = [
      ...new Set(submissions.map((sub) => sub.gender).filter(Boolean)),
    ];
    return unique.sort();
  }, [submissions]);

  const dateFilteredSubmissions =
    dateFilter === "today"
      ? submissions.filter((sub) => sub.dateOfSubmission === todayStr)
      : submissions;

  const filteredSubmissions = dateFilteredSubmissions.filter((sub) => {
    const term = searchTerm.toLowerCase();
    const username = (sub.username || "").toLowerCase();
    const fullName = (sub.fullName || "").toLowerCase();
    const email = (sub.email || "").toLowerCase();
    const department = (sub.department || "").toLowerCase();
    const matchesSearch =
      username.includes(term) ||
      fullName.includes(term) ||
      email.includes(term) ||
      department.includes(term);

    const matchesSubmittedBy =
      submittedByFilter === "All" || sub.username === submittedByFilter;

    const matchesGender = genderFilter === "All" || sub.gender === genderFilter;

    const subDate = sub.dateOfSubmission || "";
    const matchesFromDate = !fromDate || subDate >= fromDate;
    const matchesToDate = !toDate || subDate <= toDate;

    return (
      matchesSearch &&
      matchesSubmittedBy &&
      matchesGender &&
      matchesFromDate &&
      matchesToDate
    );
  });

  const hasActiveFilters =
    submittedByFilter !== "All" ||
    genderFilter !== "All" ||
    fromDate !== "" ||
    toDate !== "" ||
    dateFilter === "today";

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSubmissions = filteredSubmissions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

  const formatDate = (isoDate) => {
    if (!isoDate) return "N/A";
    return isoDate.split("-").reverse().join("/");
  };

  const exportColumns = [
    { key: "username", label: "Submitted By" },
    { key: "fullName", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "gender", label: "Gender" },
    { key: "submittedDate", label: "Submitted Date" },
  ];

  const exportRows = filteredSubmissions.map((sub) => ({
    username: sub.username || "Unknown User",
    fullName: sub.fullName || "",
    email: sub.email || "",
    phone: sub.phone || "N/A",
    gender: sub.gender || "N/A",
    submittedDate: formatDate(sub.dateOfSubmission),
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
            User Submission Form Details
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-purple-300/80 mt-0.5">
            View and manage user form data.
          </p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-end">
          <ThemeToggle />
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-[#1b082d]/70 dark:text-purple-200 dark:border-purple-500/45 rounded-xl font-bold text-xs sm:text-sm hover:bg-blue-100 hover:border-blue-300 dark:hover:bg-[#1b082d] transition duration-200 shadow-md"
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

      <div className="max-w-7xl mx-auto bg-white/95 dark:bg-[#2e1048]/95 backdrop-blur-md p-4 sm:p-6 rounded-3xl shadow-2xl border border-blue-100 dark:border-purple-500/30 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              All User Submissions
            </h2>
            <p className="text-xs text-gray-500 dark:text-purple-300/80">
              Manage and search user form entries
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by username, name, email"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-blue-50 border border-blue-200 dark:bg-[#1b082d]/70 dark:border-purple-500/40 rounded-xl text-xs text-gray-900 dark:text-white placeholder-blue-400/60 dark:placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-purple-500 shadow-inner transition"
              />
            </div>

            <span className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-[#1b082d]/70 dark:text-purple-300 dark:border-purple-500/40 rounded-xl text-xs font-bold text-center whitespace-nowrap shadow-inner">
              Total: {filteredSubmissions.length}
            </span>

            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-[#1b082d]/70 dark:text-purple-300 dark:border-purple-500/40 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-[#1b082d] transition whitespace-nowrap shadow-inner"
            >
              Export Data
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 sm:gap-3 mb-4 flex-wrap">
          <select
            value={submittedByFilter}
            onChange={(e) => setSubmittedByFilter(e.target.value)}
            className="px-3 py-2 bg-blue-50 border border-blue-200 dark:bg-[#1b082d]/70 dark:border-purple-500/40 rounded-xl text-xs text-gray-700 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-purple-500 shadow-inner [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-[#1b082d] dark:[&>option]:text-white"
          >
            <option value="All">All Submitters</option>
            {submittedByOptions.map((username) => (
              <option key={username} value={username}>
                {username}
              </option>
            ))}
          </select>

          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-3 py-2 bg-blue-50 border border-blue-200 dark:bg-[#1b082d]/70 dark:border-purple-500/40 rounded-xl text-xs text-gray-700 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-purple-500 shadow-inner [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-[#1b082d] dark:[&>option]:text-white"
          >
            <option value="All">All Genders</option>
            {genderOptions.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>

          <DateRangePicker
            fromDate={fromDate}
            toDate={toDate}
            onApply={(from, to) => {
              setFromDate(from);
              setToDate(to);
            }}
          />

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-[#1b082d]/70 dark:text-purple-300 dark:border-purple-500/40 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-[#1b082d] transition whitespace-nowrap"
            >
              Reset Filters
            </button>
          )}
        </div>

        {dateFilter === "today" && (
          <div className="mb-4 flex items-center gap-2">
            <span className="px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30 rounded-xl text-xs font-bold">
              Showing: Today's submissions only
            </span>
            <button
              onClick={clearDateFilter}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-[#1b082d]/70 dark:text-purple-200 dark:border-purple-500/40 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-[#1b082d] transition"
            >
              Clear
            </button>
          </div>
        )}

        {submissions.length === 0 ? (
          <p className="text-gray-500 dark:text-purple-300/80 text-sm py-6 text-center">
            No submissions found from any users yet.
          </p>
        ) : filteredSubmissions.length === 0 ? (
          <p className="text-gray-500 dark:text-purple-300/80 text-sm text-center py-6">
            {hasActiveFilters
              ? "No submissions match the selected filters."
              : `No matching submissions found for "${searchTerm}".`}
          </p>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-blue-100 dark:border-purple-500/30 text-xs font-bold text-blue-600/70 dark:text-purple-300 uppercase tracking-wider">
                    <th className="pb-3 px-2">Submitted By</th>
                    <th className="pb-3 px-2">Full Name</th>
                    <th className="pb-3 px-2">Email</th>
                    <th className="pb-3 px-2">Phone</th>
                    <th className="pb-3 px-2">Gender</th>
                    <th className="pb-3 px-2">Submitted Date</th>
                    <th className="pb-3 px-2 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100 dark:divide-purple-500/20 text-sm text-gray-700 dark:text-purple-100">
                  {currentSubmissions.map((sub) => {
                    const recordId = sub.id || sub._id;
                    return (
                      <tr
                        key={recordId}
                        className="hover:bg-blue-50/60 dark:hover:bg-purple-900/20 transition"
                      >
                        <td className="py-3 px-2">
                          <span className="px-2.5 py-1 bg-linear-to-r from-orange-500 to-pink-600 text-white rounded-lg text-xs font-bold shadow-sm">
                            {sub.username || "Unknown User"}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-bold text-gray-900 dark:text-white">
                          {sub.fullName}
                        </td>
                        <td className="py-3 px-2 text-xs text-gray-500 dark:text-purple-300/80 truncate max-w-xs">
                          {sub.email}
                        </td>
                        <td className="py-3 px-2 text-xs font-medium">
                          {sub.phone || "N/A"}
                        </td>
                        <td className="py-3 px-2 font-medium">
                          {sub.gender || "N/A"}
                        </td>
                        <td className="py-3 px-2 text-xs text-gray-500 dark:text-purple-300/80 whitespace-nowrap">
                          {formatDate(sub.dateOfSubmission)}
                        </td>
                        <td className="py-3 px-2 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() =>
                              navigate(`/admin/form-details/${recordId}`)
                            }
                            className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-500/30 transition"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteClick(recordId)}
                            className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-500/30 transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="block md:hidden space-y-3">
              {currentSubmissions.map((sub) => {
                const recordId = sub.id || sub._id;
                return (
                  <div
                    key={recordId}
                    className="p-4 rounded-2xl bg-blue-50/60 dark:bg-[#1b082d]/70 border border-blue-100 dark:border-purple-500/40 shadow-inner space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-linear-to-r from-orange-500 to-pink-600 text-white rounded-lg text-xs font-bold shadow-sm">
                        {sub.username || "Unknown User"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-purple-300/80">
                        {formatDate(sub.dateOfSubmission)}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                        {sub.fullName}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-purple-300/80 truncate">
                        {sub.email || "N/A"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-purple-200 pt-1 border-t border-blue-100 dark:border-purple-500/20">
                      <div>
                        <span className="text-blue-500 dark:text-purple-400">
                          Phone:
                        </span>{" "}
                        {sub.phone || "N/A"}
                      </div>
                      <div>
                        <span className="text-blue-500 dark:text-purple-400">
                          Gender:
                        </span>{" "}
                        {sub.gender || "N/A"}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        onClick={() =>
                          navigate(`/admin/form-details/${recordId}`)
                        }
                        className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-500/30"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteClick(recordId)}
                        className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-500/30"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {filteredSubmissions.length > itemsPerPage && (
        <div className="max-w-7xl mx-auto mt-4 px-2 flex flex-col sm:flex-row justify-between items-center text-gray-900 dark:text-white relative z-10 gap-3">
          <p className="text-xs text-gray-500 dark:text-purple-300/80 text-center sm:text-left">
            Showing {filteredSubmissions.length > 0 ? indexOfFirstItem + 1 : 0}{" "}
            to {Math.min(indexOfLastItem, filteredSubmissions.length)} of{" "}
            {filteredSubmissions.length} entries
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white text-blue-700 border border-blue-200 dark:bg-[#2e1048] dark:text-purple-200 dark:border-purple-500/40 rounded-xl text-xs font-bold hover:bg-blue-50 dark:hover:bg-[#1b082d] transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              Previous
            </button>

            <span className="px-3 py-1.5 bg-white text-gray-900 dark:bg-[#2e1048] dark:text-white rounded-xl text-xs font-bold border border-blue-200 dark:border-purple-500/40 shadow-inner">
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 bg-white text-blue-700 border border-blue-200 dark:bg-[#2e1048] dark:text-purple-200 dark:border-purple-500/40 rounded-xl text-xs font-bold hover:bg-blue-50 dark:hover:bg-[#1b082d] transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
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
                Do you really want to delete this submission? This action cannot
                be undone.
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

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        columns={exportColumns}
        rows={exportRows}
        baseName="user_submissions"
        sheetName="Submissions"
      />
    </div>
  );
}
