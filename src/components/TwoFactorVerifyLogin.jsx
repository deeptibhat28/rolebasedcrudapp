import React, { useState } from "react";
import * as OTPAuth from "otpauth";
import { toast } from "react-toastify";

function TwoFactorVerifyLogin({ user, onLoginSuccess }) {
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
      // toast.success("2FA verification successfully!");
      onLoginSuccess();
    } else {
      toast.error("Invalid or expired 30-second code. Try again.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#1a0b2e] px-4 py-8 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/35 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-[#28133f] rounded-3xl shadow-2xl overflow-hidden p-8 md:p-10 border border-purple-900/50 z-10 text-white">
        <h2 className="text-2xl font-bold mb-2 text-center">
          Two-Factor Authentication
        </h2>
        <p className="text-sm text-purple-200/70 mb-6 text-center leading-relaxed">
          Open your authenticator app and enter the current 6-digit code
          (refreshes every 30s).
        </p>

        <form onSubmit={handleVerifyLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-purple-200 uppercase tracking-wider mb-2 text-center">
              Verification Code
            </label>
            <input
              type="text"
              maxLength="6"
              placeholder="000000"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white text-center tracking-[0.5em] text-xl placeholder-purple-300/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-linear-to-r from-red-500 to-orange-500 hover:opacity-95 text-white font-semibold rounded-lg transition duration-200 shadow-lg tracking-wide text-sm"
          >
            Verify & Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default TwoFactorVerifyLogin;
