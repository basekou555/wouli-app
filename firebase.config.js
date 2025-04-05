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
  apiKey: "AIzaSyB20Y1v-zIzwG5Urwiow2O3jJ5SeNom2NY",
  authDomain: "wouli-app.firebaseapp.com",
  databaseURL: "https://wouli-app-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "wouli-app",
  storageBucket: "wouli-app.firebasestorage.app",
  messagingSenderId: "741019699279",
  appId: "1:741019699279:web:0a9f46d20ea4f55107823a",
  measurementId: "G-ED8HYNVD0W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // Initialize Authentication
const db = getFirestore(app); // Initialize Firestore

export { auth, db }; // Export the initialized instances
