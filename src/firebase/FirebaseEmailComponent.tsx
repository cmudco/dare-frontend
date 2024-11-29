import React, { useState } from "react";
import {
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import axios from "axios";
import { auth } from "./firebaseConfig"; // Import initialized Firebase Auth

const VerifyEmailComponent: React.FC = () => {
  const [email, setEmail] = useState<string>(""); // User email
  const [password, setPassword] = useState<string>(""); // Temporary password for backend
  const [firebaseUid, setFirebaseUid] = useState<string>(""); // Firebase UID for verification
  const [message, setMessage] = useState<string>(""); // Success/Error messages
  const [loading, setLoading] = useState<boolean>(false); // Loading state

  const apiUrl = "http://localhost:8000/auth/";

  // Function to send a verification email
  const handleSendVerificationEmail = async (): Promise<void> => {
    setLoading(true);
    setMessage("");

    try {
      // Log in the user with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Send verification email
      await sendEmailVerification(user);
      setMessage(
        `Verification email sent to ${email}. Please check your inbox.`
      );

      // Log the user out after sending the verification email
      await signOut(auth);
    } catch (error: any) {
      console.error("Error during email verification:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to verify email via the backend
  const handleVerifyEmail = async (): Promise<void> => {
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(`${apiUrl}verify-email/`, {
        firebase_uid: firebaseUid,
      });
      setMessage(response.data.message);
    } catch (error: any) {
      console.error("Error verifying email:", error);
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new user
  const handleCreateUser = async (): Promise<void> => {
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(`${apiUrl}create-user/`, {
        email,
        password,
        role: "user",
      });
      setFirebaseUid(response.data.firebase_uid); // Store the Firebase UID for verification
      setMessage("User created successfully!");
    } catch (error: any) {
      console.error("Error creating user:", error);
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to trigger password reset email
  const handleTriggerPasswordReset = async (): Promise<void> => {
    setLoading(true);
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(`Password reset email sent to ${email}.`);
    } catch (error: any) {
      console.error("Error during password reset:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to confirm password reset

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        maxWidth: "500px",
        margin: "20px auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h3 style={{ textAlign: "center", color: "#333" }}>
        Authentication Manager
      </h3>

      <div style={{ marginBottom: "15px" }}>
        <label>Email:</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            margin: "5px 0",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Password:</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            margin: "5px 0",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Firebase UID (for verification):</label>
        <input
          type="text"
          placeholder="Enter Firebase UID"
          value={firebaseUid}
          onChange={(e) => setFirebaseUid(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            margin: "5px 0",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <button onClick={handleCreateUser} disabled={loading}>
          {loading ? "Creating User..." : "Create User"}
        </button>
        <button onClick={handleSendVerificationEmail} disabled={loading}>
          {loading ? "Sending..." : "Send Verification Email"}
        </button>
        <button onClick={handleVerifyEmail} disabled={loading}>
          {loading ? "Verifying..." : "Verify Email"}
        </button>
        <button onClick={handleTriggerPasswordReset} disabled={loading}>
          {loading ? "Sending Reset Email..." : "Trigger Password Reset"}
        </button>
      </div>

      {message && <p style={{ marginTop: "20px", color: "blue" }}>{message}</p>}
    </div>
  );
};

export default VerifyEmailComponent;
