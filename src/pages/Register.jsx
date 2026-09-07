import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, getUsers } from "../services/api";
import { toast } from "react-toastify";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { logActivity } from "../utils/logger";


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
        logActivity("USER_REGISTER", `New user registered: ${username} (${role})`, username);
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
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F9B2BC] px-4 py-8 relative overflow-hidden">
        {/* Soft ambient lighting effects */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#F67C8E]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative w-full max-w-md bg-[#FCD3DC] backdrop-blur-md rounded-3xl shadow-xl p-8 border border-white/60 text-center z-10">
          <h2 className="text-2xl font-bold text-[#4a242c] mb-2">
            Set Up Authenticator
          </h2>
          <p className="text-xs text-[#68333e] mb-6 font-medium">
            Scan this QR code <b>only once</b> using Google Authenticator on
            your phone. You won't need to scan it again when logging in!
          </p>

          {qrCodeUrl && (
            <div className="flex justify-center mb-6 bg-white p-4 rounded-2xl shadow-md">
              <img src={qrCodeUrl} alt="2FA QR Code" className="w-44 h-44" />
            </div>
          )}

          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-[#F45B73] hover:bg-[#E04860] text-white font-bold rounded-xl transition duration-200 shadow-md tracking-wide text-sm"
          >
            I've Scanned It, Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9B2BC] px-4 py-8 relative overflow-hidden">
     
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#F67C8E]/20 rounded-full blur-3xl pointer-events-none"></div>

      
      <div className="relative w-full max-w-5xl bg-[#FCD3DC] backdrop-blur-md rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 md:p-16 border border-white/60 z-10">
        <div className="w-full md:w-1/2 mb-10 md:mb-0 text-left z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#4a242c] tracking-wide mb-4 drop-shadow-sm">
            Join Us!
          </h1>
          <p className="text-[#68333e] text-sm md:text-base leading-relaxed mb-8 max-w-sm font-medium">
            Create your account to access role-based administration tools,
            securely manage workflows, and collaborate seamlessly.
          </p>
        </div>

        <div className="w-full md:w-1/2 flex justify-end z-10">
          
          <div className="bg-[#F6B8C2]/90 backdrop-blur-md p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md border border-white/50">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-[#4a242c]">Create Account</h1>
              <p className="text-xs text-[#68333e] mt-1 font-medium">
                Sign up to get started
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5c2d36] uppercase tracking-wider mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter username"
                  className="w-full px-4 py-3 rounded-xl bg-white/60 border border-[#E899A4] text-[#4a242c] placeholder-[#945762] focus:outline-none focus:ring-2 focus:ring-[#F45B73] text-sm shadow-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5c2d36] uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-[#E899A4] text-[#4a242c] placeholder-[#945762] focus:outline-none focus:ring-2 focus:ring-[#F45B73] text-sm shadow-sm transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-[#5c2d36] hover:text-[#4a242c]"
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
                <label className="block text-xs font-semibold text-[#5c2d36] uppercase tracking-wider mb-2">
                  Account Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/60 border border-[#E899A4] text-[#4a242c] focus:outline-none focus:ring-2 focus:ring-[#F45B73] text-sm cursor-pointer shadow-sm [&>option]:bg-[#F6B8C2] [&>option]:text-[#4a242c]"
                >
                  <option value="user">Normal User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#F45B73] hover:bg-[#E04860] text-white font-bold rounded-xl transition duration-200 shadow-md tracking-wide text-sm mt-2"
              >
                Register Now
              </button>
            </form>

            <p className="text-center text-sm text-[#5c2d36] mt-6">
              Already have an account?{" "}
              <Link to="/" className="text-[#4a242c] font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}