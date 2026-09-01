import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSubmissions, updateSubmission } from "../services/api";
import { toast } from "react-toastify";

export default function EditForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const currentUser =
    JSON.parse(
      localStorage.getItem("user") || localStorage.getItem("currentUser"),
    ) || {};

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
          skills: currentSub.skills || [],
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
      const updatedRecord = {
        ...formData,
        userId: currentUser.id,
        username: currentUser.username,
      };
      await updateSubmission(id, updatedRecord);
      toast.success("Record updated successfully");
      navigate("/user-dashboard");
    } catch (err) {
      toast.error("Failed to update submission. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#1a0b2e] px-4 py-8 relative overflow-hidden flex items-center justify-center text-white">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/35 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-[#28133f] p-8 rounded-3xl shadow-2xl max-w-lg w-full relative z-10 my-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-white">
              Edit Submission Form
            </h1>
            <p className="text-xs text-purple-200/70">
              Update user record details
            </p>
          </div>
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
              Full Name
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                Phone Number
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                Department
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
                Designation
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#1a0b2e] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                Education
              </label>
              <select
                name="education"
                value={formData.education || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#1a0b2e] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Select Education</option>
                <option value="HSC">HSC</option>
                <option value="SSC">SSC</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="PhD">PhD</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {formData.education === "Other" && (
            <div>
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                Custom Education
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
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
              Skills
            </label>
            <div className="grid grid-cols-2 gap-2 bg-black/20 border border-white/10 p-3 rounded-xl">
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
                    className="flex items-center space-x-2 text-sm text-white cursor-pointer select-none"
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
              Address
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
              Date of Submission
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
            Update Record
          </button>
        </form>
      </div>
    </div>
  );
}
