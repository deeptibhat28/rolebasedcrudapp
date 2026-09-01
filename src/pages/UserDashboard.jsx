import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSubmissions, deleteSubmission } from "../services/api";
import { toast } from "react-toastify";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user") || localStorage.getItem("currentUser")),
  );

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleDeleteClick = async (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };
  const confirmDelete = async () => {
    try {
      await deleteSubmission(deleteId);
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
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn")
    toast.success("User logged out successfully!");
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full bg-[#1a0b2e] px-4 py-8 relative overflow-hidden text-white">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/35 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-[92%] max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center bg-[#28133f] p-6 rounded-3xl shadow-xl mb-6 border border-purple-900/50 z-10 relative">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-extrabold text-white">User Dashboard</h1>
          <p className="text-sm text-purple-200/70">
            Welcome{" "}
            <span className="font-semibold text-xl text-white">
              {currentUser?.username}
            </span>
          </p>
        </div>
        <div className="space-x-3">
          <button
            onClick={() => navigate("/create-form")}
            className="px-4 py-2.5 bg-linear-to-r from-red-500 to-orange-500 hover:opacity-95 text-white rounded-xl font-bold text-sm transition duration-200 shadow-lg"
          >
            Create New Form
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl font-bold text-sm hover:bg-red-500/30 transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="w-[92%] max-w-7xl mx-auto bg-[#28133f] p-6 rounded-3xl shadow-xl border border-purple-900/50 z-10 relative">
        <h2 className="text-lg font-bold text-white mb-4">My Submissions</h2>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {submissions.length === 0 ? (
          <p className="text-purple-200/70 text-sm">
            You haven't added any submissions yet. Click "Create New Form" to
            get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-900/50 text-xs font-bold text-purple-300 uppercase">
                  <th className="pb-3 px-2">Name / Email</th>
                  <th className="pb-3 px-2">Phone / Address</th>
                  <th className="pb-3 px-2">Dept / Desig</th>
                  <th className="pb-3 px-2">Gender / Education</th>
                  <th className="pb-3 px-2">Desc</th>
                  <th className="pb-3 px-2">Skills</th>
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30 text-sm text-white">
                {submissions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-purple-900/20 transition"
                  >
                    <td className="py-3 px-2">
                      <div className="font-bold">{sub.fullName}</div>
                      <div className="text-xs text-purple-200/70">
                        {sub.email}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-xs font-medium">
                        {sub.phone || "N/A"}
                      </div>
                      <div className="text-xs text-purple-200/70">
                        {sub.address || "N/A"}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-medium">{sub.department}</div>
                      <div className="text-xs text-purple-200/70">
                        {sub.designation}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-medium">{sub.gender || "N/A"}</div>
                      <div className="text-xs text-purple-200/70">
                        {sub.education === "Other"
                          ? sub.customEducation
                          : sub.education || "N/A"}
                      </div>
                    </td>
                    <td 
                      className="py-3 px-2 text-xs text-purple-200/70 max-w-37.5 truncate" 
                      title={sub.description || "No remarks provided"}
                    >
                      {sub.description || "No remarks provided"}
                    </td>
                    <td className="py-3 px-2">
                      <div 
                        className="text-xs text-purple-200 max-w-xs truncate" 
                        title={Array.isArray(sub.skills) ? sub.skills.join(", ") : sub.skills}
                      >
                        {Array.isArray(sub.skills)
                          ? sub.skills.join(", ")
                          : sub.skills || "N/A"}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-xs text-purple-200/70">
                      {sub.dateOfSubmission
                        ? sub.dateOfSubmission.split("-").reverse().join("/")
                        : "N/A"}
                    </td>
                    <td className="py-3 px-2 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/view-form/${sub.id}`)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold hover:bg-blue-500/30 transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/edit-form/${sub.id}`)}
                        className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold hover:bg-purple-500/30 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(sub.id)}
                        className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-500/30 transition"
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

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-xs z-50 px-4">
          <div className="bg-[#28133f] p-6 rounded-3xl shadow-2xl max-w-sm w-full border border-purple-900 text-center">
            <h3 className="text-lg font-extrabold text-white mb-2">
              Are you sure?
            </h3>
            <p className="text-xs text-purple-200/70 mb-6">
              Do you really want to delete this submission? This action cannot
              be undone.
            </p>

            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-md"
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
