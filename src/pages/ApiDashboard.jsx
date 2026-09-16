import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCountriesData } from "../services/api";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import WorldMap from "../components/WorldMap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const ROWS_PER_PAGE = 20;

const GENDER_COLORS = {
  female: "#e0723c",
  male: "#c94f82",
  other: "#7f77dd",
};

function CustomPieTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  return (
    <div className="bg-[#1e1e2e] text-white text-xs rounded-lg px-3 py-2 shadow-xl flex items-center gap-2 capitalize">
      <span
        className="w-2.5 h-2.5 rounded-sm inline-block"
        style={{ backgroundColor: item.payload.fill }}
      ></span>
      <span className="font-semibold">{item.name}</span>
      <span>{item.value}</span>
    </div>
  );
}

export default function ApiDashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [genderFilter, setGenderFilter] = useState("All");
  const [activeBarIndex, setActiveBarIndex] = useState(null);
  const [activePieIndex, setActivePieIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCountriesData();
        const cleaned = data.map((u, index) => ({
          id: index,
          name: `${u.name?.first || ""} ${u.name?.last || ""}`,
          country: u.location?.country || "N/A",
          gender: u.gender || "N/A",
          age: u.dob?.age || 0,
          nat: u.nat || "",
        }));
        setUsers(cleaned);
      } catch (err) {
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Gender filter (table only)
  const genderOptions = [
    ...new Set(users.map((u) => u.gender).filter(Boolean)),
  ];
  const filteredUsers =
    genderFilter === "All"
      ? users
      : users.filter((u) => u.gender === genderFilter);

  // Charts + map always reflect the FULL dataset
  const countryStats = users.reduce((acc, u) => {
    if (!acc[u.country]) acc[u.country] = { total: 0, genders: {} };
    acc[u.country].total += 1;
    acc[u.country].genders[u.gender] =
      (acc[u.country].genders[u.gender] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(countryStats)
    .map(([country, stats]) => ({ country, count: stats.total }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const genderCounts = users.reduce((acc, u) => {
    acc[u.gender] = (acc[u.gender] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(genderCounts).map(([gender, value]) => ({
    name: gender,
    value,
  }));

  // Theme-aware chart colors
  const barFill = isDark ? "#e0723c" : "#3b82f6";
  const axisTextColor = isDark ? "#c9b8e8" : "#5b7fa6";
  const gridLineColor = isDark
    ? "rgba(255,255,255,0.08)"
    : "rgba(59,130,246,0.08)";
  const legendTextColor = isDark ? "#e8dcf7" : "#3a5a7a";

  const totalPages = Math.ceil(filteredUsers.length / ROWS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const currentRows = filteredUsers.slice(
    startIndex,
    startIndex + ROWS_PER_PAGE,
  );

  return (
    <div
      className="min-h-screen w-full bg-blue-50 dark:bg-[#240b3b] px-4 sm:px-6 py-6 sm:py-8 relative overflow-hidden text-gray-900 dark:text-white font-sans transition-colors duration-200"
      style={
        isDark
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

      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/95 dark:bg-[#2e1048]/95 backdrop-blur-md p-5 sm:p-6 rounded-3xl shadow-2xl mb-6 border-2 border-blue-200 dark:border-purple-500/30 relative z-10 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-wide">
            API Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-purple-300/80 mt-0.5">
            Live data from a third-party API, visualized dynamically.
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
        </div>
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto bg-white/95 dark:bg-[#2e1048]/95 rounded-3xl shadow-2xl p-10 text-center relative z-10 border border-blue-100 dark:border-purple-500/30">
          <p className="text-gray-500 dark:text-purple-300/80 font-semibold">
            Loading data...
          </p>
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto bg-white/95 dark:bg-[#2e1048]/95 rounded-3xl shadow-2xl p-10 text-center relative z-10 border border-red-200 dark:border-red-500/30">
          <p className="text-red-600 dark:text-red-400 font-semibold">
            {error}
          </p>
        </div>
      ) : (
        <>
          {/* Table card */}
          <div className="max-w-7xl mx-auto bg-white/95 dark:bg-[#2e1048]/95 backdrop-blur-md p-4 sm:p-6 rounded-3xl shadow-2xl border border-blue-100 dark:border-purple-500/30 relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  User Records
                </h2>
                <p className="text-xs text-gray-500 dark:text-purple-300/80">
                  Showing user data fetched from the API
                </p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap gap-y-2 w-full sm:w-auto justify-end">
                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-[#1b082d]/70 dark:text-purple-300 dark:border-purple-500/40 rounded-xl text-xs font-bold whitespace-nowrap shadow-inner">
                  Total Records: {users.length}
                </span>
              </div>
            </div>

            {/* Gender filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-4">
              <select
                value={genderFilter}
                onChange={(e) => {
                  setGenderFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-blue-50 border border-blue-200 dark:bg-[#1b082d]/70 dark:border-purple-500/40 rounded-xl text-xs text-gray-700 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-purple-500 shadow-inner [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-[#1b082d] dark:[&>option]:text-white"
              >
                <option value="All">All Genders</option>
                {genderOptions.map((g) => (
                  <option key={g} value={g}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </option>
                ))}
              </select>

              {genderFilter !== "All" && (
                <button
                  onClick={() => {
                    setGenderFilter("All");
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-[#1b082d]/70 dark:text-purple-300 dark:border-purple-500/40 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-[#1b082d] transition whitespace-nowrap"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-blue-100 dark:border-purple-500/30 text-xs font-bold text-blue-600/70 dark:text-purple-300 uppercase tracking-wider">
                    <th className="pb-3 px-3">Name</th>
                    <th className="pb-3 px-3">Country</th>
                    <th className="pb-3 px-3">Gender</th>
                    <th className="pb-3 px-3">Age</th>
                    <th className="pb-3 px-3">Nationality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100 dark:divide-purple-500/20 text-sm text-gray-700 dark:text-purple-100">
                  {currentRows.length > 0 ? (
                    currentRows.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-blue-50/60 dark:hover:bg-purple-900/20 transition"
                      >
                        <td className="py-3 px-3 capitalize">{u.name}</td>
                        <td className="py-3 px-3">{u.country}</td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-1 bg-linear-to-r from-orange-500 to-pink-600 text-white rounded-lg text-xs font-bold capitalize inline-block">
                            {u.gender}
                          </span>
                        </td>
                        <td className="py-3 px-3">{u.age}</td>
                        <td className="py-3 px-3">{u.nat}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 text-center text-gray-500 dark:text-purple-300/80 text-sm"
                      >
                        No records match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredUsers.length > 0 && (
              <div className="mt-4 px-2 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-900 dark:text-white gap-3">
                <p className="text-gray-500 dark:text-purple-300/80 text-center sm:text-left">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + ROWS_PER_PAGE, filteredUsers.length)}{" "}
                  of {filteredUsers.length} entries
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
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
          </div>

          {/* Charts */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 relative z-10">
            <div className="bg-white/95 dark:bg-[#2e1048]/95 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-blue-100 dark:border-purple-500/30">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                Top 10 Countries by User Count
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridLineColor} />
                  <XAxis
                    dataKey="country"
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                    height={70}
                    tick={{ fill: axisTextColor, fontSize: 11 }}
                  />
                  <YAxis tick={{ fill: axisTextColor }} />
                  <Tooltip
                    cursor={false}
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      return (
                        <div className="bg-[#1e1e2e] text-white text-xs rounded-lg px-3 py-2 shadow-xl">
                          <p className="font-semibold mb-0.5">{label}</p>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-sm inline-block"
                              style={{ backgroundColor: barFill }}
                            ></span>
                            <span>Count: {payload[0].value}</span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    onMouseEnter={(_, index) => setActiveBarIndex(index)}
                    onMouseLeave={() => setActiveBarIndex(null)}
                  >
                    {barData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={barFill}
                        style={{
                          filter:
                            activeBarIndex === index
                              ? "brightness(1.25)"
                              : "brightness(1)",
                          cursor: "pointer",
                          transition: "filter 0.15s ease",
                        }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/95 dark:bg-[#2e1048]/95 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-blue-100 dark:border-purple-500/30">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                Gender Distribution
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    onMouseEnter={(_, index) => setActivePieIndex(index)}
                    onMouseLeave={() => setActivePieIndex(null)}
                  >
                    {pieData.map((entry, index) => {
                      const baseColor =
                        GENDER_COLORS[entry.name?.toLowerCase()] || "#888780";
                      const isActive = activePieIndex === index;
                      return (
                        <Cell
                          key={index}
                          fill={baseColor}
                          stroke={isDark ? "#2e1048" : "#ffffff"}
                          strokeWidth={isActive ? 3 : 2}
                          style={{
                            filter: isActive
                              ? "brightness(1.15)"
                              : "brightness(1)",
                            cursor: "pointer",
                            transition: "filter 0.15s ease",
                          }}
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="center"
                    wrapperStyle={{
                      color: legendTextColor,
                      fontSize: 12,
                      paddingBottom: 10,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* World Map */}
          <div className="max-w-7xl mx-auto bg-white/95 dark:bg-[#2e1048]/95 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-blue-100 dark:border-purple-500/30 mt-6 relative z-10">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              Countries Represented in Data
            </h3>
            <WorldMap countryStats={countryStats} />
          </div>
        </>
      )}
    </div>
  );
}
