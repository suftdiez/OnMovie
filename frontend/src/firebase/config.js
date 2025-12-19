// Firebase Configuration
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDmoReZd9LjmpkoCf7-NtgJuOQu8Yu8dfc",
  authDomain: "onmovie-944fa.firebaseapp.com",
  projectId: "onmovie-944fa",
  storageBucket: "onmovie-944fa.firebasestorage.app",
  messagingSenderId: "162579440358",
  appId: "1:162579440358:web:9faa0061e3ca859108d127"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
