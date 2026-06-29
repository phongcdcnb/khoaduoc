import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDC6O9iXql4Geqcvnv45QRNQ4kLyXKGUT4",
  authDomain: "khoaduoc-6e94a.firebaseapp.com",
  projectId: "khoaduoc-6e94a",
  storageBucket: "khoaduoc-6e94a.firebasestorage.app",
  messagingSenderId: "232923757368",
  appId: "1:232923757368:web:39919416034f7e3843dfcd",
  measurementId: "G-XJNFSN192C"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
