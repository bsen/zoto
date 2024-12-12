import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserAstronaut,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaTools,
  FaCalendarAlt,
  FaRocket,
  FaExclamationTriangle,
} from "react-icons/fa";

const Auth: React.FC = () => {
  const token = localStorage.getItem("token");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://www.server.zotoplatforms.com/api/admin/zotoplatforms/panel/login",
        {
          username,
          password,
        }
      );
      localStorage.setItem("token", response.data.token);
      navigate("/admin");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(
          err.response.data.message ||
            "Authentication failed. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/admin");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  return (
    <div className="bg-gray-100 min-h-screen w-full flex items-center justify-center px-4 overflow-hidden">
      {/* Background animations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute right-1/4 bottom-1/4 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute left-1/3 bottom-1/3 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl w-full flex items-center justify-between relative z-10">
        {/* Left side content */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-1/2 pr-8"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Zoto Platforms Admin
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Efficiently manage your diverse service offerings with powerful
            tools and insights.
          </p>

          {/* Feature boxes */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <FaTools className="text-indigo-500 text-3xl mb-2" />
              <h3 className="text-gray-800 font-semibold">
                Service Management
              </h3>
              <p className="text-gray-600 text-sm">
                Oversee home, automobile, and beauty services
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <FaCalendarAlt className="text-green-500 text-3xl mb-2" />
              <h3 className="text-gray-800 font-semibold">
                Appointment Scheduling
              </h3>
              <p className="text-gray-600 text-sm">
                Streamline booking and staff allocation
              </p>
            </div>
          </div>

          {/* Service overview graph */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-gray-800 font-semibold mb-2">
              Service Overview
            </h3>
            <div className="h-24 flex items-end space-x-2">
              <div
                className="w-1/5 bg-red-400 rounded-t"
                style={{ height: "70%" }}
                title="Home Repairs"
              ></div>
              <div
                className="w-1/5 bg-indigo-400 rounded-t"
                style={{ height: "60%" }}
                title="Car Maintenance"
              ></div>
              <div
                className="w-1/5 bg-pink-400 rounded-t"
                style={{ height: "80%" }}
                title="Beauty Services"
              ></div>
              <div
                className="w-1/5 bg-yellow-400 rounded-t"
                style={{ height: "50%" }}
                title="Appliance Fixing"
              ></div>
              <div
                className="w-1/5 bg-purple-400 rounded-t"
                style={{ height: "65%" }}
                title="Plumbing"
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Login form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-1/2 max-w-md bg-white p-10 rounded-3xl shadow-2xl border border-gray-200"
        >
          <div className="text-center mb-8">
            <FaRocket className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800">Admin Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <FaUserAstronaut className="absolute top-3 left-3 text-indigo-500" />
              <input
                name="username"
                type="text"
                required
                className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-indigo-500"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <FaLock className="absolute top-3 left-3 text-indigo-500" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-10 pr-10 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-indigo-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <FaEyeSlash className="text-indigo-500" />
                ) : (
                  <FaEye className="text-indigo-500" />
                )}
              </button>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white font-semibold transition duration-300 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
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
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-red-500 text-white py-2 px-4 rounded-lg shadow-lg flex items-center"
          >
            <FaExclamationTriangle className="mr-2" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;
