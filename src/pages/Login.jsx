import React, {useState} from "react";
import { useNavigate } from 'react-router-dom';
import { loginUser } from "../services/api";

export default function Login() {

const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const navigate = useNavigate();

const handleLogin = async (e) => {
    e.preventDefault();

    try {
        const user = await loginUser(username, password);
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));

            if (user.role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/user-dashboard');
            }
        } else {
            setError('Invalid username or password');
        }
    } catch (error) {
        setError('Something went wrong. Make sure the server is running!');
    }
};

return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 px-4">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-orange-100">
        <div className="text-center mb-10">
            <div className="inline-block p-4 bg-orange-100 rounded-full text-orange-500 mb-4 shadow-inner border border-orange-200/50">
            <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
            </svg>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Sign In</h2>
            <p className="text-base text-gray-600 mt-2">Welcome to your secure management portal</p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded-r-xl shadow-sm">
                {error}
            </div>   
        )}

        <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Username</label>
                <input type="username"
                       value={username}
                       onChange={(e) => setUsername(e.target.value)} required
                       placeholder="Enter your username"
                       className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition duration-200 shadow-inner"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
                <input type="password"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)} required
                       placeholder="Enter your password"
                       className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition duration-200 shadow-inner"
                />
            </div>

            <button type="submit" className="w-full py-4 px-6 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5">
                Log In Securely
            </button>
         </form> 

         <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-100 pt-5">
            Role-Based CRUD | 2026 Portal
            </div>   
        </div>
    </div>
);
}
