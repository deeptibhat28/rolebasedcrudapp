import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSubmission } from '../services/api';
import { toast } from "react-toastify";

export default function CreateForm() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    address: '',
    description: '',
    dateOfSubmission: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   

    if (!formData.fullName || !formData.department || !formData.email || !formData.phone || !formData.designation || !formData.address || !formData.dateOfSubmission) {
      toast.warn('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.warn('Please enter a valid email address.');
      return;
    }
    if (formData.phone) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(formData.phone)) {
        toast.warn('Please enter a valid phone number (must be exactly 10 digits)');
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
      toast.success('Form submitted successfully!')
      navigate('/user-dashboard'); 
    } catch (err) {
      toast.error('Failed to create submission. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#ebd5e2] to-[#cbb2d4] p-6 flex items-center justify-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-white/55 max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-extrabold text-[#2a1a33]">New Submission Form</h1>
          <button 
            onClick={() => navigate('/user-dashboard')}
            className="text-xs font-bold text-[#7a5a8c] hover:text-[#2a1a33]"
          >
            Back to Dashboard
          </button>
        </div>

       

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Full Name</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full px-3 py-2 bg-[#faf7fa] border border-[#ebd8e6] rounded-xl text-sm text-[#2a1a33]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Email Address</label>
            <input type="text" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 bg-[#faf7fa] border border-[#ebd8e6] rounded-xl text-sm text-[#2a1a33]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Phone Number</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-3 py-2 bg-[#faf7fa] border border-[#ebd8e6] rounded-xl text-sm text-[#2a1a33]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Department</label>
            <input type="text" name="department" value={formData.department} onChange={handleChange} required className="w-full px-3 py-2 bg-[#faf7fa] border border-[#ebd8e6] rounded-xl text-sm text-[#2a1a33]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Designation</label>
            <input type="text" name="designation" value={formData.designation} onChange={handleChange}required className="w-full px-3 py-2 bg-[#faf7fa] border border-[#ebd8e6] rounded-xl text-sm text-[#2a1a33]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full px-3 py-2 bg-[#faf7fa] border border-[#ebd8e6] rounded-xl text-sm text-[#2a1a33]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full px-3 py-2 bg-[#faf7fa] border border-[#ebd8e6] rounded-xl text-sm text-[#2a1a33]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Date of Submission</label>
            <input type="date" name="dateOfSubmission" value={formData.dateOfSubmission} onChange={handleChange} required className="w-full px-3 py-2 bg-[#faf7fa] border border-[#ebd8e6] rounded-xl text-sm text-[#2a1a33]" />
          </div>

          <button type="submit" className="w-full py-3 bg-[#2a1a33] text-white rounded-2xl font-bold text-sm hover:bg-[#3d274c] transition shadow-lg mt-2">
            Submit Record
          </button>
        </form>
      </div>
    </div>
  );
}