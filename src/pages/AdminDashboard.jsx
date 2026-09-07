import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteSubmission, getSubmissions } from "../services/api";
import { toast } from "react-toastify";
import { logActivity } from "../utils/logger";


export default function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [submissions, setSubmissions] = useState([]);
  const [success, setSuccess] = useState("");

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
      setSubmissions(data);
    } catch (err) {
      toast.error("Failed to fetch all submissions.");
    }
  };
  const handleDeleteClick = async (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };
  const confirmDelete = async () => {
    try {
      const targetSub = submissions.find((sub) => sub.id === deleteId);
      const subName = targetSub ? targetSub.fullName : `ID: ${deleteId}`;

      await deleteSubmission(deleteId);

      logActivity(
        "FORM_DELETE",
        `Deleted form submission for: ${subName}`,
        currentUser?.username || "Admin",
      );

      fetchAllSubmissions();
      toast.success("Submission deleted successfully.");
    } catch (err) {
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
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

  return (
    <div className="min-h-screen w-full bg-[#F9B2BC] px-6 py-8 relative overflow-hidden text-[#4a242c]">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#F67C8E]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center bg-[#FCD3DC] backdrop-blur-md p-6 rounded-3xl shadow-xl mb-6 border border-white/60 relative z-10">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-extrabold text-[#4a242c]">
            Admin Control Panel
          </h1>
          <p className="text-sm text-[#68333e]/80">
            Logged in as Administrator:{" "}
            <span className="font-bold text-[#4a242c]">
              {currentUser?.username}
            </span>
          </p>
        </div>

        <div className="space-x-3 flex items-center">
          <button
            onClick={() => navigate("/activity-logs")}
            className="px-4 py-2.5 bg-[#F6B8C2]/50 text-[#5c2d36] border border-[#D58C99] rounded-xl font-bold text-sm hover:bg-[#F6B8C2] transition duration-200 shadow-md"
          >
            Activity Logs
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 bg-red-500/20 text-red-700 border border-red-500/30 rounded-xl font-bold text-sm hover:bg-red-500/30 transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-[#FCD3DC] backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/60 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#4a242c]">
              All User Submissions
            </h2>
            <p className="text-xs text-[#68333e]/80">
              Manage and search user form entries
            </p>
          </div>

          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search by username, name, email"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 bg-[#F6B8C2]/40 border border-[#D58C99] rounded-xl text-xs text-[#4a242c] placeholder-[#8C4A56] focus:outline-none focus:ring-2 focus:ring-[#F45B73] transition"
            />
          </div>

          <span className="px-3 py-1 bg-[#F6B8C2]/50 text-[#5c2d36] border border-[#D58C99] rounded-xl text-xs font-bold whitespace-nowrap">
            Total Records: {filteredSubmissions.length}{" "}
            {searchTerm && `(filtered from ${submissions.length})`}
          </span>
        </div>

        {submissions.length === 0 ? (
          <p className="text-[#68333e]/80 text-sm">
            No submissions found from any users yet.
          </p>
        ) : filteredSubmissions.length === 0 ? (
          <p className="text-[#68333e]/80 text-sm text-center py-6">
            No matching submissions found for "{searchTerm}".
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D58C99] text-xs font-bold text-[#5c2d36] uppercase">
                  <th className="pb-3 px-2">Submitted By (User)</th>
                  <th className="pb-3 px-2">Full Name</th>
                  <th className="pb-3 px-2">Email</th>
                  <th className="pb-3 px-2">Phone</th>
                  <th className="pb-3 px-2">Gender</th>
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2 text-right pr-12">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D58C99]/50 text-sm text-[#4a242c]">
                {currentSubmissions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-[#F6B8C2]/30 transition"
                  >
                    <td className="py-3 px-2">
                      <span className="px-2.5 py-1 bg-[#F45B73] text-white rounded-lg text-xs font-bold shadow-sm">
                        {sub.username || "Unknown User"}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-bold">{sub.fullName}</div>
                    </td>
                    <td>
                      <div className="text-xs text-[#68333e]/80">
                        {sub.email}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-xs font-medium">
                        {sub.phone || "N/A"}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-medium">{sub.gender || "N/A"}</div>
                    </td>
                    <td className="py-3 px-2 text-xs text-[#68333e]/80">
                      {sub.dateOfSubmission
                        ? sub.dateOfSubmission.split("-").reverse().join("/")
                        : "N/A"}
                    </td>
                    <td className="py-3 px-2 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() =>
                          navigate(`/admin/form-details/${sub.id}`)
                        }
                        className="px-3 py-1 bg-blue-500/20 text-blue-800 border border-blue-500/30 rounded-xl text-xs font-bold hover:bg-blue-500/30 transition"
                      >
                        View
                      </button>

                      <button
                        onClick={() => handleDeleteClick(sub.id)}
                        className="px-3 py-1 bg-red-500/20 text-red-700 border border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-500/30 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredSubmissions.length > itemsPerPage && (
        <div className="max-w-7xl mx-auto mt-4 px-2 flex justify-between items-center text-[#4a242c] relative z-10">
          <p className="text-xs text-[#68333e]/80">
            Showing {filteredSubmissions.length > 0 ? indexOfFirstItem + 1 : 0}{" "}
            to {Math.min(indexOfLastItem, filteredSubmissions.length)} of{" "}
            {filteredSubmissions.length} entries
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-[#F6B8C2]/50 text-[#5c2d36] border border-[#D58C99] rounded-xl text-xs font-bold hover:bg-[#F6B8C2] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="px-3 py-1.5 bg-[#FCD3DC] text-[#4a242c] rounded-xl text-xs font-bold border border-[#D58C99]">
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 bg-[#F6B8C2]/50 text-[#5c2d36] border border-[#D58C99] rounded-xl text-xs font-bold hover:bg-[#F6B8C2] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xs z-50 px-4">
          <div className="bg-[#FCD3DC] p-6 rounded-3xl shadow-2xl max-w-sm w-full border border-white/60 text-center">
            <h3 className="text-lg font-extrabold text-[#4a242c] mb-2">
              Are you sure?
            </h3>
            <p className="text-xs text-[#68333e]/80 mb-6">
              Do you really want to delete this submission? This action cannot
              be undone.
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
        </div>
      )}
    </div>
  );
}