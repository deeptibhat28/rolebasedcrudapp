import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { deleteSubmission, getSubmissions } from "../services/api";
import { toast } from "react-toastify";
import { logActivity } from "../utils/logger";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [submissions, setSubmissions] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/");
    } else {
      fetchAllSubmissions();
    }
  }, []);

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
        (sub) => String(sub.id || sub._id) === String(deleteId)
      );
      
      const actualId = targetSub ? (targetSub.id || targetSub._id) : deleteId;
      const subName = targetSub ? targetSub.fullName : `ID: ${actualId}`;

      await deleteSubmission(actualId);

      logActivity(
        "FORM_DELETE",
        `Deleted form submission for: ${subName}`,
        currentUser?.username || "Admin"
      );

      setSubmissions((prev) =>
        prev.filter((sub) => String(sub.id || sub._id) !== String(actualId))
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
    localStorage.removeItem("user");
    toast.success("User logged out successfully!");
    navigate("/");
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const term = searchTerm.toLowerCase();
    const username = (sub.username || "").toLowerCase();
    const fullName = (sub.fullName || "").toLowerCase();
    const email = (sub.email || "").toLowerCase();
    const department = (sub.department || "").toLowerCase();

    return (
      username.includes(term) ||
      fullName.includes(term) ||
      email.includes(term) ||
      department.includes(term)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSubmissions = filteredSubmissions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

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

      <div className="max-w-7xl mx-auto bg-[#2e1048]/95 backdrop-blur-md p-4 sm:p-6 rounded-3xl shadow-2xl border border-purple-500/30 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">All User Submissions</h2>
            <p className="text-xs text-purple-300/80">
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
                className="w-full px-4 py-2 bg-[#1b082d]/70 border border-purple-500/40 rounded-xl text-xs text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner transition"
              />
            </div>

            <span className="px-3 py-2 bg-[#1b082d]/70 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold text-center whitespace-nowrap shadow-inner">
              Total: {filteredSubmissions.length}
            </span>
          </div>
        </div>

        {submissions.length === 0 ? (
          <p className="text-purple-300/80 text-sm py-6 text-center">
            No submissions found from any users yet.
          </p>
        ) : filteredSubmissions.length === 0 ? (
          <p className="text-purple-300/80 text-sm text-center py-6">
            No matching submissions found for "{searchTerm}".
          </p>
        ) : (
          <>
          
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-purple-500/30 text-xs font-bold text-purple-300 uppercase tracking-wider">
                    <th className="pb-3 px-2">Submitted By</th>
                    <th className="pb-3 px-2">Full Name</th>
                    <th className="pb-3 px-2">Email</th>
                    <th className="pb-3 px-2">Phone</th>
                    <th className="pb-3 px-2">Gender</th>
                    <th className="pb-3 px-2">Date</th>
                    <th className="pb-3 px-2 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/20 text-sm text-purple-100">
                  {currentSubmissions.map((sub) => {
                    const recordId = sub.id || sub._id;
                    return (
                      <tr
                        key={recordId}
                        className="hover:bg-purple-900/20 transition"
                      >
                        <td className="py-3 px-2">
                          <span className="px-2.5 py-1 bg-linear-to-r from-orange-500 to-pink-600 text-white rounded-lg text-xs font-bold shadow-sm">
                            {sub.username || "Unknown User"}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-bold text-white">{sub.fullName}</td>
                        <td className="py-3 px-2 text-xs text-purple-300/80 truncate max-w-xs">{sub.email}</td>
                        <td className="py-3 px-2 text-xs font-medium">{sub.phone || "N/A"}</td>
                        <td className="py-3 px-2 font-medium">{sub.gender || "N/A"}</td>
                        <td className="py-3 px-2 text-xs text-purple-300/80 whitespace-nowrap">
                          {sub.dateOfSubmission
                            ? sub.dateOfSubmission.split("-").reverse().join("/")
                            : "N/A"}
                        </td>
                        <td className="py-3 px-2 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/admin/form-details/${recordId}`)}
                            className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold hover:bg-blue-500/30 transition"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteClick(recordId)}
                            className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-500/30 transition"
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
                    className="p-4 rounded-2xl bg-[#1b082d]/70 border border-purple-500/40 shadow-inner space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-linear-to-r from-orange-500 to-pink-600 text-white rounded-lg text-xs font-bold shadow-sm">
                        {sub.username || "Unknown User"}
                      </span>
                      <span className="text-xs text-purple-300/80">
                        {sub.dateOfSubmission
                          ? sub.dateOfSubmission.split("-").reverse().join("/")
                          : "N/A"}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-sm">{sub.fullName}</h3>
                      <p className="text-xs text-purple-300/80 truncate">{sub.email || "N/A"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-purple-200 pt-1 border-t border-purple-500/20">
                      <div><span className="text-purple-400">Phone:</span> {sub.phone || "N/A"}</div>
                      <div><span className="text-purple-400">Gender:</span> {sub.gender || "N/A"}</div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        onClick={() => navigate(`/admin/form-details/${recordId}`)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold hover:bg-blue-500/30"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteClick(recordId)}
                        className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-500/30"
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

      {/* Pagination Controls */}
      {filteredSubmissions.length > itemsPerPage && (
        <div className="max-w-7xl mx-auto mt-4 px-2 flex flex-col sm:flex-row justify-between items-center text-white relative z-10 gap-3">
          <p className="text-xs text-purple-300/80 text-center sm:text-left">
            Showing {filteredSubmissions.length > 0 ? indexOfFirstItem + 1 : 0}{" "}
            to {Math.min(indexOfLastItem, filteredSubmissions.length)} of{" "}
            {filteredSubmissions.length} entries
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-[#2e1048] text-purple-200 border border-purple-500/40 rounded-xl text-xs font-bold hover:bg-[#1b082d] transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              Previous
            </button>

            <span className="px-3 py-1.5 bg-[#2e1048] text-white rounded-xl text-xs font-bold border border-purple-500/40 shadow-inner">
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 bg-[#2e1048] text-purple-200 border border-purple-500/40 rounded-xl text-xs font-bold hover:bg-[#1b082d] transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
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
                Do you really want to delete this submission? This action cannot
                be undone.
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