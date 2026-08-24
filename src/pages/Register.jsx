import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState();
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const newUser = { username, password, role};
            const response = await registerUser(newUser);

            if (response) {
                navigate('/');
            } else {
                setError('Registration failed. Try a different username.');
            }
        } catch (error) {
            setError('Something went wrong. Make sure json-server is running!');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 px-4">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-orange-100">
        <div className="text-center mb-8">
            <div className="inline-block p-4 bg-orange-100 rounded-full text-orange-500 mb-4 shadow-inner border border-orange-200/50">
             <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
            <p className="text-base text-gray-600 mt-2">Sign up to get started on the portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded-r-xl shadow-sm">
            {error}
          </div>   
        )}

        <form onSubmit={handleRegister} className="space-y-5">
            <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Username</label>
                <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)} 
              required
              placeholder="Insert a username"
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition duration-200 shadow-inner"
            />
            </div>

            <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required
              placeholder="Create a password"
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition duration-200 shadow-inner"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition duration-200 shadow-inner"
            >
              <option value="user">Normal User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="w-full py-4 px-6 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5">
            Register Now
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/" className="font-semibold text-orange-600 hover:text-orange-500">
            Sign In
          </Link>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400 border-t border-gray-100 pt-4">
          Role-Based CRUD | 2026 Portal
        </div>
 
        </div>
        </div>
    )
}

