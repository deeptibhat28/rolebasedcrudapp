import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubmissions } from '../services/api';
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
      const currentSub = data.find(sub => sub.id.toString() === id);
      if (currentSub) {
        setSubmission(currentSub);
      } else {
        toast.error('Submission not found.');
      }
    } catch (err) {
      toast.error('Failed to load submission details.');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#ebd5e2] to-[#cbb2d4] p-6 flex items-center justify-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-white/55 max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-[#2a1a33]">Admin Form</h1>
            <p className="text-xs text-[#7a5a8c]">Complete details of user</p>
          </div>
          <button 
            onClick={() => navigate('/admin-dashboard')}
            className="text-xs font-bold text-[#7a5a8c] hover:text-[#2a1a33]"
          >
            Back to Admin Panel
          </button>
        </div>

        

        {submission ? (
          <div className="space-y-4 text-sm">
            
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex justify-between items-center">
              <span className="text-xs font-bold text-[#7a5a8c] uppercase tracking-wider">Submitted By User</span>
              <span className="px-3 py-1 bg-[#2a1a33] text-white rounded-xl text-xs font-bold">
                {submission.username || 'Unknown User'}
              </span>
            </div>

            <div className="bg-[#faf7fa] p-4 rounded-2xl border border-[#ebd8e6]">
              <span className="text-xs font-bold text-[#7a5a8c] uppercase tracking-wider block mb-1">Full Name</span>
              <p className="font-bold text-[#2a1a33]">{submission.fullName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#faf7fa] p-4 rounded-2xl border border-[#ebd8e6]">
                <span className="text-xs font-bold text-[#7a5a8c] uppercase tracking-wider block mb-1">Email</span>
                <p className="font-medium text-[#2a1a33] truncate">{submission.email}</p>
              </div>
              <div className="bg-[#faf7fa] p-4 rounded-2xl border border-[#ebd8e6]">
                <span className="text-xs font-bold text-[#7a5a8c] uppercase tracking-wider block mb-1">Phone</span>
                <p className="font-medium text-[#2a1a33]">{submission.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#faf7fa] p-4 rounded-2xl border border-[#ebd8e6]">
                <span className="text-xs font-bold text-[#7a5a8c] uppercase tracking-wider block mb-1">Department</span>
                <p className="font-medium text-[#2a1a33]">{submission.department}</p>
              </div>
              <div className="bg-[#faf7fa] p-4 rounded-2xl border border-[#ebd8e6]">
                <span className="text-xs font-bold text-[#7a5a8c] uppercase tracking-wider block mb-1">Designation</span>
                <p className="font-medium text-[#2a1a33]">{submission.designation || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-[#faf7fa] p-4 rounded-2xl border border-[#ebd8e6]">
              <span className="text-xs font-bold text-[#7a5a8c] uppercase tracking-wider block mb-1">Address</span>
              <p className="font-medium text-[#2a1a33]">{submission.address || 'N/A'}</p>
            </div>

            <div className="bg-[#faf7fa] p-4 rounded-2xl border border-[#ebd8e6]">
              <span className="text-xs font-bold text-[#7a5a8c] uppercase tracking-wider block mb-1">Description</span>
              <p className="font-medium text-[#2a1a33]">{submission.description || 'No remarks provided'}</p>
            </div>

            <div className="bg-[#faf7fa] p-4 rounded-2xl border border-[#ebd8e6]">
              <span className="text-xs font-bold text-[#7a5a8c] uppercase tracking-wider block mb-1">Date of Submission</span>
              <p className="font-medium text-[#2a1a33]">
                {submission.dateOfSubmission ? submission.dateOfSubmission.split('-').reverse().join('/') : 'N/A'}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-[#7a5a8c] text-sm text-center py-6">Loading submission details...</p>
        )}
      </div>
    </div>
  );
}