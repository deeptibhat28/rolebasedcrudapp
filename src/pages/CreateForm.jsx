import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSubmission } from "../services/api";
import { toast } from "react-toastify";
import { logActivity } from "../utils/logger";

export default function CreateForm() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || localStorage.getItem("currentUser")) || {};

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    education: "",
    customEducation: "",
    skills: "",
    department: "",
    designation: "",
    address: "",
    description: "",
    dateOfSubmission: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.warn("Please enter a valid email address.");
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

    try {
      const newRecord = {
        ...formData,
        userId: currentUser.id,
        username: currentUser.username,
      };
      await createSubmission(newRecord);
      
      logActivity(
        "FORM_CREATE",
        `Created new form submission for: ${formData.fullName}`,
        currentUser?.username || "User"
      )
      toast.success("Form submitted successfully!");
      navigate("/user-dashboard");
    } catch (err) {
      toast.error("Failed to create submission. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#1a0b2e] px-4 py-8 relative overflow-hidden flex items-center justify-center text-white">
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
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
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
            <label className="block text-xs font-semibold text-purple-200 uppercase tracking-wider mb-2">
              Highest Education <span className="text-red-400">*</span>
            </label>
            <select
              name="education"
              value={formData.education}
              onChange={(e) => {
                handleChange(e);
                if (e.target.value !== "Other") {
                  setFormData((prev) => ({ ...prev, customEducation: "" }));
                }
              }}
              required
              className="w-full px-4 py-3 rounded-lg bg-[#1a0b2e] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm mb-3"
            >
              <option value="" disabled>
                Select your education level
              </option>
              <option value="SSC">SSC</option>
              <option value="HSC">HSC</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="Ph.D. or Doctorate">Ph.D. or Doctorate</option>
              <option value="Other">Other (Type manually)</option>
            </select>

            {formData.education === "Other" && (
              <input
                type="text"
                name="customEducation"
                placeholder="Please type your education"
                value={formData.customEducation}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              />
            )}
          </div>

         <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">Skills</label>
            <div className="grid grid-cols-2 gap-2 bg-black/20 border border-white/10 p-3 rounded-xl">
              {["React.js", "Node.js", "JavaScript", "Python", "UI/UX Design", "Tailwind CSS"].map((skill) => {
                const skillsList = Array.isArray(formData.skills) 
                  ? formData.skills 
                  : (typeof formData.skills === 'string' ? formData.skills.split(',').map(s => s.trim()) : []);
                
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
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
              Address <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
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
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 color-scheme-dark"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-linear-to-r from-red-500 to-orange-500 hover:opacity-95 text-white rounded-2xl font-bold text-sm transition shadow-lg mt-2"
          >
            Submit Record
          </button>
        </form>
      </div>
    </div>
  );
}
