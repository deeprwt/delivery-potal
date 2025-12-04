import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDZdTTMQmGzuyMoaZdqJYllPbKlR5CKVCQ",
  authDomain: "delivery-potal.firebaseapp.com",
  projectId: "delivery-potal",
  storageBucket: "delivery-potal.firebasestorage.app",
  messagingSenderId: "518221279870",
  appId: "1:518221279870:web:553ee9246a7bed9287de2f",
  measurementId: "G-M5WT8L53K8"
};

// Prevent re-initialize in Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const microsoftProvider = new OAuthProvider("microsoft.com");
export const db = getFirestore(app);
export const storage = getStorage(app);
