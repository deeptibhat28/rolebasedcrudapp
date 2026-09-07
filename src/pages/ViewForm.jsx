import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getSubmissions } from "../services/api";
import { toast } from "react-toastify";

export default function ViewForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [submission, setSubmission] = useState(
    location.state?.submission || null,
  );

  useEffect(() => {
    if (!submission) {
      fetchDetails();
    }
  }, [id]);

  const fetchDetails = async () => {
    try {
      const data = await getSubmissions();
      const currentSub = data.find((sub) => sub.id.toString() === id);
      if (currentSub) {
        setSubmission(currentSub);
      } else {
        toast.error("Submission not found.");
        navigate("/user-dashboard");
      }
    } catch (err) {
      toast.error("Failed to fetch submission details.");
      navigate("/user-dashboard");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F9B2BC] px-4 py-8 relative overflow-hidden flex items-center justify-center text-[#4a242c]">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#F67C8E]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-[#FCD3DC] backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/60 max-w-lg w-full relative z-15 my-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-extrabold text-[#4a242c]">
            Submission Details
          </h1>
          <button
            onClick={() => navigate("/user-dashboard")}
            className="text-xs font-bold text-[#68333e] hover:text-[#4a242c] transition bg-[#F6B8C2]/50 px-3 py-1.5 rounded-xl border border-[#D58C99]"
          >
            Back to Dashboard
          </button>
        </div>

        {submission ? (
          <div className="space-y-4 text-sm">
            <div className="bg-[#F6B8C2]/40 p-4 rounded-2xl border border-[#D58C99]">
              <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
                Full Name
              </span>
              <p className="font-bold text-[#4a242c]">{submission.fullName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F6B8C2]/40 p-4 rounded-2xl border border-[#D58C99]">
                <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
                  Email
                </span>
                <p className="font-medium text-[#4a242c] truncate">
                  {submission.email}
                </p>
              </div>
              <div className="bg-[#F6B8C2]/40 p-4 rounded-2xl border border-[#D58C99]">
                <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
                  Phone
                </span>
                <p className="font-medium text-[#4a242c]">
                  {submission.phone || "N/A"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F6B8C2]/40 p-4 rounded-2xl border border-[#D58C99]">
                <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
                  Department
                </span>
                <p className="font-medium text-[#4a242c]">
                  {submission.department}
                </p>
              </div>
              <div className="bg-[#F6B8C2]/40 p-4 rounded-2xl border border-[#D58C99]">
                <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
                  Designation
                </span>
                <p className="font-medium text-[#4a242c]">
                  {submission.designation || "N/A"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F6B8C2]/40 p-4 rounded-2xl border border-[#D58C99]">
                <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
                  Gender
                </span>
                <p className="font-medium text-[#4a242c]">
                  {submission.gender || "N/A"}
                </p>
              </div>
              <div className="bg-[#F6B8C2]/40 p-4 rounded-2xl border border-[#D58C99]">
                <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
                  Education
                </span>
                <p className="font-medium text-[#4a242c]">
                  {submission.education === "Other"
                    ? submission.customEducation
                    : submission.education || "N/A"}
                </p>
              </div>
            </div>

            <div className="bg-[#F6B8C2]/40 p-4 rounded-2xl border border-[#D58C99]">
              <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
                Skills
              </span>
              <p className="font-medium text-[#4a242c]">
                {Array.isArray(submission.skills)
                  ? submission.skills.join(", ")
                  : submission.skills || "N/A"}
              </p>
            </div>

            <div className="bg-[#F6B8C2]/40 p-4 rounded-2xl border border-[#D58C99]">
              <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
                Address
              </span>
              <p className="font-medium text-[#4a242c]">
                {submission.address || "N/A"}
              </p>
            </div>

            <div className="bg-[#F6B8C2]/40 p-4 rounded-2xl border border-[#D58C99]">
              <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
                Description
              </span>
              <p className="font-medium text-[#4a242c]">
                {submission.description || "No remarks provided"}
              </p>
            </div>

            <div className="bg-[#F6B8C2]/40 p-4 rounded-2xl border border-[#D58C99]">
              <span className="text-xs font-bold text-[#5c2d36] uppercase tracking-wider block mb-1">
                Date of Submission
              </span>
              <p className="font-medium text-[#4a242c]">
                {submission.dateOfSubmission
                  ? submission.dateOfSubmission.split("-").reverse().join("/")
                  : "N/A"}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <svg
              className="animate-spin h-8 w-8 text-[#F45B73] mx-auto mb-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-sm text-[#68333e] font-semibold">
              Loading details...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}