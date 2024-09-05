import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAey9QSbnFR4PiCbjzulx_Cs1YUFPaxZSE",
    authDomain: "spm-app-da854.firebaseapp.com",
    projectId: "spm-app-da854",
    storageBucket: "spm-app-da854.appspot.com",
    messagingSenderId: "593751946647",
    appId: "1:593751946647:web:2559e7dd430367b47500d2",
    measurementId: "G-T072E6FPH9"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);

const auth = getAuth(app);

export { app, db, auth };