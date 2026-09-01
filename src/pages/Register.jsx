import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, getUsers } from "../services/api";
import { toast } from "react-toastify";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.warn("Please fill in all required fields.");
      return;
    }

    try {
      const users = await getUsers();
      const existingUser = users.find(
        (user) => user.username.toLowerCase() === username.toLowerCase(),
      );

      if (existingUser) {
        toast.error(
          "Username already exists. Please choose a diiferent username",
        );
        setUsername("");
        setPassword("");
        return;
      }

      let secret = new OTPAuth.Secret({ size: 20 });

      let totp = new OTPAuth.TOTP({
        issuer: "RoleBasedApp",
        label: username,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: secret,
      });

      const qrDataUrl = await QRCode.toDataURL(totp.toString());

      const newUser = {
        username,
        password,
        role,
        totpSecret: secret.base32,
      };

      const response = await registerUser(newUser);
      if (response) {
        setQrCodeUrl(qrDataUrl);
        setIsRegistered(true);
        toast.success(
          "Registration successful! Scan this QR code with Google Authenticator.",
        );
      } else {
        toast.error("Registration failed.");
      }
    } catch (error) {
      console.error("CRITICAL ERROR:", error);
      toast.error("Registration failed. Please try again.");
    }
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#1a0b2e] px-4 py-8 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/35 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative w-full max-w-md bg-[#28133f] rounded-3xl shadow-2xl p-8 border border-purple-900/50 text-center z-10">
          <h2 className="text-2xl font-bold text-white mb-2">
            Set Up Authenticator
          </h2>
          <p className="text-xs text-purple-200/70 mb-6">
            Scan this QR code <b>only once</b> using Google Authenticator on
            your phone. You won't need to scan it again when logging in!
          </p>

          {qrCodeUrl && (
            <div className="flex justify-center mb-6 bg-white p-4 rounded-2xl inline-block shadow-lg">
              <img src={qrCodeUrl} alt="2FA QR Code" className="w-44 h-44" />
            </div>
          )}

          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-linear-to-r from-red-500 to-orange-500 hover:opacity-95 text-white font-semibold rounded-lg transition duration-200 shadow-lg tracking-wide text-sm"
          >
            I've Scanned It, Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#1a0b2e] px-4 py-8 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/35 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-5xl bg-[#28133f] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 md:p-16 border border-purple-900/50 z-10">
        <div className="w-full md:w-1/2 mb-10 md:mb-0 text-left z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wide mb-4">
            Join Us!
          </h1>
          <p className="text-purple-200/70 text-sm md:text-base leading-relaxed mb-8 max-w-sm">
            Create your account to access role-based administration tools,
            securely manage workflows, and collaborate seamlessly.
          </p>
        </div>

        <div className="w-full md:w-1/2 flex justify-end z-10">
          <div className="bg-white/10 backdrop-blur-md p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md border border-white/10">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white">Create Account</h1>
              <p className="text-xs text-purple-200/70 mt-1">
                Sign up to get started
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-purple-200 uppercase tracking-wider mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter username"
                  className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                />
              </div>

              <div>
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

              <div>
                <label className="block text-xs font-semibold text-purple-200 uppercase tracking-wider mb-2">
                  Account Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm cursor-pointer [&>option]:bg-[#28133f] [&>option]:text-white"
                >
                  <option value="user">Normal User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-linear-to-r from-red-500 to-orange-500 hover:opacity-95 text-white font-semibold rounded-lg transition duration-200 shadow-lg tracking-wide text-sm mt-2"
              >
                Register Now
              </button>
            </form>

            <p className="text-center text-sm text-purple-200/70 mt-6">
              Already have an account?{" "}
              <Link to="/" className="text-white font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
