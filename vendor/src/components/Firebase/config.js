import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAR0fy0UpHC0dCfEtow2jgQ9DigzWKeDlA",
  authDomain: "zoto-vendor.firebaseapp.com",
  projectId: "zoto-vendor",
  storageBucket: "zoto-vendor.appspot.com",
  messagingSenderId: "299044518611",
  appId: "1:299044518611:web:9e6930fa4f5e82dbc83226",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { auth, GoogleAuthProvider, signInWithPopup };
