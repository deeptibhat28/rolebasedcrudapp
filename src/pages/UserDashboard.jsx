import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubmissions, deleteSubmission } from '../services/api';

export default function UserDashboard() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    } else {
      fetchUserSubmissions();
    }
  }, []);

  const fetchUserSubmissions = async () => {
    try {
      const data = await getSubmissions();
      const userSubs = data.filter(sub => sub.userId === currentUser.id || sub.username === currentUser.username);
      setSubmissions(userSubs);
    } catch (err) {
      setError('Failed to fetch submissions.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        await deleteSubmission(id);
        fetchUserSubmissions();
        setSuccess('Submission deleted successfully.');
      } catch (err) {
        setError('Failed to delete submission.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#ebd5e2] to-[#cbb2d4] p-6">
      
      <div className="max-w-6xl mx-auto flex justify-between items-center bg-white p-6 rounded-3xl shadow-xl mb-6 border border-white/55">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2a1a33]">User Dashboard</h1>
          <p className="text-sm text-[#7a5a8c]">Welcome <span className="font-semibold text-xl text-[#2a1a33]">{currentUser?.username}</span></p>
        </div>
        <div className="space-x-3">
          
          <button 
            onClick={() => navigate('/create-form')}
            className="px-4 py-2.5 bg-[#2a1a33] text-white rounded-xl font-bold text-sm hover:bg-[#3d274c] transition duration-200 shadow-lg"
          >
            Create New Form
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-2.5 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-3xl shadow-xl border border-white/55">
        <h2 className="text-lg font-bold text-[#2a1a33] mb-4">My Submissions</h2>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs rounded-xl">{success}</div>}

        {submissions.length === 0 ? (
          <p className="text-[#7a5a8c] text-sm">You haven't added any submissions yet. Click "Create New Form" to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-[#7a5a8c] uppercase">
                  <th className="pb-3 px-2">Name / Email</th>
                  <th className="pb-3 px-2">Phone / Address</th>
                  <th className="pb-3 px-2">Dept / Desig</th>
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-[#2a1a33]">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#faf7fa]/50">
                    <td className="py-3 px-2">
                      <div className="font-bold">{sub.fullName}</div>
                      <div className="text-xs text-[#7a5a8c]">{sub.email}</div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-xs font-medium">{sub.phone || 'N/A'}</div>
                      <div className="text-xs text-[#7a5a8c]">{sub.address || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-medium">{sub.department}</div>
                      <div className="text-xs text-[#7a5a8c]">{sub.designation}</div>
                    </td>
                    <td className="py-3 px-2 text-xs text-[#7a5a8c]">
                      {sub.dateOfSubmission ? sub.dateOfSubmission.split('-').reverse().join('/') : 'N/A'}
                    </td>
                    <td className="py-3 px-2 text-right space-x-2 whitespace-nowrap">
                     
                      <button 
                        onClick={() => navigate(`/view-form/${sub.id}`)}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition"
                      >
                        View
                      </button>
                    
                      <button 
                        onClick={() => navigate(`/edit-form/${sub.id}`)}
                        className="px-3 py-1 bg-purple-50 text-[#7a5a8c] rounded-xl text-xs font-bold hover:bg-purple-100 transition"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(sub.id)}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

