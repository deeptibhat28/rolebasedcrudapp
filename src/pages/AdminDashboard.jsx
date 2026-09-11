import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getSubmissions, getUsers } from "../services/api";
import { toast } from "react-toastify";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

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
      className={`bg-linear-to-br from-purple-700/60 to-purple-900/60 border border-purple-500/30 rounded-2xl p-5 shadow-lg transition duration-200 ${
        onClick
          ? "cursor-pointer hover:border-purple-400/60 hover:from-purple-700/80 hover:to-purple-900/80 hover:-translate-y-0.5"
          : ""
      }`}
    >
      <p className="text-xs text-purple-300/80 uppercase tracking-wide font-bold">{label}</p>
      <p className="text-3xl font-extrabold text-white mt-2">{value}</p>
    </div>
  );
}

function UsersModal({ users, onClose }) {
  const [visibleCount, setVisibleCount] = useState(15);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      setVisibleCount((prev) => Math.min(prev + 15, users.length));
    }
  };

  const visibleUsers = users.slice(0, visibleCount);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-[#2e1048] border border-purple-500/30 rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-purple-500/30">
          <h3 className="text-lg font-extrabold text-white">Total Users ({users.length})</h3>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white text-xl leading-none px-2"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-y-auto p-5 space-y-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#2e1048] [&::-webkit-scrollbar-thumb]:bg-purple-900/60 [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          {users.length === 0 ? (
            <p className="text-purple-300/70 text-sm">No users found.</p>
          ) : (
            <>
              {visibleUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between bg-[#1b082d]/70 border border-purple-500/20 rounded-xl px-4 py-2.5"
                >
                  <span className="text-white font-semibold text-sm">{u.username}</span>
                  {u.email && (
                    <span className="text-purple-300/70 text-xs">{u.email}</span>
                  )}
                </div>
              ))}
              {visibleCount < users.length && (
                <p className="text-center text-purple-400/60 text-xs py-2">
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

function formatDisplayDate(isoDate) {
  const [, month, day] = isoDate.split("-");
  return `${day}/${month}`;
}

function getSubmissionsByDate(submissions) {
  const counts = {};
  submissions.forEach((sub) => {
    if (!sub.dateOfSubmission) return;
    counts[sub.dateOfSubmission] = (counts[sub.dateOfSubmission] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort(
    (a, b) => new Date(a[0]) - new Date(b[0])
  );

  return {
    labels: sorted.map(([date]) => formatDisplayDate(date)),
    datasets: [
      {
        label: "Submissions",
        data: sorted.map(([, count]) => count),
        borderColor: "#f0995f",
        backgroundColor: "rgba(240,153,95,0.15)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#f0995f",
        pointRadius: 5,
      },
    ],
  };
}

function getGenderDistribution(submissions) {
  const counts = {};
  submissions.forEach((sub) => {
    const g = sub.gender || "Unknown";
    counts[g] = (counts[g] || 0) + 1;
  });
  const entries = Object.entries(counts);
  return {
    labels: entries.map(([name]) => name),
    datasets: [
      {
        data: entries.map(([, value]) => value),
        backgroundColor: ["#e0723c", "#c94f82", "#7f77dd", "#888780"],
        borderColor: "#2e1048",
        borderWidth: 2,
      },
    ],
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [showUsersModal, setShowUsersModal] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/");
    } else {
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [subsData, usersData] = await Promise.all([
        getSubmissions(),
        getUsers(),
      ]);
      setSubmissions(subsData.reverse());
      setUsers(usersData);
    } catch (err) {
      toast.error("Failed to fetch dashboard data.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("User logged out successfully!");
    navigate("/");
  };

  const nonAdminUsers = users.filter((u) => {
    return u && u.id && u.username && u.role !== "admin";
  });
  const totalSubmissions = submissions.length;
  const totalUsers = nonAdminUsers.length;

  const todayStr = new Date().toISOString().split("T")[0];
  const submissionsToday = submissions.filter(
    (sub) => sub.dateOfSubmission === todayStr
  ).length;

  const lineData = getSubmissionsByDate(submissions);
  const pieData = getGenderDistribution(submissions);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: "#c9b8e8" }, grid: { display: false } },
      y: {
        ticks: { color: "#c9b8e8", stepSize: 1, precision: 0 },
        grid: { color: "rgba(255,255,255,0.08)" },
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "#e8dcf7" } } },
  };

  return (
    <div
      className="min-h-screen w-full bg-[#240b3b] px-4 sm:px-6 py-6 sm:py-8 relative overflow-hidden text-white font-sans"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 30%, rgba(105, 30, 150, 0.45) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(190, 40, 110, 0.35) 0%, transparent 50%), #240b3b",
      }}
    >
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#2e1048]/95 backdrop-blur-md p-5 sm:p-6 rounded-3xl shadow-2xl mb-6 border border-purple-500/30 relative z-10 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide">
            Admin Control Panel
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80 mt-0.5">
            Logged in as Administrator:{" "}
            <span className="font-semibold text-base sm:text-lg text-orange-400">{currentUser?.username}</span>
          </p>
        </div>

        <div className="space-x-2 sm:space-x-3 flex items-center w-full sm:w-auto justify-end">
          <button
            onClick={() => navigate("/admin-submissions")}
            className="px-4 py-2 bg-[#1b082d]/70 text-purple-200 border border-purple-500/40 rounded-xl font-bold text-xs sm:text-sm hover:bg-[#1b082d] transition duration-200 shadow-md"
          >
            All Submissions
          </button>
          <button
            onClick={() => navigate("/activity-logs")}
            className="px-4 py-2 bg-[#1b082d]/70 text-purple-200 border border-purple-500/40 rounded-xl font-bold text-xs sm:text-sm hover:bg-[#1b082d] transition duration-200 shadow-md"
          >
            Activity Logs
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold text-xs sm:text-sm hover:bg-red-500/30 transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 relative z-10">
        <StatCard
          label="Total Users"
          value={totalUsers}
          onClick={() => setShowUsersModal(true)}
        />
        <StatCard
          label="Total Submissions"
          value={totalSubmissions}
          onClick={() => navigate("/admin-submissions")}
        />
        <StatCard
          label="Submissions Today"
          value={submissionsToday}
          onClick={() => navigate("/admin-submissions?date=today")}
        />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        <div className="bg-[#2e1048]/95 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-purple-500/30">
          <h3 className="text-sm font-bold text-white mb-3">Submissions Over Time</h3>
          <div className="relative h-56">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-[#2e1048]/95 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-purple-500/30">
          <h3 className="text-sm font-bold text-white mb-3">Gender Distribution</h3>
          <div className="relative h-56">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>

      {showUsersModal && (
        <UsersModal users={nonAdminUsers} onClose={() => setShowUsersModal(false)} />
      )}
    </div>
  );
}