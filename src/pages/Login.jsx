import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { toast } from "react-toastify";
import TwoFactorVerifyLogin from "../components/TwoFactorVerifyLogin";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.warn("Please fill in all required fields.");
      return;
    }

    try {
      const user = await loginUser(username, password);
      if (user) {
        if (user.totpSecret) {
          setPendingUser(user);
          toast.info("Please enter your 2FA verification code.");
        } else {
          localStorage.setItem("tempUserId", user.id);
          toast.info("Please set up Two-Factor Authentication for your account.");
          navigate("/setup-2fa");
        }
      } else {
        toast.error("Invalid username or password");
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  if (pendingUser) {
    return (
      <TwoFactorVerifyLogin
        user={pendingUser}
        onLoginSuccess={() => {
          localStorage.setItem("user", JSON.stringify(pendingUser));
          toast.success("Logged in successfully!");

          if (pendingUser.role === "admin") {
            navigate("/admin-dashboard");
          } else {
            navigate("/user-dashboard");
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#1a0b2e] px-4 py-8 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/35 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-5xl bg-[#28133f] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 md:p-16 border border-purple-900/50 z-10">
        <div className="w-full md:w-1/2 mb-10 md:mb-0 text-left z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wide mb-4">
            Welcome!
          </h1>

          <p className="text-purple-200/70 text-sm md:text-base leading-relaxed mb-8 max-w-sm">
            A secure, role-based management platform designed to streamline
            administrative workflows and secure access control.
          </p>
        </div>

        <div className="w-full md:w-1/2 flex justify-end z-10">
          <div className="bg-white/10 backdrop-blur-md p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md border border-white/10">
            <h1 className="text-2xl font-bold text-white mb-6 text-center">
              Sign In
            </h1>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="mb-4">
                <label className="block text-xs font-semibold text-purple-200 uppercase tracking-wider mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-purple-200 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-purple-300 hover:text-white"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-linear-to-r from-red-500 to-orange-500 hover:opacity-95 text-white font-semibold rounded-lg transition duration-200 shadow-lg tracking-wide text-sm"
              >
                Log In Securely
              </button>
            </form>

            <p className="text-center text-sm text-purple-200/70 mt-6">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-white font-bold hover:underline"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
