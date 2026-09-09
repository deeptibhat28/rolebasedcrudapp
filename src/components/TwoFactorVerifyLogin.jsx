import React, { useState } from "react";
import * as OTPAuth from "otpauth";
import { toast } from "react-toastify";

function TwoFactorVerifyLogin({ user, username, onLoginSuccess }) {
  const [token, setToken] = useState("");

  const handleVerifyLogin = (e) => {
    e.preventDefault();

    if (!user.totpSecret) {
      toast.error("No 2FA secret found for this account.");
      return;
    }

    const totp = new OTPAuth.TOTP({
      issuer: "RoleBasedApp",
      label: user.username,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(user.totpSecret),
    });

    const delta = totp.validate({ token: token, window: 1 });

    if (delta !== null) {
      onLoginSuccess();
    } else {
      toast.error("Invalid or expired 30-second code. Try again.");
    }
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md bg-[#2e1048]/95 backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl border border-purple-500/30 text-white z-10 mx-auto">
      <h2 className="text-xl sm:text-2xl font-extrabold mb-2 text-center text-white tracking-wide">
        Two-Factor Authentication
      </h2>

      <p className="text-xs text-purple-300/80 mb-6 text-center leading-relaxed font-medium">
        Open your authenticator app and enter the current 6-digit code
        (refreshes every 30s).
      </p>

      <form onSubmit={handleVerifyLogin} className="space-y-5">
        <div>
          <p className="block text-xs font-bold text-white uppercase tracking-wider mb-2 text-center px-2">
            Hey {username || user?.username}! Enter your verification code.
          </p>

          <input
            type="text"
            maxLength="6"
            placeholder="000000"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full px-4 py-3.5 rounded-full bg-[#1b082d]/70 border border-purple-500/40 text-white text-center tracking-[0.4em] sm:tracking-[0.5em] text-lg sm:text-xl placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-inner"
            autoFocus
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-linear-to-r from-orange-500 to-pink-600 hover:opacity-95 text-white font-bold rounded-full transition duration-150 shadow-lg text-sm tracking-widest uppercase cursor-pointer"
        >
          Verify & Login
        </button>
      </form>
    </div>
  );
}

export default TwoFactorVerifyLogin;