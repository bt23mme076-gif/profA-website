import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBWrEskcoB_HN0eZsqbel9OdnQtNINdoy4",
  authDomain: "iim-a-website.firebaseapp.com",
  projectId: "iim-a-website",
  storageBucket: "iim-a-website.firebasestorage.app",
  messagingSenderId: "619885905929",
  appId: "1:619885905929:web:c81c9c42a1822c7b00d0d8",
  measurementId: "G-14Y43LYH0X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
