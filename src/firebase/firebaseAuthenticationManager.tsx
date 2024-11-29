import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import axios from "axios";
import { auth } from "./firebaseConfig"; // Your Firebase configuration

const AuthenticationManager: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [tempToken, setTempToken] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [show2FASetup, setShow2FASetup] = useState<boolean>(false);
  const [showOTPVerification, setShowOTPVerification] =
    useState<boolean>(false);

  const apiUrl = "http://localhost:8000/auth/";

  const handleLogin = async (): Promise<void> => {
    setLoading(true);
    setMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();

      const response = await axios.post(`${apiUrl}login/`, {
        id_token: idToken,
        email,π
        password,
      });

      if (response.data.setup_2fa_required) {
        setTempToken(response.data.temp_token);
        setMessage("Login successful! Please set up 2FA or skip it.");
        setShow2FASetup(true);
        setShowOTPVerification(false);
      } else if (response.data.otp_required) {
        setTempToken(response.data.temp_token);
        setMessage("Login successful! Verify OTP to continue.");
        setShow2FASetup(false);
        setShowOTPVerification(true);
      } else {
        setMessage(`Login successful! Token: ${response.data.token}`);
        setShow2FASetup(false);
        setShowOTPVerification(false);
      }
    } catch (error: any) {
      console.error("Error during login:", error);
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async (skip: boolean = false): Promise<void> => {
    setLoading(true);
    setMessage("");
    setQrCode("");

    try {
      const response = await axios.post(`${apiUrl}setup-2fa/`, {
        skip_2fa: skip,
        temp_token: tempToken,
      });

      if (skip) {
        setMessage("2FA setup skipped. You can now log in without 2FA.");
        setShow2FASetup(false);
      } else {
        setQrCode(response.data.qr_code);
        setMessage("2FA setup successful! Scan the QR code below.");
      }
    } catch (error: any) {
      console.error("Error setting up 2FA:", error);
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (): Promise<void> => {
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(`${apiUrl}verify-otp/`, {
        otp,
        temp_token: tempToken,
      });
      setMessage(`Login successful! Token: ${response.data.token}`);
      setShowOTPVerification(false);
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Authentication Manager</h2>

      <div>
        <h3>Login</h3>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Logging In..." : "Login"}
        </button>
      </div>

      {show2FASetup && (
        <div>
          <h3>Setup 2FA</h3>
          <button onClick={() => handleSetup2FA(false)} disabled={loading}>
            {loading ? "Setting Up..." : "Setup 2FA"}
          </button>
          <button onClick={() => handleSetup2FA(true)} disabled={loading}>
            {loading ? "Skipping..." : "Skip 2FA"}
          </button>
          {qrCode && (
            <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" />
          )}
        </div>
      )}

      {showOTPVerification && (
        <div>
          <h3>Verify OTP</h3>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleVerifyOTP} disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

export default AuthenticationManager;
