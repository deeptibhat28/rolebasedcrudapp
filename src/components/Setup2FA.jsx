import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import * as OTPAuth from "otpauth";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_URL = "https://6a90168dff2484963a5db61a.mockapi.io";

function Setup2FA({ user: propUser, onUpdateUser }) {
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [secretObj, setSecretObj] = useState(null);
  const [otpUri, setOtpUri] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [user, setUser] = useState(propUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      const tempId = localStorage.getItem("tempUserId");
      if (tempId) {
        axios
          .get(`${API_URL}/users/${tempId}`)
          .then((res) => setUser(res.data))
          .catch((err) => {
            console.error("Failed to fetch user for 2FA setup", err);
            toast.error("Session error. Please log in again.");
            navigate("/login");
          });
      } else {
        navigate("/login");
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && !secretObj) {
      const savedSecret = sessionStorage.getItem(`temp_secret_${user.id}`);
      let secret;

      if (savedSecret) {
        secret = OTPAuth.Secret.fromBase32(savedSecret);
      } else {
        secret = new OTPAuth.Secret({ size: 20 });
        sessionStorage.setItem(`temp_secret_${user.id}`, secret.base32);
      }

      setSecretObj(secret);

      const totp = new OTPAuth.TOTP({
        issuer: "RoleBasedApp",
        label: user.username,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: secret,
      });

      setOtpUri(totp.toString());
      setIsSetupOpen(true);
    }
  }, [user, secretObj]);

  if (!user) {
    return <div className="p-8 text-center text-white">Loading setup...</div>;
  }

  const handleStartSetup = () => {
    let secret;
    if (user.totpSecret) {
      secret = OTPAuth.Secret.fromBase32(user.totpSecret);
    } else {
      secret = new OTPAuth.Secret({ size: 20 });
    }

    setSecretObj(secret);

    const totp = new OTPAuth.TOTP({
      issuer: "RoleBasedApp",
      label: user.username,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: secret,
    });

    setOtpUri(totp.toString());
    setIsSetupOpen(true);
  };

  const handleVerifyAndSave = async (e) => {
    e.preventDefault();

    const totp = new OTPAuth.TOTP({
      issuer: "RoleBasedApp",
      label: user.username,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: secretObj,
    });

    const delta = totp.validate({ token: tokenInput, window: 2 });

    if (delta !== null) {
      try {
        const response = await axios.put(`${API_URL}/users/${user.id}`, {
          ...user,
          totpSecret: secretObj.base32,
          is2FAEnabled: true,
        });

        sessionStorage.removeItem(`temp_secret_${user.id}`);
        localStorage.removeItem("tempUserId");

        localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("currentUser", JSON.stringify(response.data));

        toast.success(
          "2FA successfully enabled and logged in!.",
        );

        navigate("/user-dashboard");

        setIsSetupOpen(false);
        onUpdateUser(response.data);
      } catch (err) {
        console.error("Failed to save 2FA", err);
        // toast.error("Error saving 2Fa status to server.");
      }
    } else {
      toast.error(
        "Invalid or expired code. Please check your authenticator app and try again.",
      );
    }
  };

 return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9B2BC] px-4 py-8 relative overflow-hidden text-[#4a242c]">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#F67C8E]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-[#FCD3DC] backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-md w-full relative z-10 border border-white/60">
        <h3 className="text-lg font-extrabold text-[#4a242c] mb-2">
          Two-Factor Authentication (2FA)
        </h3>
        <p className="text-sm text-[#68333e]/80 mb-4">
          Status:{" "}
          {user?.is2FAEnabled ? (
            <span className="text-green-700 font-semibold">Enabled</span>
          ) : (
            <span className="text-red-600 font-semibold">Disabled</span>
          )}
        </p>

        {!user?.is2FAEnabled && !isSetupOpen && (
          <button
            onClick={handleStartSetup}
            className="w-full bg-[#F45B73] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#E04860] transition shadow-md"
          >
            Set Up 2FA
          </button>
        )}

        {isSetupOpen && (
          <div className="mt-4 border-t border-[#D58C99] pt-4 flex flex-col items-center">
            <p className="text-xs text-[#68333e]/80 text-center mb-3">
              Scan this QR Code. The code changes every 30 seconds.
            </p>

            <div className="p-3 bg-white border border-[#D58C99] rounded-2xl shadow-md mb-4">
              <QRCodeSVG value={otpUri} size={150} />
            </div>

            <form
              onSubmit={handleVerifyAndSave}
              className="w-full flex flex-col items-center"
            >
              <input
                type="text"
                maxLength="6"
                placeholder="Enter 6-digit code"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full px-4 py-2 bg-[#F6B8C2]/40 border border-[#D58C99] rounded-xl text-xs text-[#4a242c] placeholder-[#8C4A56] text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#F45B73] mb-3"
              />
              <button
                type="submit"
                className="w-full bg-[#F45B73] hover:bg-[#E04860] text-white py-2.5 rounded-xl text-xs font-bold transition shadow-md"
              >
                Confirm & Enable
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
export default Setup2FA;