import React, {useState} from "react";
import { Link, useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-linear-to-br from-[#ebd5e2] to-[#cbb2d4] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl border border-white/55">
        <div className="text-center mb-8">
            
            <h1 className="text-3xl font-extrabold text-[#2a1a33]">Sign In</h1>
            <p className="text-sm text-[#7a5a8c] mt-1">Welcome to your secure management portal</p>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl">
                {error}
            </div>   
        )}

        <form onSubmit={handleLogin} className="space-y-5">
            <div>
                <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Username</label>
                <input type="username"
                       value={username}
                       onChange={(e) => setUsername(e.target.value)} required
                       placeholder="Enter your username"
                       className="w-full px-4 py-3 bg-[#faf7fa] border border-[#ebd8e6] rounded-2xl text-sm text-[#2a1a33] focus:outline-none focus:ring-2 focus:ring-[#7a5a8c]"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-[#7a5a8c] uppercase tracking-wider mb-1">Password</label>
                <input type="password"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)} required
                       placeholder="Enter your password"
                       className="w-full px-4 py-3 bg-[#faf7fa] border border-[#ebd8e6] rounded-2xl text-sm text-[#2a1a33] focus:outline-none focus:ring-2 focus:ring-[#7a5a8c]"
                />
            </div>

            <button type="submit" className="w-full py-3.5 bg-[#2a1a33] text-white rounded-2xl font-bold text-sm hover:bg-[#3d274c] transition duration-200 shadow-lg shadow-[#2a1a33]/20 mt-2">
                Log In Securely
            </button>
         </form> 

         <p className="text-center text-sm text-[#7a5a8c] mt-6">
          Don't have an account? <Link to="/register" className="text-[#2a1a33] font-bold hover:underline">Register</Link>
        </p>
   
        </div>
    </div>
);
}
