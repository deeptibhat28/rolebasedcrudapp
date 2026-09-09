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
          "Username already exists. Please choose a different username",
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
        // Only log activity if the registered user is NOT an admin
        if (role !== "admin") {
          logActivity("USER_REGISTER", `New user registered: ${username} (${role})`, username);
        }

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
      <div 
        className="min-h-screen w-full flex items-center justify-center bg-[#150624] px-4 py-8 relative overflow-hidden"
        style={{ backgroundImage: "radial-gradient(circle at 20% 30%, rgba(105, 30, 150, 0.45) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(190, 40, 110, 0.35) 0%, transparent 50%), #150624" }}
      >
        <div className="relative w-full max-w-md bg-[#240b3b] backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-purple-500/30 text-center z-10">
          <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">
            Set Up Authenticator
          </h2>
          <p className="text-xs text-purple-200/80 mb-6 font-medium leading-relaxed">
            Scan this QR code <b className="text-orange-400">only once</b> using Google Authenticator on
            your phone. You won't need to scan it again when logging in!
          </p>

          {qrCodeUrl && (
            <div className="flex justify-center mb-6 bg-white p-4 rounded-2xl shadow-inner">
              <img src={qrCodeUrl} alt="2FA QR Code" className="w-44 h-44" />
            </div>
          )}

          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-linear-to-r from-orange-500 to-pink-600 hover:opacity-95 text-white font-bold rounded-xl transition duration-200 shadow-lg tracking-wider text-sm uppercase"
          >
            I've Scanned It, Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-[#240b3b] font-sans relative overflow-hidden m-0 p-0"
      style={{ backgroundImage: "radial-gradient(circle at 20% 30%, rgba(105, 30, 150, 0.45) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(190, 40, 110, 0.35) 0%, transparent 50%), #240b3b" }}
    >

      <div className="w-full h-screen flex items-center justify-between relative">

        <div className="w-full h-full bg-transparent px-8 md:px-24 flex flex-col justify-center text-white relative z-10">
          <div className="flex space-x-1.5 mb-5">
            <div className="w-3.5 h-3.5 bg-white rounded-sm"></div>
            <div className="w-3.5 h-3.5 bg-white/60 rounded-sm"></div>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-3 text-white">
            Join Us!
          </h1>
          <div className="w-16 h-1 bg-orange-500 rounded-full mb-6"></div>
          <p className="text-purple-200/80 text-sm md:text-lg leading-relaxed max-w-lg">
            Create your account to access role-based administration tools, securely manage workflows, and collaborate seamlessly.
          </p>
        </div>

        <div className="absolute right-6 md:right-90 w-[320px] md:w-100 bg-[#2e1048]/95 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-purple-500/30 shadow-2xl z-20">
          <h2 className="text-xl font-bold text-white text-center mb-6 tracking-wide">
            CREATE ACCOUNT
          </h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Username"
                className="w-full px-4 py-3 rounded-full bg-[#1b082d] border border-purple-500/40 text-white placeholder-purple-400/40 focus:outline-none focus:border-orange-500 text-sm transition shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-full bg-[#1b082d] border border-purple-500/40 text-white placeholder-purple-400/40 focus:outline-none focus:border-orange-500 text-sm transition shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-300/80 uppercase tracking-widest mb-1.5">
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-full bg-[#1b082d] border border-purple-500/40 text-white focus:outline-none focus:border-orange-500 text-sm cursor-pointer shadow-inner [&>option]:bg-[#240b3b] [&>option]:text-white"
              >
                <option value="user">Normal User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3 bg-linear-to-r from-orange-500 to-pink-600 hover:opacity-95 text-white font-bold rounded-full transition duration-150 shadow-lg text-sm tracking-widest uppercase"
            >
              Register Now
            </button>
          </form>

          <div className="text-center mt-5">
            <p className="text-xs text-purple-300/70">
              Already have an account?{" "}
              <Link to="/" className="text-orange-400 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}