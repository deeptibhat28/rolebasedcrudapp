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
        <div className="min-h-screen bg-linear-to-br from-[#ebd5e2] to-[#cbb2d4] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl border border-white/55">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-[#2a1a33]">Create Account</h1>
          <p className="text-sm text-[#7a5a8c] mt-1">Sign up to get started</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl">
            {error}
          </div>   
        )}

        <form onSubmit={handleRegister} className="space-y-5">
            <div>
                <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Username</label>
                <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)} 
              required
              placeholder="Enter username"
              className="w-full px-4 py-3 bg-[#faf7fa] border border-[#ebd8e6] rounded-2xl text-sm text-[#2a1a33] focus:outline-none focus:ring-2 focus:ring-[#7a5a8c]"
            />
            </div>

            <div>
            <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required
              placeholder="Create a password"
              className="w-full px-4 py-3 bg-[#faf7fa] border border-[#ebd8e6] rounded-2xl text-sm text-[#2a1a33] focus:outline-none focus:ring-2 focus:ring-[#7a5a8c]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 bg-[#faf7fa] border border-[#ebd8e6] rounded-2xl text-sm text-[#2a1a33] focus:outline-none focus:ring-2 focus:ring-[#7a5a8c]"
            >
              <option value="user">Normal User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="w-full py-3.5 bg-[#2a1a33] text-white rounded-2xl font-bold text-sm hover:bg-[#3d274c] transition duration-200 shadow-lg shadow-[#2a1a33]/20 mt-2">
            Register Now
          </button>
        </form>

        <div className="text-center text-sm text-[#7a5a8c] mt-6">
          Already have an account?{' '}
          <Link to="/" className="text-[#2a1a33] font-bold hover:underline">
            Sign In
          </Link>
        </div>

        </div>
        </div>
    )
}

