// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // Import Authentication
import { getFirestore } from "firebase/firestore"; // Import Firestore

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyABA70pKIC9DCMVQhsadHMzFEAhilgG1ww",
  authDomain: "wouli-453800.firebaseapp.com",
  projectId: "wouli-453800",
  storageBucket: "wouli-453800.firebasestorage.app",
  messagingSenderId: "753627987327",
  appId: "1:753627987327:web:9d32200f19fd2380506e4a"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // Initialize Authentication
const db = getFirestore(app); // Initialize Firestore

export { auth, db }; // Export the initialized instances
