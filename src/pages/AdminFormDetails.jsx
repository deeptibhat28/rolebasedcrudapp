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
    <div className="min-h-screen w-full bg-[#1a0b2e] px-4 py-8 relative overflow-hidden flex items-center justify-center text-white">
      
      
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/35 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-[#28133f] p-8 rounded-3xl shadow-2xl border border-purple-900/50 max-w-lg w-full relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-white">Admin Form</h1>
            <p className="text-xs text-purple-200/70">Complete details of user</p>
          </div>
          <button 
            onClick={() => navigate('/admin-dashboard')}
            className="text-xs font-bold text-purple-300 hover:text-white transition"
          >
            Back to Admin Panel
          </button>
        </div>

        {submission ? (
          <div className="space-y-4 text-sm">
            
            <div className="bg-purple-950/40 p-4 rounded-2xl border border-purple-900/50 flex justify-between items-center">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Submitted By User</span>
              <span className="px-3 py-1 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-sm">
                {submission.username || 'Unknown User'}
              </span>
            </div>

            <div className="bg-black/20 p-4 rounded-2xl border border-white/10">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-1">Full Name</span>
              <p className="font-bold text-white">{submission.fullName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 p-4 rounded-2xl border border-white/10">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-1">Email</span>
                <p className="font-medium text-white truncate">{submission.email}</p>
              </div>
              <div className="bg-black/20 p-4 rounded-2xl border border-white/10">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-1">Phone</span>
                <p className="font-medium text-white">{submission.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 p-4 rounded-2xl border border-white/10">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-1">Department</span>
                <p className="font-medium text-white">{submission.department}</p>
              </div>
              <div className="bg-black/20 p-4 rounded-2xl border border-white/10">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-1">Designation</span>
                <p className="font-medium text-white">{submission.designation || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-black/20 p-4 rounded-2xl border border-white/10">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-1">Address</span>
              <p className="font-medium text-white">{submission.address || 'N/A'}</p>
            </div>

            <div className="bg-black/20 p-4 rounded-2xl border border-white/10">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-1">Description</span>
              <p className="font-medium text-white">{submission.description || 'No remarks provided'}</p>
            </div>

            <div className="bg-black/20 p-4 rounded-2xl border border-white/10">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-1">Date of Submission</span>
              <p className="font-medium text-white">
                {submission.dateOfSubmission ? submission.dateOfSubmission.split('-').reverse().join('/') : 'N/A'}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-purple-200/70 text-sm text-center py-6">Loading submission details...</p>
        )}
      </div>
    </div>
  );
}