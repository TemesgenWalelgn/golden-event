// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDI92Tno_5LkTfjAzE04uX3RAwsrizXZA4",
  authDomain: "golden-event.firebaseapp.com",
  projectId: "edom-gallery",
  storageBucket: "golden-event.firebasestorage.app",
  messagingSenderId: "1022200981405",
  appId: "1:1022200981405:web:bb7e3c871c2aa71e69f174",
  measurementId: "G-8FFEXS2RG1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
const analytics = getAnalytics(app);