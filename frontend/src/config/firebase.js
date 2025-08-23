// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDz8J1Cg3Gl6lAR3DkHgOLa5stADj9JYuE",
  authDomain: "memex-f4b4c.firebaseapp.com",
  projectId: "memex-f4b4c",
  storageBucket: "memex-f4b4c.firebasestorage.app",
  messagingSenderId: "91265950164",
  appId: "1:91265950164:web:6c0bb5634a58d5ff417641",
  measurementId: "G-0NBCSBX3CP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the services for use in other components
export { app, analytics, auth, db, storage };
export default app;
