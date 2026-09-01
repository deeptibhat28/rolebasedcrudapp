import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import * as OTPAuth from "otpauth";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "https://6a90168dff2484963a5db61a.mockapi.io";

function Setup2FA({ user, onUpdateUser }) {
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [secretObj, setSecretObj] = useState(null);
  const [otpUri, setOtpUri] = useState("");
  const [tokenInput, setTokenInput] = useState("");

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

    const delta = totp.validate({ token: tokenInput, window: 1 });

    if (delta !== null) {
      try {
        const response = await axios.put(`${API_URL}/users/${user.id}`, {
          ...user,
          totpSecret: secretObj.base32,
          is2FAEnabled: true,
        });

        toast.success(
          "2FA successfully enabled! Your OTP now refreshes every 30 seconds.",
        );

        setIsSetupOpen(false);
        onUpdateUser(response.data);
      } catch (err) {
        console.error("Failed to save 2FA", err);
        toast.error("Error saving 2Fa status to server.");
      }
    } else {
      toast.error(
        "Invalid or expired code. Please check your authenticator app and try again.",
      );
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow max-w-md mx-auto my-4 border">
      <h3 className="text-lg font-bold mb-2">
        Two-Factor Authentication (2FA)
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Status:{" "}
        {user.is2FAEnabled ? (
          <span className="text-green-600 font-semibold">Enabled</span>
        ) : (
          <span className="text-red-500 font-semibold">Disabled</span>
        )}
      </p>

      {!user.is2FAEnabled && !isSetupOpen && (
        <button
          onClick={handleStartSetup}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Set Up 2FA
        </button>
      )}

      {isSetupOpen && (
        <div className="mt-4 border-t pt-4 flex flex-col items-center">
          <p className="text-sm text-center mb-3">
            Scan this QR Code. The code changes every 30 seconds.
          </p>

          <div className="p-2 bg-white border rounded shadow mb-4">
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
              className="w-40 p-2 border rounded text-center tracking-widest mb-3"
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Confirm & Enable
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Setup2FA;
