// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";  // Import for Authentication
import { getFirestore } from "firebase/firestore";  // Import for Firestore
import {firebase} from "@react-native-firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAey9QSbnFR4PiCbjzulx_Cs1YUFPaxZSE",
    authDomain: "spm-app-da854.firebaseapp.com",
    projectId: "spm-app-da854",
    storageBucket: "spm-app-da854.appspot.com",
    messagingSenderId: "593751946647",
    appId: "1:593751946647:web:2559e7dd430367b47500d2",
    measurementId: "G-T072E6FPH9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);  // Initialize Authentication
const db = getFirestore(app);  // Initialize Firestore

// Export the initialized services
export { app, auth, db, analytics };
