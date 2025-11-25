// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA5NSXjrfmZvSdKdLPEQWFaWrmF5MR3Q9E",
  authDomain: "wordquestproject.firebaseapp.com",
  projectId: "wordquestproject",
  storageBucket: "wordquestproject.firebasestorage.app",
  messagingSenderId: "264044817910",
  appId: "1:264044817910:web:6ebeff42cf96c0df0fabd7",
  measurementId: "G-EWFLN5KXB1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (optional)
let analytics;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.warn('Analytics not available:', error);
}

// Initialize Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, app };