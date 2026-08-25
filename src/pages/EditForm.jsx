import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubmissions, updateSubmission } from '../services/api';

export default function EditForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // Grabs the ID from the URL path (/edit-form/:id)
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    address: '',
    description: '',
    dateOfSubmission: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubmissionData();
  }, [id]);

  const fetchSubmissionData = async () => {
    try {
      const data = await getSubmissions();
      const currentSub = data.find(sub => sub.id.toString() === id);
      if (currentSub) {
        setFormData({
          fullName: currentSub.fullName || '',
          email: currentSub.email || '',
          phone: currentSub.phone || '',
          department: currentSub.department || '',
          designation: currentSub.designation || '',
          address: currentSub.address || '',
          description: currentSub.description || '',
          dateOfSubmission: currentSub.dateOfSubmission || ''
        });
      } else {
        setError('Submission not found.');
      }
    } catch (err) {
      setError('Failed to load submission details.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.department || !formData.email) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const updatedRecord = {
        ...formData,
        userId: currentUser.id,
        username: currentUser.username,
      };
      await updateSubmission(id, updatedRecord);
      navigate('/user-dashboard'); 
    } catch (err) {
      setError('Failed to update submission. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#ebd5e2] to-[#cbb2d4] p-6 flex items-center justify-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-white/55 max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-extrabold text-[#2a1a33]">Edit Submission Form</h1>
          <button 
            onClick={() => navigate('/user-dashboard')}
            className="text-xs font-bold text-[#7a5a8c] hover:text-[#2a1a33]"
          >
            ← Back to Dashboard
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Full Name</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full px-3 py-2 bg-[#faf7fa] border border-[#ebd8e6] rounded-xl text-sm text-[#2a1a33]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 bg-[#faf7fa] border border-[#ebd8e6] rounded-xl text-sm text-[#2a1a33]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Phone Number</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 bg-[#faf7fa] border border-[#ebd8e6] rounded-xl text-sm text-[#2a1a33]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Department</label>
            <input type="text" name="department" value={formData.department} onChange={handleChange} required className="w-full px-3 py-2 bg-[#faf7fa] border border-[#ebd8e6] rounded-xl text-sm text-[#2a1a33]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Designation</label>
            <input type="text" name="designation" value={formData.designation} onChange={handleChange} className="w-full px-3 py-2 bg-[#faf7fa] border border-[#ebd8e6] rounded-xl text-sm text-[#2a1a33]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 bg-[#faf7fa] border border-[#ebd8e6] rounded-xl text-sm text-[#2a1a33]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Description / Remarks</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full px-3 py-2 bg-[#faf7fa] border border-[#ebd8e6] rounded-xl text-sm text-[#2a1a33]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Date of Submission</label>
            <input type="date" name="dateOfSubmission" value={formData.dateOfSubmission} onChange={handleChange} className="w-full px-3 py-2 bg-[#faf7fa] border border-[#ebd8e6] rounded-xl text-sm text-[#2a1a33]" />
          </div>

          <button type="submit" className="w-full py-3 bg-[#2a1a33] text-white rounded-2xl font-bold text-sm hover:bg-[#3d274c] transition shadow-lg mt-2">
            Update Record
          </button>
        </form>
      </div>
    </div>
  );
}