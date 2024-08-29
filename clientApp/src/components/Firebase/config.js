import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC1baINoklqKdLG_cCYJIr37DhXFLBxheQ",
  authDomain: "zoto-platforms.firebaseapp.com",
  projectId: "zoto-platforms",
  storageBucket: "zoto-platforms.appspot.com",
  messagingSenderId: "315927623835",
  appId: "1:315927623835:web:b8fad5e8abe584875eae3e",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { auth, GoogleAuthProvider, signInWithPopup };
