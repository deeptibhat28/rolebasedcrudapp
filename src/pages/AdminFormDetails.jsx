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
      const currentSub = data.find((sub) => sub.id.toString() === id);
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
    <div className="min-h-screen w-full bg-[#F9B2BC] px-4 py-8 relative overflow-hidden flex items-center justify-center text-[#4a242c]">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#F67C8E]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-[#FCD3DC] backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-lg w-full relative z-10 border border-white/60">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-[#4a242c]">Admin Form</h1>
            <p className="text-xs text-[#68333e]/80">
              Complete details of user
            </p>
          </div>
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="text-xs font-bold text-[#5c2d36] hover:text-[#4a242c] transition"
          >
            Back to Admin Panel
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div className="bg-[#F6B8C2]/40 p-4 rounded-2xl border border-[#D58C99] flex justify-between items-center">
            <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider">
              Submitted By User
            </span>
            <span className="px-3 py-1 bg-[#F45B73] text-white rounded-xl text-xs font-bold shadow-sm">
              {submission?.username || "Unknown User"}
            </span>
          </div>

          <div className="bg-[#F6B8C2]/30 p-4 rounded-2xl border border-[#D58C99]">
            <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
              Full Name
            </span>
            <p className="font-bold text-[#4a242c]">
              {submission?.fullName || "N/A"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F6B8C2]/30 p-4 rounded-2xl border border-[#D58C99]">
              <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
                Email
              </span>
              <p className="font-medium text-[#4a242c] truncate">
                {submission?.email || "N/A"}
              </p>
            </div>
            <div className="bg-[#F6B8C2]/30 p-4 rounded-2xl border border-[#D58C99]">
              <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
                Phone
              </span>
              <p className="font-medium text-[#4a242c]">
                {submission?.phone || "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F6B8C2]/30 p-4 rounded-2xl border border-[#D58C99]">
              <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
                Department
              </span>
              <p className="font-medium text-[#4a242c]">
                {submission?.department || "N/A"}
              </p>
            </div>
            <div className="bg-[#F6B8C2]/30 p-4 rounded-2xl border border-[#D58C99]">
              <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
                Designation
              </span>
              <p className="font-medium text-[#4a242c]">
                {submission?.designation || "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F6B8C2]/30 p-4 rounded-2xl border border-[#D58C99]">
              <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
                Gender
              </span>
              <p className="font-medium text-[#4a242c]">
                {submission?.gender || "N/A"}
              </p>
            </div>
            <div className="bg-[#F6B8C2]/30 p-4 rounded-2xl border border-[#D58C99]">
              <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
                Education
              </span>
              <p className="font-medium text-[#4a242c]">
                {submission?.education === "Other"
                  ? submission?.customEducation
                  : submission?.education || "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-[#F6B8C2]/30 p-4 rounded-2xl border border-[#D58C99]">
            <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
              Skills
            </span>
            <p className="font-medium text-[#4a242c]">
              {Array.isArray(submission?.skills)
                ? submission.skills.join(", ")
                : submission?.skills || "N/A"}
            </p>
          </div>

          <div className="bg-[#F6B8C2]/30 p-4 rounded-2xl border border-[#D58C99]">
            <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
              Address
            </span>
            <p className="font-medium text-[#4a242c]">
              {submission?.address || "N/A"}
            </p>
          </div>

          <div className="bg-[#F6B8C2]/30 p-4 rounded-2xl border border-[#D58C99]">
            <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
              Description
            </span>
            <p className="font-medium text-[#4a242c]">
              {submission?.description || "No remarks provided"}
            </p>
          </div>

          <div className="bg-[#F6B8C2]/30 p-4 rounded-2xl border border-[#D58C99]">
            <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
              Date of Submission
            </span>
            <p className="font-medium text-[#4a242c]">
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