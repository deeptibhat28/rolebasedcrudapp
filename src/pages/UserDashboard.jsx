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
    <div className="min-h-screen w-full bg-[#F9B2BC] px-4 py-8 relative overflow-hidden text-[#4a242c]">
     
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#F67C8E]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div
        className={`transition-all duration-300 ${
          showConfirm ? "filter blur-sm pointer-events-none select-none" : ""
        }`}
      >
       
        <div className="w-[92%] max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center bg-[#FCD3DC] backdrop-blur-md p-6 rounded-3xl shadow-xl mb-6 border border-white/60 z-10 relative">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-extrabold text-[#4a242c]">
              User Dashboard
            </h1>
            <p className="text-sm text-[#68333e] font-medium">
              Welcome: {" "}
              <span className="font-semibold text-xl text-[#4a242c]">
                {currentUser?.username}
              </span>
            </p>
          </div>
          <div className="space-x-3">
            <button
              onClick={() => navigate("/create-form")}
              className="px-4 py-2.5 bg-[#F45B73] hover:bg-[#E04860] text-white rounded-xl font-bold text-sm transition duration-200 shadow-md"
            >
              Create New Form
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-red-500/15 text-red-700 border border-red-400/40 rounded-xl font-bold text-sm hover:bg-red-500/25 transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        
        <div className="w-[92%] max-w-7xl mx-auto bg-[#FCD3DC] backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/60 z-10 relative">
          <h2 className="text-lg font-bold text-[#4a242c] mb-4">
            My Submissions
          </h2>

          {error && (
            <p className="text-red-600 text-sm mb-4 font-medium">{error}</p>
          )}

          {submissions.length === 0 ? (
            <p className="text-[#68333e] text-sm font-medium">
              You haven't added any submissions yet. Click "Create New Form" to
              get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/60 text-xs font-bold text-[#5c2d36] uppercase">
                    <th className="pb-3 px-2">Name</th>
                    <th className="pb-3 px-2">Email</th>
                    <th className="pb-3 px-2">Phone</th>
                    <th className="pb-3 px-2">Gender</th>
                    <th className="pb-3 px-2">Date</th>
                    <th className="pb-3 px-2 text-right pr-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40 text-sm text-[#4a242c]">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-white/30 transition">
                      <td className="py-3 px-2">
                        <div className="font-bold text-[#4a242c]">
                          {sub.fullName}
                        </div>
                      </td>
                      <td>
                        <div className="text-xs text-[#68333e] font-medium">
                          {sub.email}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-xs font-medium text-[#68333e]">
                          {sub.phone || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-medium text-[#4a242c]">
                          {sub.gender || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-xs text-[#68333e] font-medium">
                        {sub.dateOfSubmission
                          ? sub.dateOfSubmission.split("-").reverse().join("/")
                          : "N/A"}
                      </td>
                      <td className="py-3 px-2 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleViewClick(sub)}
                          className="px-3 py-1 bg-sky-500/20 text-sky-900 border border-sky-400/40 rounded-xl text-xs font-bold hover:bg-sky-500/35 transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/edit-form/${sub.id}`)}
                          className="px-3 py-1 bg-white/50 text-[#4a242c] border border-white/80 rounded-xl text-xs font-bold hover:bg-white/80 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(sub.id)}
                          className="px-3 py-1 bg-red-500/15 text-red-700 border border-red-400/40 rounded-xl text-xs font-bold hover:bg-red-500/25 transition"
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 px-4">
          <div className="bg-[#FCD3DC] backdrop-blur-md p-6 rounded-3xl shadow-2xl max-w-sm w-full border border-white/80 text-center">
            <h3 className="text-lg font-extrabold text-[#4a242c] mb-2">
              Are you sure?
            </h3>
            <p className="text-xs text-[#68333e] mb-6 font-medium">
              Do you really want to delete this submission? This action cannot
              be undone.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-white/60 hover:bg-white text-[#4a242c] border border-[#E899A4]/50 rounded-xl text-xs font-bold transition"
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