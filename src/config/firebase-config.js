// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDYU1WH0Z5gq02PnAgshgddTQVaBn6L85U",
    authDomain: "server-firebase-14dd9.firebaseapp.com",
    projectId: "server-firebase-14dd9",
    storageBucket: "server-firebase-14dd9.appspot.com",
    messagingSenderId: "861725919598",
    appId: "1:861725919598:web:70c05626a8f270db3d197f",
    measurementId: "G-EGKHGT6B85"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export {firebaseConfig};