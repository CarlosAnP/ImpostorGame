// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDpOjXUUCh49Xgx3rFah-empz3-hvxrFFo",
    authDomain: "impostorgame-69fc1.firebaseapp.com",
    projectId: "impostorgame-69fc1",
    storageBucket: "impostorgame-69fc1.firebasestorage.app",
    messagingSenderId: "906580806642",
    appId: "1:906580806642:web:509a2475af5a5194ad396b",
    measurementId: "G-9ECT1XXL5F"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);