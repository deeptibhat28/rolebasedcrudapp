import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteSubmission, getSubmissions } from "../services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      setError("Failed to fetch all submissions.");
    }
  };
  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this user submission?")
    ) {
      try {
        await deleteSubmission(id);
        fetchAllSubmissions();
        setSuccess("Submission deleted successfully by admin.");
      } catch (err) {
        setError("Failed to delete submission.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#ebd5e2] to-[#cbb2d4] p-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center bg-white p-6 rounded-3xl shadow-xl mb-6 border border-white/55">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2a1a33]">
            Admin Control Panel
          </h1>
          <p className="text-sm text-[#7a5a8c]">
            Logged in as Administrator:{" "}
            <span className="font-bold text-[#2a1a33]">
              {currentUser?.username}
            </span>
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2.5 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 transition duration-200"
        >
          Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto bg-white p-6 rounded-3xl shadow-xl border border-white/55">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-[#2a1a33]">
            All User Submissions
          </h2>
          <span className="px-3 py-1 bg-purple-50 text-[#7a5a8c] rounded-xl text-xs font-bold">
            Total Records: {submissions.length}
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs rounded-xl">
            {success}
          </div>
        )}

        {submissions.length === 0 ? (
          <p className="text-[#7a5a8c] text-sm">
            No submissions found from any users yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-[#7a5a8c] uppercase">
                  <th className="pb-3 px-2">Submitted By (User)</th>
                  <th className="pb-3 px-2">Full Name / Email</th>
                  <th className="pb-3 px-2">Phone No./ Address</th>
                  <th className="pb-3 px-2">Dept / Desig</th>
                  <th className="pb-3 px-2">Description</th>
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-[#2a1a33]">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#faf7fa]/50">
                    <td className="py-3 px-2">
                      <span className="px-2.5 py-1 bg-[#2a1a33] text-white rounded-lg text-xs font-bold">
                        {sub.username || "Unknown User"}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-bold">{sub.fullName}</div>
                      <div className="text-xs text-[#7a5a8c]">{sub.email}</div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-xs font-medium">
                        {sub.phone || "N/A"}
                      </div>
                      <div className="text-xs text-[#7a5a8c]">
                        {sub.address || "N/A"}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-medium">{sub.department}</div>
                      <div className="text-xs text-[#7a5a8c]">
                        {sub.designation}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-xs text-[#7a5a8c] max-w-37.5 truncate">
                      {sub.description || "No remarks"}
                    </td>
                    <td className="py-3 px-2 text-xs text-[#7a5a8c]">
                      {sub.dateOfSubmission
                        ? sub.dateOfSubmission.split("-").reverse().join("/")
                        : "N/A"}
                    </td>
                    <td className="py-3 px-2 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() =>
                          navigate(`/admin/form-details/${sub.id}`)
                        }
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition"
                      >
                        View
                      </button>

                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition"
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
  );
}
