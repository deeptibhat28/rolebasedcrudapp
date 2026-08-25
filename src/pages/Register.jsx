import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [showPassword, setShowPassword] = useState(false);
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
           <div className="relative">
                <input type={showPassword ? 'text' : 'password'}
                       value={password}
                       onChange={(e) => setPassword(e.target.value)} required
                       placeholder="Enter your password"
                       className="w-full px-4 py-3 bg-[#faf7fa] border border-[#ebd8e6] rounded-2xl text-sm text-[#2a1a33] focus:outline-none focus:ring-2 focus:ring-[#7a5a8c]"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-[#7a5a8c] hover:text-[#2a1a33]">
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )
                        }
                </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 bg-[#faf7fa] border border-[#ebd8e6] rounded-2xl text-sm text-[#2a1a33] focus:outline-none focus:ring-2 focus:ring-[#7a5a8c] appearance-none cursor-pointer"
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

