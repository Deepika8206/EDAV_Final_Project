// src/firebase.ts (Updated)

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <-- ADD THIS IMPORT

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6GsOBDkyl5dzG323LOShz4aAZ3c74efs",
  authDomain: "edav-login.firebaseapp.com",
  projectId: "edav-login",
  storageBucket: "edav-login.firebasestorage.app",
  messagingSenderId: "627348606390",
  appId: "1:627348606390:web:5c9f76e6977549668a8517",
  measurementId: "G-MB41VG9T06"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Optional: if you're using analytics

export const auth = getAuth(app);
export const db = getFirestore(app); // <-- ADD THIS LINE TO INITIALIZE FIRESTORE AND EXPORT IT