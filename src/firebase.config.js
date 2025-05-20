
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA73IFRHXnSsQpr4YjEOQ4V0AP-vZgWTcU",
  authDomain: "wouli-app.firebaseapp.com",
  projectId: "wouli-app",
  storageBucket: "wouli-app.appspot.com",
  messagingSenderId: "781812894678",
  appId: "1:781812894678:web:ecf210c91d7542fa9d1974",
  measurementId: "G-CWEQCP7FXD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
