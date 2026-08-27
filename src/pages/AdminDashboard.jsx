import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteSubmission, getSubmissions } from "../services/api";
import { toast } from "react-toastify";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [submissions, setSubmissions] = useState([]);
  const [success, setSuccess] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

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
  const handleDeleteClick= async (id) => {
     setDeleteId(id);
     setShowConfirm(true);
   };
    const confirmDelete = async () => {
       try {
         await deleteSubmission(deleteId);
         fetchAllSubmissions();
         toast.success('Submission deleted successfully.');
       } catch (err) {
         toast.error('Failed to delete submission.');
       } finally {
         setShowConfirm(false);
         setDeleteId(null);
       }
   };

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.info("User logged out successfully!")
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full bg-[#1a0b2e] px-6 py-8 relative overflow-hidden text-white">
      
      
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/35 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center bg-[#28133f] p-6 rounded-3xl shadow-xl mb-6 border border-purple-900/50 relative z-10">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-extrabold text-white">
            Admin Control Panel
          </h1>
          <p className="text-sm text-purple-200/70">
            Logged in as Administrator:{" "}
            <span className="font-bold text-white">
              {currentUser?.username}
            </span>
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl font-bold text-sm hover:bg-red-500/30 transition duration-200"
        >
          Logout
        </button>
      </div>

      
      <div className="max-w-7xl mx-auto bg-[#28133f] p-6 rounded-3xl shadow-xl border border-purple-900/50 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">
            All User Submissions
          </h2>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold">
            Total Records: {submissions.length}
          </span>
        </div>

        {submissions.length === 0 ? (
          <p className="text-purple-200/70 text-sm">
            No submissions found from any users yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-900/50 text-xs font-bold text-purple-300 uppercase">
                  <th className="pb-3 px-2">Submitted By (User)</th>
                  <th className="pb-3 px-2">Full Name / Email</th>
                  <th className="pb-3 px-2">Phone No./ Address</th>
                  <th className="pb-3 px-2">Dept / Desig</th>
                  <th className="pb-3 px-2">Description</th>
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30 text-sm text-white">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-purple-900/20 transition">
                    <td className="py-3 px-2">
                      <span className="px-2.5 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold shadow-sm">
                        {sub.username || "Unknown User"}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-bold">{sub.fullName}</div>
                      <div className="text-xs text-purple-200/70">{sub.email}</div>
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
                    <td className="py-3 px-2 text-xs text-purple-200/70 max-w-37.5 truncate">
                      {sub.description || "No remarks"}
                    </td>
                    <td className="py-3 px-2 text-xs text-purple-200/70">
                      {sub.dateOfSubmission
                        ? sub.dateOfSubmission.split("-").reverse().join("/")
                        : "N/A"}
                    </td>
                    <td className="py-3 px-2 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() =>
                          navigate(`/admin/form-details/${sub.id}`)
                        }
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold hover:bg-blue-500/30 transition"
                      >
                        View
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
            <h3 className="text-lg font-extrabold text-white mb-2">Are you sure?</h3>
            <p className="text-xs text-purple-200/70 mb-6">Do you really want to delete this submission? This action cannot be undone.</p>
            
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