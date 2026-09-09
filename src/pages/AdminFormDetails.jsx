import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSubmissions } from "../services/api";
import { toast } from "react-toastify";

export default function AdminFormDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    fetchSubmissionDetails();
  }, [id]);

  const fetchSubmissionDetails = async () => {
    try {
      const data = await getSubmissions();
      const currentSub = data.find(
        (sub) => String(sub.id || sub._id) === String(id)
      );
      if (currentSub) {
        setSubmission(currentSub);
      } else {
        toast.error("Submission not found.");
      }
    } catch (err) {
      toast.error("Failed to load submission details.");
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-[#240b3b] px-6 py-8 relative overflow-hidden text-white font-sans"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 30%, rgba(105, 30, 150, 0.45) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(190, 40, 110, 0.35) 0%, transparent 50%), #240b3b",
      }}
    >
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Full-Width Header Panel */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center bg-[#2e1048]/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl mb-6 border border-purple-500/30 relative z-10">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-extrabold text-white tracking-wide">
            Admin Form Details
          </h1>
          <p className="text-sm text-purple-300/80 mt-0.5">
            Complete details of user submission
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="px-4 py-2.5 bg-[#1b082d]/70 text-purple-200 border border-purple-500/40 rounded-xl font-bold text-sm hover:bg-[#1b082d] transition duration-200 shadow-md"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Full-Width Content Container */}
      <div className="max-w-7xl mx-auto bg-[#2e1048]/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-purple-500/30 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          
          {/* Submitted By User */}
          <div className="md:col-span-2 bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 flex justify-between items-center shadow-inner">
            <span className="text-xs font-semibold text-purple-300/80 uppercase tracking-widest">
              Submitted By User
            </span>
            <span className="px-3.5 py-1 bg-linear-to-r from-orange-500 to-pink-600 text-white rounded-xl text-xs font-bold shadow-sm">
              {submission?.username || "Unknown User"}
            </span>
          </div>

          {/* Full Name */}
          <div className="md:col-span-2 bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <span className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1">
              Full Name
            </span>
            <p className="font-bold text-white text-base">
              {submission?.fullName || "N/A"}
            </p>
          </div>

          {/* Email */}
          <div className="bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <span className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1">
              Email
            </span>
            <p className="font-medium text-purple-100 truncate">
              {submission?.email || "N/A"}
            </p>
          </div>

          {/* Phone */}
          <div className="bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <span className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1">
              Phone
            </span>
            <p className="font-medium text-purple-100">
              {submission?.phone || "N/A"}
            </p>
          </div>

          {/* Department */}
          <div className="bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <span className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1">
              Department
            </span>
            <p className="font-medium text-purple-100">
              {submission?.department || "N/A"}
            </p>
          </div>

          {/* Designation */}
          <div className="bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <span className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1">
              Designation
            </span>
            <p className="font-medium text-purple-100">
              {submission?.designation || "N/A"}
            </p>
          </div>

          {/* Gender */}
          <div className="bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <span className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1">
              Gender
            </span>
            <p className="font-medium text-purple-100">
              {submission?.gender || "N/A"}
            </p>
          </div>

          {/* Education */}
          <div className="bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <span className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1">
              Education
            </span>
            <p className="font-medium text-purple-100">
              {submission?.education === "Other"
                ? submission?.customEducation
                : submission?.education || "N/A"}
            </p>
          </div>

          {/* Skills */}
          <div className="md:col-span-2 bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <span className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1">
              Skills
            </span>
            <p className="font-medium text-purple-100">
              {Array.isArray(submission?.skills)
                ? submission.skills.join(", ")
                : submission?.skills || "N/A"}
            </p>
          </div>

          {/* Address */}
          <div className="md:col-span-2 bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <span className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1">
              Address
            </span>
            <p className="font-medium text-purple-100 whitespace-pre-wrap">
              {submission?.address || "N/A"}
            </p>
          </div>

          {/* Description */}
          <div className="md:col-span-2 bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <span className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1">
              Description
            </span>
            <p className="font-medium text-purple-100 whitespace-pre-wrap">
              {submission?.description || "No remarks provided"}
            </p>
          </div>

          {/* Date of Submission */}
          <div className="md:col-span-2 bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <span className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1">
              Date of Submission
            </span>
            <p className="font-medium text-purple-100">
              {submission?.dateOfSubmission
                ? submission.dateOfSubmission.split("-").reverse().join("/")
                : "N/A"}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}