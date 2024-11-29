// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Replace with your Firebase project's config
const firebaseConfig = {
  apiKey: "AIzaSyB5ZrpPnHXDGK60oh2E_3LyVMeS6scUDCc",
  authDomain: "dco-dare.firebaseapp.com",
  projectId: "dco-dare",
  storageBucket: "dco-dare.firebasestorage.app",
  messagingSenderId: "521137193796",
  appId: "1:521137193796:web:7cbc4d4baa78778e088d11",
  measurementId: "G-BWFPXQXBLR",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

export { app, auth };
