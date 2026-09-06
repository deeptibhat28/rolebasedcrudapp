import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSubmission } from "../services/api";
import { toast } from "react-toastify";
import { logActivity } from "../utils/logger";

export default function CreateForm() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || localStorage.getItem("currentUser")) || {};

  const [loading, setLoading] = useState(false); 

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    education: "",
    customEducation: "",
    skills: [],
    department: "",
    designation: "",
    address: "",
    description: "",
    dateOfSubmission: new Date().toISOString().split("T")[0],
  });

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

    const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov|co|io)$/i;

    if (!strictEmailRegex.test(emailValue)) {
      toast.warn("Please enter a valid email address(e.g., example@gmail.com).");
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
        formData.education === "Other" ? formData.customEducation : formData.education;

      const formattedSkills = Array.isArray(formData.skills) 
        ? formData.skills.join(", ") 
        : formData.skills;

      const newRecord = {
        ...formData,
        education: finalEducation,
        skills: formattedSkills,
        userId: currentUser.id,
        username: currentUser.username,
      };

      await createSubmission(newRecord);
      
      logActivity(
        "FORM_CREATE",
        `Created new form submission for: ${formData.fullName}`,
        currentUser?.username || "User"
      );

      toast.success("Form submitted successfully!");
      navigate("/user-dashboard");
    } catch (err) {
      toast.error("Failed to create submission. Please try again.");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#1a0b2e] px-4 py-8 relative overflow-hidden flex items-center justify-center text-white">
      
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active,
        textarea:-webkit-autofill,
        select:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px #1c0e30 inset !important;
          -webkit-text-fill-color: white !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/35 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-[#28133f] p-8 rounded-3xl shadow-2xl border border-purple-900/50 max-w-lg w-full relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-extrabold text-white">
            New Submission Form
          </h1>
          <button
            onClick={() => navigate("/user-dashboard")}
            className="text-xs font-bold text-purple-300 hover:text-white transition"
          >
            Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Enter full name"
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example123@gmail.com"
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="10 digit phone number"
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-200 uppercase tracking-wider mb-2">
              Gender <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center space-x-6 text-white text-sm pt-1">
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
                    className="text-purple-600 focus:ring-purple-400 bg-black/20"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
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
              className="w-full px-3 py-2 bg-[#1a0b2e] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
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
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                Custom Education <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="customEducation"
                value={formData.customEducation || ""}
                onChange={handleChange}
                placeholder="Please specify education"
                required
                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

         <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">Skills</label>
            <div className="grid grid-cols-2 gap-2 bg-black/20 border border-white/10 p-3 rounded-xl">
              {["React.js", "Node.js", "JavaScript", "Python", "UI/UX Design", "Tailwind CSS"].map((skill) => {
                const skillsList = Array.isArray(formData.skills) ? formData.skills : [];
                const isChecked = skillsList.includes(skill);

                return (
                  <label key={skill} className="flex items-center space-x-2 text-sm text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      value={skill}
                      checked={isChecked}
                      onChange={(e) => {
                        let updatedSkills = [...skillsList];
                        if (e.target.checked) {
                          updatedSkills.push(skill);
                        } else {
                          updatedSkills = updatedSkills.filter(s => s !== skill);
                        }
                        setFormData(prev => ({ ...prev, skills: updatedSkills }));
                      }}
                      className="rounded bg-black/40 border-white/20 text-purple-600 focus:ring-purple-500 w-4 h-4"
                    />
                    <span>{skill}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
              Department <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              placeholder="Enter department"
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
              Designation <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              required
              placeholder="Enter designation"
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
              Address <span className="text-red-400">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              required
              placeholder="Enter address..."
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              placeholder="Enter description..."
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
              Date of Submission <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              name="dateOfSubmission"
              value={formData.dateOfSubmission}
              readOnly
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-purple-300 cursor-not-allowed focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-linear-to-r from-red-500 to-orange-500 text-white rounded-2xl font-bold text-sm transition shadow-lg mt-2 flex items-center justify-center space-x-2 ${
              loading ? "opacity-75 cursor-not-allowed" : "hover:opacity-95"
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
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Record</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}