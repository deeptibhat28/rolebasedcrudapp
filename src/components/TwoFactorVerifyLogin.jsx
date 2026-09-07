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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9B2BC] px-4 py-8 relative overflow-hidden text-[#4a242c]">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#F67C8E]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-[#FCD3DC] backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden p-8 md:p-10 border border-white/60 z-10">
        <h2 className="text-2xl font-extrabold mb-2 text-center text-[#4a242c]">
          Two-Factor Authentication
        </h2>
        <p className="text-sm text-[#68333e]/80 mb-6 text-center leading-relaxed">
          Open your authenticator app and enter the current 6-digit code
          (refreshes every 30s).
        </p>

        <form onSubmit={handleVerifyLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#5c2d36] uppercase tracking-wider mb-2 text-center">
              Verification Code
            </label>
            <input
              type="text"
              maxLength="6"
              placeholder="000000"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#F6B8C2]/40 border border-[#D58C99] text-[#4a242c] text-center tracking-[0.5em] text-xl placeholder-[#8C4A56]/40 focus:outline-none focus:ring-2 focus:ring-[#F45B73]"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#F45B73] hover:bg-[#E04860] text-white font-bold rounded-xl transition duration-200 shadow-md tracking-wide text-sm"
          >
            Verify & Login
          </button>
        </form>
      </div>
    </div>
  );
}
export default TwoFactorVerifyLogin;