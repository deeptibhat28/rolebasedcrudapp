import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSubmissions, updateSubmission } from "../services/api";
import { toast } from "react-toastify";
import { logActivity } from "../utils/logger";

export default function EditForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const currentUser =
    JSON.parse(
      localStorage.getItem("user") || localStorage.getItem("currentUser"),
    ) || {};

  const [loading, setLoading] = useState(false); 

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    gender: "",
    education: "",
    customEducation: "",
    skills: [],
    address: "",
    description: "",
    dateOfSubmission: "",
  });

  useEffect(() => {
    fetchSubmissionData();
  }, [id]);

  const fetchSubmissionData = async () => {
    try {
      const data = await getSubmissions();
      const currentSub = data.find((sub) => sub.id.toString() === id);
      if (currentSub) {
        let parsedSkills = [];
        if (Array.isArray(currentSub.skills)) {
          parsedSkills = currentSub.skills;
        } else if (
          typeof currentSub.skills === "string" &&
          currentSub.skills.trim() !== ""
        ) {
          parsedSkills = currentSub.skills.split(",").map((s) => s.trim());
        }

        setFormData({
          fullName: currentSub.fullName || "",
          email: currentSub.email || "",
          phone: currentSub.phone || "",
          department: currentSub.department || "",
          designation: currentSub.designation || "",
          gender: currentSub.gender || "",
          education: currentSub.education || "",
          customEducation: currentSub.customEducation || "",
          skills: parsedSkills,
          address: currentSub.address || "",
          description: currentSub.description || "",
          dateOfSubmission: currentSub.dateOfSubmission || "",
        });
      } else {
        toast.error("Submission not found.");
      }
    } catch (err) {
      toast.error("Failed to load submission details.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "fullName" || name === "department") {
      if (value !== "" && !/^[A-Za-z\s]*$/.test(value)) {
        return; 
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.department ||
      !formData.email ||
      !formData.phone ||
      !formData.designation ||
      !formData.address ||
      !formData.dateOfSubmission
    ) {
      toast.warn("Please fill in all required fields.");
      return;
    }

    const emailValue = formData.email.trim();
    
    if (emailValue.includes(" ")) {
      toast.warn("Email address cannot contain spaces.");
      return;
    }

    const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.(com|in|org|net|edu|gov|co|io)$/i;

    if (!strictEmailRegex.test(emailValue)) {
      toast.warn("Please enter a valid email address(e.g., example123@gmail.com).");
      return;
    }

    if (formData.phone) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(formData.phone)) {
        toast.warn(
          "Please enter a valid phone number (must be exactly 10 digits)",
        );
        return;
      }
    }

    const alphaRegex = /^[A-Za-z\s]+$/;
    if (!alphaRegex.test(formData.department)) {
      toast.warn("Department must contain only letters and spaces.");
      return;
    }

    setLoading(true); 

    try {
      const finalEducation =
        formData.education === "Other" ? formData.customEducation : formData.education;

      const formattedSkills = Array.isArray(formData.skills) 
        ? formData.skills.join(", ") 
        : formData.skills;

      const updatedRecord = {
        ...formData,
        education: finalEducation,
        skills: formattedSkills,
        userId: currentUser.id,
        username: currentUser.username,
      };
      
      await updateSubmission(id, updatedRecord);

      logActivity(
        "FORM_UPDATE",
        `Updated submission record for: ${formData.fullName || "User Record"}`,
        currentUser?.username || "User"
      );

      toast.success("Record updated successfully");
      navigate("/user-dashboard");
    } catch (err) {
      toast.error("Failed to update submission. Please try again.");
    } finally {
      setLoading(false); 
    }
  };

 return (
    <div className="min-h-screen w-full bg-[#F9B2BC] px-4 py-8 relative overflow-hidden flex items-center justify-center text-[#4a242c]">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#F67C8E]/20 rounded-full blur-3xl pointer-events-none"></div>

      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active,
        textarea:-webkit-autofill,
        select:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #FCD3DC inset !important;
          -webkit-text-fill-color: #4a242c !important;
          transition: background-color 5000s ease-in-out 0s !important;
        }
      `}</style>

      <div className="bg-[#FCD3DC] backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/60 max-w-lg w-full relative z-15 my-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-[#4a242c]">
              Edit Submission Form
            </h1>
            <p className="text-xs text-[#68333e]/80">
              Update user record details
            </p>
          </div>
          <button
            onClick={() => navigate("/user-dashboard")}
            className="text-xs font-bold text-[#68333e] hover:text-[#4a242c] transition"
          >
            Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#5c2d36] uppercase tracking-wider mb-1">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="Only alphabets and spaces"
              className="w-full px-3 py-2 bg-[#FCD3DC] border border-[#D58C99] rounded-xl text-sm text-[#4a242c] placeholder-[#8C4A56] focus:outline-none focus:ring-2 focus:ring-[#F45B73]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#5c2d36] uppercase tracking-wider mb-1">
                Email Address <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="example@gmail.com"
                className="w-full px-3 py-2 bg-[#FCD3DC] border border-[#D58C99] rounded-xl text-sm text-[#4a242c] placeholder-[#8C4A56] focus:outline-none focus:ring-2 focus:ring-[#F45B73]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#5c2d36] uppercase tracking-wider mb-1">
                Phone Number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                autoComplete="off"
                placeholder="10 digit phone number"
                className="w-full px-3 py-2 bg-[#FCD3DC] border border-[#D58C99] rounded-xl text-sm text-[#4a242c] placeholder-[#8C4A56] focus:outline-none focus:ring-2 focus:ring-[#F45B73]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#5c2d36] uppercase tracking-wider mb-1">
                Department <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                autoComplete="off"
                placeholder="Only letters and spaces"
                className="w-full px-3 py-2 bg-[#FCD3DC] border border-[#D58C99] rounded-xl text-sm text-[#4a242c] placeholder-[#8C4A56] focus:outline-none focus:ring-2 focus:ring-[#F45B73]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#5c2d36] uppercase tracking-wider mb-1">
                Designation <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
                autoComplete="off"
                placeholder="Only letters and spaces"
                className="w-full px-3 py-2 bg-[#FCD3DC] border border-[#D58C99] rounded-xl text-sm text-[#4a242c] placeholder-[#8C4A56] focus:outline-none focus:ring-2 focus:ring-[#F45B73]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5c2d36] uppercase tracking-wider mb-2">
              Gender <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center space-x-6 text-[#4a242c] text-sm pt-1">
              {["Male", "Female", "Other"].map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={option}
                    checked={formData.gender === option}
                    onChange={handleChange}
                    required
                    className="text-[#F45B73] focus:ring-[#F45B73] bg-[#FCD3DC] border-[#D58C99]"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5c2d36] uppercase tracking-wider mb-1">
              Highest Education <span className="text-red-600">*</span>
            </label>
            <select
              name="education"
              value={formData.education || ""}
              onChange={(e) => {
                handleChange(e);
                if (e.target.value !== "Other") {
                  setFormData((prev) => ({ ...prev, customEducation: "" }));
                }
              }}
              required
              className="w-full px-3 py-2 bg-[#FCD3DC] border border-[#D58C99] rounded-xl text-sm text-[#4a242c] focus:outline-none focus:ring-2 focus:ring-[#F45B73]"
            >
              <option value="" disabled>Select Education</option>
              <option value="HSC">HSC</option>
              <option value="SSC">SSC</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="PhD">PhD</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {formData.education === "Other" && (
            <div>
              <label className="block text-xs font-bold text-[#5c2d36] uppercase tracking-wider mb-1">
                Custom Education <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="customEducation"
                value={formData.customEducation || ""}
                onChange={handleChange}
                placeholder="Please specify education"
                required
                autoComplete="off"
                className="w-full px-3 py-2 bg-[#FCD3DC] border border-[#D58C99] rounded-xl text-sm text-[#4a242c] placeholder-[#8C4A56] focus:outline-none focus:ring-2 focus:ring-[#F45B73]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#5c2d36] uppercase tracking-wider mb-2">
              Skills
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#F6B8C2]/40 border border-[#D58C99] p-3 rounded-xl">
              {[
                "React.js",
                "Node.js",
                "JavaScript",
                "Python",
                "UI/UX Design",
                "Tailwind CSS",
              ].map((skill) => {
                const skillsList = Array.isArray(formData.skills)
                  ? formData.skills
                  : typeof formData.skills === "string"
                    ? formData.skills.split(",").map((s) => s.trim())
                    : [];

                const isChecked = skillsList.includes(skill);

                return (
                  <label
                    key={skill}
                    className="flex items-center space-x-2 text-sm text-[#4a242c] cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      value={skill}
                      checked={isChecked}
                      onChange={(e) => {
                        let updatedSkills = [...skillsList];
                        if (e.target.checked) {
                          updatedSkills.push(skill);
                        } else {
                          updatedSkills = updatedSkills.filter(
                            (s) => s !== skill
                          );
                        }
                        setFormData((prev) => ({
                          ...prev,
                          skills: updatedSkills,
                        }));
                      }}
                      className="rounded bg-[#FCD3DC] border-[#D58C99] text-[#F45B73] focus:ring-[#F45B73] w-4 h-4"
                    />
                    <span>{skill}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5c2d36] uppercase tracking-wider mb-1">
              Address <span className="text-red-600">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              required
              autoComplete="off"
              placeholder="Enter address..."
              className="w-full px-3 py-2 bg-[#FCD3DC] border border-[#D58C99] rounded-xl text-sm text-[#4a242c] placeholder-[#8C4A56] focus:outline-none focus:ring-2 focus:ring-[#F45B73]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5c2d36] uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              autoComplete="off"
              placeholder="Enter description..."
              className="w-full px-3 py-2 bg-[#FCD3DC] border border-[#D58C99] rounded-xl text-sm text-[#4a242c] placeholder-[#8C4A56] focus:outline-none focus:ring-2 focus:ring-[#F45B73]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5c2d36] uppercase tracking-wider mb-1">
              Date of Submission <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              name="dateOfSubmission"
              value={formData.dateOfSubmission}
              readOnly
              className="w-full px-3 py-2 bg-[#F6B8C2]/50 border border-[#D58C99] rounded-xl text-sm text-[#68333e] cursor-not-allowed focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-[#F45B73] hover:bg-[#E04860] text-white rounded-2xl font-bold text-sm transition shadow-md mt-2 flex items-center justify-center space-x-2 ${
              loading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                <span>Updating...</span>
              </>
            ) : (
              <span>Update Record</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
