    import { initializeApp } from 'firebase/app';
    import { getFirestore } from 'firebase/firestore';
    import { getAuth } from 'firebase/auth';
    import { getStorage } from 'firebase/storage';
    import { getAnalytics } from 'firebase/analytics';


// Firebase configuration
apiKey: "AIzaSyABA70pKIC9DCMVQhsadHMzFEAhilgG1ww",
  authDomain: "wouli-453800.firebaseapp.com",
  databaseURL: "https://wouli-453800-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "wouli-453800",
  storageBucket: "wouli-453800.firebasestorage.app",
  messagingSenderId: "753627987327",
  appId: "1:753627987327:web:9d32200f19fd2380506e4a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;
try {
  analytics = getAnalytics(app);
} catch (error) {
  // Analytics might fail in environments without browser support
  console.log("Analytics not initialized:", error);
}

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
