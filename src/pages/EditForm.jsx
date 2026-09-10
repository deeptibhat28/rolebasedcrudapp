import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSubmissions, updateSubmission } from "../services/api";
import { toast } from "react-toastify";
import { logActivity } from "../utils/logger";
import { isValidPhoneNumber } from "libphonenumber-js";

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
    countryCode: "+91",
    customCountryCode: "",
    phone: "",
    gender: "",
    education: "",
    customEducation: "",
    skills: [],
    department: "",
    designation: "",
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

        const predefinedEdu = [
          "HSC",
          "SSC",
          "Bachelor's Degree",
          "Master's Degree",
          "PhD",
        ];
        const isPredefined = predefinedEdu.includes(currentSub.education);

        // Smart phone splitting logic from saved format (e.g. "+44 789456121")
        let rawCountryCode = "+91";
        let rawCustomCountryCode = "";
        let rawPhone = currentSub.phone || "";

        if (currentSub.phone) {
          const parts = currentSub.phone.trim().split(" ");
          if (parts.length > 1 && parts[0].startsWith("+")) {
            const potentialCode = parts[0];
            const supportedStandardCodes = ["+91", "+1", "+44", "+61", "+81"];
            if (supportedStandardCodes.includes(potentialCode)) {
              rawCountryCode = potentialCode;
            } else {
              rawCountryCode = "Other";
              rawCustomCountryCode = potentialCode;
            }
            rawPhone = parts.slice(1).join("");
          }
        }

        setFormData({
          fullName: currentSub.fullName || "",
          email: currentSub.email || "",
          countryCode: rawCountryCode,
          customCountryCode: rawCustomCountryCode,
          phone: rawPhone.replace(/\D/g, ""),
          department: currentSub.department || "",
          designation: currentSub.designation || "",
          gender: currentSub.gender || "",
          education: isPredefined
            ? currentSub.education
            : currentSub.education
            ? "Other"
            : "",
          customEducation: isPredefined ? "" : currentSub.education || "",
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

    // Allow digits only for the phone field
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      setFormData({ ...formData, phone: numericValue });
      return;
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

    const strictEmailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.(com|in|org|net|edu|gov|co|io)$/i;

    if (!strictEmailRegex.test(emailValue)) {
      toast.warn(
        "Please enter a valid email address (e.g., example@gmail.com).",
      );
      return;
    }

    const activeCountryCode =
      formData.countryCode === "Other"
        ? formData.customCountryCode.trim()
        : formData.countryCode;

    if (formData.countryCode === "Other" && !activeCountryCode) {
      toast.warn("Please specify your custom country code.");
      return;
    }

    // Format country code to make sure it includes '+'
    const formattedCountryCode = activeCountryCode.startsWith("+")
      ? activeCountryCode
      : `+${activeCountryCode}`;

    // 1. Strictly enforce 10 digits ONLY for Indian numbers (+91)
    if (formattedCountryCode === "+91" && formData.phone.length !== 10) {
      toast.warn("Phone number must be of 10 digits.");
      return;
    }

    const fullPhoneNumber = `${formattedCountryCode}${formData.phone}`;

    // 2. Global regional validation using libphonenumber-js for all countries
    if (!isValidPhoneNumber(fullPhoneNumber)) {
      toast.warn("Please enter a valid phone number for the selected region.");
      return;
    }

    if (/^(\d)\1+$/.test(formData.phone)) {
      toast.warn("Please enter a valid phone number, not repeated digits.");
      return;
    }

    const alphaRegex = /^[A-Za-z\s]+$/;
    if (!alphaRegex.test(formData.department)) {
      toast.warn("Department must contain only letters and spaces.");
      return;
    }

    setLoading(true);

    try {
      const finalEducation =
        formData.education === "Other"
          ? formData.customEducation
          : formData.education;

      const formattedSkills = Array.isArray(formData.skills)
        ? formData.skills.join(", ")
        : formData.skills;

     
      const displayPhoneNumber = `${formattedCountryCode} ${formData.phone}`;

      const updatedRecord = {
        ...formData,
        phone: displayPhoneNumber,
        education: finalEducation,
        skills: formattedSkills,
        userId: currentUser.id,
        username: currentUser.username,
      };

      await updateSubmission(id, updatedRecord);

      logActivity(
        "FORM_UPDATE",
        `Updated submission record for: ${formData.fullName || "User Record"}`,
        currentUser?.username || "User",
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
    <div
      className="min-h-screen w-full bg-[#240b3b] px-4 sm:px-6 py-6 md:py-10 relative overflow-hidden text-white font-sans"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 30%, rgba(105, 30, 150, 0.45) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(190, 40, 110, 0.35) 0%, transparent 50%), #240b3b",
      }}
    >
      <div className="absolute -top-32 -left-32 w-72 h-72 md:w-96 md:h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-72 h-72 md:w-96 md:h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active,
        textarea:-webkit-autofill,
        select:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #1b082d inset !important;
          -webkit-text-fill-color: white !important;
          transition: background-color 5000s ease-in-out 0s !important;
        }
      `}</style>

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#2e1048]/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl mb-6 border border-purple-500/30 relative z-10 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide">
            Edit Submission Form
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80 mt-0.5">
            Update user record details
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate("/user-dashboard")}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#1b082d]/70 text-purple-200 border border-purple-500/40 rounded-xl font-bold text-xs sm:text-sm hover:bg-[#1b082d] transition duration-200 shadow-md cursor-pointer text-center"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-[#2e1048]/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-purple-500/30 relative z-10">
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          
          {/* Full Name */}
          <div className="md:col-span-2 bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <label className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="Enter full name"
              className="w-full px-4 py-3 bg-[#240b3b] border border-purple-500/40 rounded-xl text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-orange-500 transition shadow-inner"
            />
          </div>

          {/* Email Address */}
          <div className="bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <label className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="example123@gmail.com"
              className="w-full px-4 py-3 bg-[#240b3b] border border-purple-500/40 rounded-xl text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-orange-500 transition shadow-inner"
            />
          </div>

          {/* Phone Number with Country Code Dropdown */}
          <div className="bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <label className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value !== "Other") {
                    setFormData((prev) => ({ ...prev, customCountryCode: "" }));
                  }
                }}
                className="px-3 py-3 bg-[#240b3b] border border-purple-500/40 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 transition shadow-inner [&>option]:bg-[#240b3b] [&>option]:text-white"
              >
                <option value="+91">+91 (India)</option>
                <option value="+1">+1 (USA/Canada)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+61">+61 (Australia)</option>
                <option value="+81">+81 (Japan)</option>
                <option value="Other">Other</option>
              </select>

              {formData.countryCode === "Other" && (
                <input
                  type="text"
                  name="customCountryCode"
                  value={formData.customCountryCode}
                  onChange={handleChange}
                  placeholder="+Code"
                  maxLength={5}
                  className="px-3 py-3 bg-[#240b3b] border border-purple-500/40 rounded-xl text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-orange-500 transition shadow-inner"
                />
              )}

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="Phone number"
                className={`${formData.countryCode === "Other" ? "sm:col-span-1" : "sm:col-span-2"} w-full px-4 py-3 bg-[#240b3b] border border-purple-500/40 rounded-xl text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-orange-500 transition shadow-inner`}
              />
            </div>
          </div>

          {/* Department */}
          <div className="bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <label className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1">
              Department <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              autoComplete="off"
              placeholder="Enter department"
              className="w-full px-4 py-3 bg-[#240b3b] border border-purple-500/40 rounded-xl text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-orange-500 transition shadow-inner"
            />
          </div>

          {/* Designation */}
          <div className="bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <label className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1">
              Designation <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              required
              autoComplete="off"
              placeholder="Enter designation"
              className="w-full px-4 py-3 bg-[#240b3b] border border-purple-500/40 rounded-xl text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-orange-500 transition shadow-inner"
            />
          </div>

          {/* Gender */}
          <div className="bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <label className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-2">
              Gender <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-wrap items-center gap-4 sm:space-x-6 text-purple-100 text-sm pt-2">
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
                    className="text-orange-500 focus:ring-orange-500 bg-[#240b3b] border-purple-500/40"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Highest Education */}
          <div className="bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <label className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1">
              Highest Education <span className="text-red-400">*</span>
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
              className="w-full px-4 py-3 bg-[#240b3b] border border-purple-500/40 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 transition shadow-inner [&>option]:bg-[#240b3b] [&>option]:text-white"
            >
              <option value="" disabled>
                Select Education
              </option>
              <option value="HSC">HSC</option>
              <option value="SSC">SSC</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="PhD">PhD</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Custom Education (if Other) */}
          {formData.education === "Other" && (
            <div className="md:col-span-2 bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
              <label className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1">
                Custom Education <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="customEducation"
                value={formData.customEducation || ""}
                onChange={handleChange}
                placeholder="Please specify education"
                required
                autoComplete="off"
                className="w-full px-4 py-3 bg-[#240b3b] border border-purple-500/40 rounded-xl text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-orange-500 transition shadow-inner"
              />
            </div>
          )}

          {/* Skills */}
          <div className="md:col-span-2 bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <label className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-2">
              Skills & Technologies
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                  : [];
                const isChecked = skillsList.includes(skill);

                return (
                  <label
                    key={skill}
                    className="flex items-center space-x-2 text-sm text-purple-100 cursor-pointer select-none bg-[#240b3b]/60 p-3 rounded-xl border border-purple-500/30 hover:border-purple-500/60 transition"
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
                            (s) => s !== skill,
                          );
                        }
                        setFormData((prev) => ({
                          ...prev,
                          skills: updatedSkills,
                        }));
                      }}
                      className="rounded bg-[#240b3b] border-purple-500/40 text-orange-500 focus:ring-orange-500 w-4 h-4"
                    />
                    <span>{skill}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Address */}
          <div className="md:col-span-2 bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <label className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1">
              Address <span className="text-red-400">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              required
              autoComplete="off"
              placeholder="Enter address..."
              className="w-full px-4 py-3 bg-[#240b3b] border border-purple-500/40 rounded-xl text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-orange-500 transition shadow-inner resize-none"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2 bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <label className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              autoComplete="off"
              placeholder="Enter description..."
              className="w-full px-4 py-3 bg-[#240b3b] border border-purple-500/40 rounded-xl text-sm text-white placeholder-purple-400/40 focus:outline-none focus:border-orange-500 transition shadow-inner resize-none"
            />
          </div>

          {/* Date of Submission */}
          <div className="md:col-span-2 bg-[#1b082d]/70 p-4 rounded-2xl border border-purple-500/40 shadow-inner">
            <label className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1">
              Date of Submission <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              name="dateOfSubmission"
              value={formData.dateOfSubmission}
              readOnly
              className="w-full px-4 py-3 bg-[#240b3b]/60 border border-purple-500/30 rounded-xl text-sm text-purple-300/60 cursor-not-allowed focus:outline-none shadow-inner"
            />
          </div>

          {/* Update Button */}
          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 bg-linear-to-r from-orange-500 to-pink-600 hover:opacity-95 text-white font-bold rounded-xl transition duration-150 shadow-lg text-sm tracking-widest uppercase flex items-center justify-center space-x-2 cursor-pointer ${
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
          </div>

        </form>
      </div>
    </div>
  );
}