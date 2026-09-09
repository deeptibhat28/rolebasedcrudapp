import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSubmissions, deleteSubmission } from "../services/api";
import { toast } from "react-toastify";
import { logActivity } from "../utils/logger";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(
      localStorage.getItem("user") || localStorage.getItem("currentUser"),
    ),
  );

  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
    } else {
      fetchUserSubmissions();
    }
  }, []);

  const fetchUserSubmissions = async () => {
    try {
      const data = await getSubmissions();
      const userSubs = data.filter(
        (sub) =>
          sub.userId === currentUser.id ||
          sub.username === currentUser.username,
      );
      setSubmissions(userSubs);
    } catch (err) {
      setError("Failed to fetch submissions.");
    }
  };

  const handleViewClick = (sub) => {
    navigate(`/view-form/${sub.id}`, { state: { submission: sub } });
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
        currentUser?.username || "User",
      );
      fetchUserSubmissions();
      toast.success("Submission deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete submission.");
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const handleLogout = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      logActivity(
        "USER_LOGOUT",
        `User ${user.username} logged out of the system.`,
        user.username,
      );
    }
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
    toast.success("User logged out successfully!");
    navigate("/");
  };

  return (
    <div 
      className="min-h-screen w-full bg-[#240b3b] px-4 py-8 relative overflow-hidden text-white font-sans"
      style={{ backgroundImage: "radial-gradient(circle at 20% 30%, rgba(105, 30, 150, 0.45) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(190, 40, 110, 0.35) 0%, transparent 50%), #240b3b" }}
    >
      
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div
        className={`transition-all duration-300 ${
          showConfirm ? "filter blur-sm pointer-events-none select-none" : ""
        }`}
      >
        
        <div className="w-[92%] max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center bg-[#2e1048]/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl mb-6 border border-purple-500/30 z-10 relative">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-extrabold text-white tracking-wide">
              User Dashboard
            </h1>
            <p className="text-sm text-purple-200/70 font-medium mt-1">
              Welcome: {" "}
              <span className="font-semibold text-lg text-orange-400">
                {currentUser?.username}
              </span>
            </p>
          </div>
          <div className="space-x-3">
            <button
              onClick={() => navigate("/create-form")}
              className="px-5 py-2.5 bg-linear-to-r from-orange-500 to-pink-600 hover:opacity-95 text-white rounded-xl font-bold text-sm transition duration-200 shadow-lg tracking-wider"
            >
              Create New Form
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-red-500/15 text-red-400 border border-red-500/30 rounded-xl font-bold text-sm hover:bg-red-500/25 transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="w-[92%] max-w-7xl mx-auto bg-[#2e1048]/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-purple-500/30 z-10 relative">
          <h2 className="text-lg font-bold text-white mb-4 tracking-wide">
            My Submissions
          </h2>

          {error && (
            <p className="text-red-400 text-sm mb-4 font-medium">{error}</p>
          )}

          {submissions.length === 0 ? (
            <p className="text-purple-200/70 text-sm font-medium py-4">
              You haven't added any submissions yet. Click "Create New Form" to
              get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-purple-500/30 text-xs font-bold text-purple-300 uppercase tracking-wider">
                    <th className="pb-3 px-3">Name</th>
                    <th className="pb-3 px-3">Email</th>
                    <th className="pb-3 px-3">Phone</th>
                    <th className="pb-3 px-3">Gender</th>
                    <th className="pb-3 px-3">Date</th>
                    <th className="pb-3 px-3 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/20 text-sm text-purple-100">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-purple-900/30 transition">
                      <td className="py-3 px-3 font-bold text-white">
                        {sub.fullName}
                      </td>
                      <td className="py-3 px-3 text-xs text-purple-200/80 font-medium">
                        {sub.email}
                      </td>
                      <td className="py-3 px-3 text-xs font-medium text-purple-200/80">
                        {sub.phone || "N/A"}
                      </td>
                      <td className="py-3 px-3 font-medium text-purple-200">
                        {sub.gender || "N/A"}
                      </td>
                      <td className="py-3 px-3 text-xs text-purple-200/80 font-medium">
                        {sub.dateOfSubmission
                          ? sub.dateOfSubmission.split("-").reverse().join("/")
                          : "N/A"}
                      </td>
                      <td className="py-3 px-3 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleViewClick(sub)}
                          className="px-3 py-1.5 bg-sky-500/20 text-sky-300 border border-sky-500/40 rounded-xl text-xs font-bold hover:bg-sky-500/30 transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/edit-form/${sub.id}`)}
                          className="px-3 py-1.5 bg-purple-500/20 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-bold hover:bg-purple-500/35 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(sub.id)}
                          className="px-3 py-1.5 bg-red-500/20 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold hover:bg-red-500/30 transition"
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
      </div>

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 px-4">
          <div className="bg-[#2e1048] backdrop-blur-md p-6 rounded-3xl shadow-2xl max-w-sm w-full border border-purple-500/40 text-center">
            <h3 className="text-lg font-extrabold text-white mb-2 tracking-wide">
              Are you sure?
            </h3>
            <p className="text-xs text-purple-200/80 mb-6 font-medium">
              Do you really want to delete this submission? This action cannot
              be undone.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-purple-900/50 hover:bg-purple-900 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-linear-to-r from-orange-500 to-pink-600 hover:opacity-95 text-white rounded-xl text-xs font-bold transition shadow-lg tracking-wider"
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