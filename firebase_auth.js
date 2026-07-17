import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyB9nRwYG-geFQnAR2vL9sSoGwJy8UtOE58",
    authDomain: "agrawal-samaj-samiti-website.firebaseapp.com",
    projectId: "agrawal-samaj-samiti-website",
    storageBucket: "agrawal-samaj-samiti-website.firebasestorage.app",
    messagingSenderId: "953083660315",
    appId: "1:953083660315:web:80c4c93cf81688f9e150be",
    measurementId: "G-FNH488K5ZF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.useDeviceLanguage();

// Explicitly force local persistence so it survives across tabs
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Error setting persistence:", error);
});

export { auth, RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence };
