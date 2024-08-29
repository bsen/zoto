import React, { useEffect, useState } from "react";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./Firebase/config";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState("");

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const handleGoogle = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      const name = result.user.displayName;
      const photoURL = result.user.photoURL;
      const idToken = await result.user.getIdToken();
      const phone = result.user.phoneNumber || "";

      if (email && name) {
        await authenticate(email, name, phone, idToken, photoURL);
      } else {
        throw new Error("Failed to retrieve user information from Google");
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      setPopup(error.message || "Google Sign-In failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async (email, name, phone, idToken, profilePicture) => {
    const userData = {
      email,
      name,
      phone,
      idToken,
      profilePicture,
    };

    try {
      const response = await axios.post(
        `https://server.zotoplatforms.com/api/auth`,
        userData
      );

      if (response.data.status === 200) {
        localStorage.setItem("token", response.data.data.token);
        navigate("/");
      } else {
        throw new Error(response.data.message || "Authentication failed");
      }
    } catch (error) {
      console.error(error);
      throw new Error(
        error.response?.data?.message || "Network error, try again later"
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-600 to-indigo-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-10 animate-float"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 5}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md space-y-8 bg-white p-6 sm:p-10 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-indigo-600 mb-2">
            z<span className="text-yellow-400">o</span>to
          </h1>
          <p className="text-center text-base sm:text-lg text-gray-600 max-w-sm">
            Your one-stop solution for home services.
          </p>
        </div>

        <div className="flex justify-center space-x-4 sm:space-x-6 my-6 sm:my-8">
          {["cleaning", "repair", "paint"].map((service) => (
            <div key={service} className="text-center">
              <img
                src={`/${service}.png`}
                alt={service}
                className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 transition-transform duration-300 hover:scale-110"
              />
              <p className="text-xs sm:text-sm text-gray-600 capitalize">
                {service}
              </p>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <button
            onClick={handleGoogle}
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent text-base sm:text-lg font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg ${
              isLoading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <img
                src="/google.png"
                alt="Google"
                className="w-5 h-5 sm:w-6 sm:h-6 mr-3"
              />
            )}
            {isLoading ? "Signing In..." : "Continue with Google"}
          </button>
          {popup && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center text-sm font-medium text-red-600 bg-red-100 py-2 px-4 rounded-full"
            >
              {popup}
            </motion.p>
          )}
        </motion.div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-white">© 2024 Zoto. All rights reserved.</p>
        <Link
          to="/policies"
          className="mt-2 inline-block text-sm text-white hover:text-yellow-300 transition duration-300 ease-in-out"
        >
          Privacy Policy & Terms of Service
        </Link>
      </motion.div>
    </div>
  );
};

export default Login;
