// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Centralized Firebase Configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDGR7_22NGtrfuwZUeSAxUcd4uo63PBis8",
//   authDomain: "certificate-generator-2ee96.firebaseapp.com",
//   projectId: "certificate-generator-2ee96",
//   storageBucket: "certificate-generator-2ee96.appspot.com",
//   messagingSenderId: "734521744235",
//   appId: "1:734521744235:web:e2f55e375bbe90b4bbca2e"
// };

const firebaseConfig = {
  apiKey: "AIzaSyBxVjQ-ZqSvx4ea4COuOAjvv54vggrWHDk",
  authDomain: "certificate-studio-c433b.firebaseapp.com",
  projectId: "certificate-studio-c433b",
  storageBucket: "certificate-studio-c433b.firebasestorage.app",
  messagingSenderId: "962695813364",
  appId: "1:962695813364:web:a8f0e0c0c14b4e0f2fe6a1",
};

// Initialize Firebase and export the services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
