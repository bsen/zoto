import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./Firebase/config";
import { Link, useNavigate } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState("");
  const [email, setEmail] = useState("");
  const [isSignupMode, setIsSignupMode] = useState(true);
  const [vendorData, setVendorData] = useState({
    name: "",
    phone: "",
    address: "",
    pincode: "",
    skills: [],
    aadhaarNumber: "",
    panNumber: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("vendorToken");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleGoogle = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      const idToken = await result.user.getIdToken();

      if (email) {
        if (isSignupMode) {
          setEmail(email);
          setVendorData((prevData) => ({
            ...prevData,
            name: result.user.displayName || "",
          }));
        } else {
          await authenticateVendor(email, idToken);
        }
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVendorData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSkillChange = (skill) => {
    setVendorData((prevData) => ({
      ...prevData,
      skills: prevData.skills.includes(skill)
        ? prevData.skills.filter((s) => s !== skill)
        : [...prevData.skills, skill],
    }));
  };

  const setMissingInput = (message) => {
    setPopup(message);
    setTimeout(() => {
      setPopup("");
    }, 3000);
  };

  const handleSignup = async () => {
    if (isLoading) return;
    if (!vendorData.name) return setMissingInput("Name is required");
    if (!vendorData.phone) return setMissingInput("Phone number is required");
    if (!vendorData.address) return setMissingInput("Address is required");
    if (!vendorData.pincode) return setMissingInput("Pincode is required");
    if (vendorData.skills.length === 0)
      return setMissingInput("At least one skill is required");
    if (!vendorData.aadhaarNumber)
      return setMissingInput("Aadhaar number is required");
    if (!vendorData.panNumber) return setMissingInput("PAN number is required");

    try {
      setIsLoading(true);
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("No ID token available");

      const response = await axios.post(
        "http://localhost:8080/vendor/api/signup",
        { ...vendorData, email, idToken }
      );

      if (response.data.status === 200) {
        localStorage.setItem("vendorToken", response.data.data.token);
        navigate("/");
      } else {
        throw new Error(response.data.message || "Signup failed");
      }
    } catch (error) {
      console.error(error);
      setMissingInput(
        error.response?.data?.message || "Network error, try again later"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateVendor = async (email, idToken) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/vendor/api/login",
        { email, idToken }
      );

      if (response.data.status === 200) {
        localStorage.setItem("vendorToken", response.data.data.token);
        navigate("/");
      } else {
        throw new Error(response.data.message || "Authentication failed");
      }
    } catch (error) {
      console.error(error);
      setPopup(
        error.response?.data?.message || "Network error, try again later"
      );
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const underlineVariants = {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration: 0.5, ease: "easeInOut" } },
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-indigo-600 to-indigo-800 relative overflow-y-auto no-scrollbar">
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

      <div className="w-full max-w-md space-y-8 p-6 sm:p-10 bg-white rounded-3xl shadow-2xl relative z-10">
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <h1
            className="text-4xl sm:text-5xl font-bold text-indigo-600 mb-2 relative"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.1 }}
          >
            <span variants={letterVariants}>z</span>
            <span variants={letterVariants} className="text-yellow-400">
              o
            </span>
            <span variants={letterVariants}>t</span>
            <span variants={letterVariants}>o</span>
            <span> for vendors</span>
            <div
              className="absolute -bottom-1 left-0 right-0 h-1 bg-indigo-600"
              variants={underlineVariants}
            />
          </h1>
          <p
            className="text-center mt-4 text-base sm:text-lg text-gray-600 max-w-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {isSignupMode
              ? "Join our team of service providers!"
              : "Welcome back, service provider!"}
          </p>
        </div>
        {!email && (
          <div
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
              {isLoading
                ? "Processing..."
                : `Continue with Google to ${
                    isSignupMode ? "Sign Up" : "Log In"
                  }`}
            </button>
            {popup && (
              <p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-center text-sm font-medium text-red-600 bg-red-100 py-2 px-4 rounded-full"
              >
                {popup}
              </p>
            )}
          </div>
        )}
        {email && isSignupMode && (
          <div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <input
              type="text"
              name="name"
              value={vendorData.name}
              onChange={handleInputChange}
              placeholder="Full Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <input
              type="tel"
              name="phone"
              value={vendorData.phone}
              onChange={handleInputChange}
              placeholder="Phone Number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <input
              type="text"
              name="address"
              value={vendorData.address}
              onChange={handleInputChange}
              placeholder="Address"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <select
              name="pincode"
              value={vendorData.pincode}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select Pincode</option>
              {postcodes.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Skills:</p>
              <div className="flex flex-wrap gap-2">
                {Object.values(VendorSkill).map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleSkillChange(skill)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      vendorData.skills.includes(skill)
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {skill.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              name="aadhaarNumber"
              value={vendorData.aadhaarNumber}
              maxLength={12}
              onChange={handleInputChange}
              placeholder="Aadhaar Number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <input
              type="text"
              name="panNumber"
              value={vendorData.panNumber}
              maxLength={10}
              onChange={handleInputChange}
              placeholder="PAN Number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <button
              onClick={handleSignup}
              disabled={isLoading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? "Signing Up..." : "Sign Up"}
            </button>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => {
              setIsSignupMode(!isSignupMode);
              setEmail("");
              setPopup(false);
            }}
            className="text-lg text-indigo-600 hover:text-indigo-500"
          >
            {isSignupMode
              ? "Already have an account? Log In"
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>

      <div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-white">© 2024 Zoto. All rights reserved.</p>
        <Link
          to="/terms"
          className="mt-2 inline-block text-sm font-semibold text-lime-300 hover:text-lime-100 transition duration-300 ease-in-out relative group"
        >
          Privacy Policy & Terms of Service
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-lime-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
        </Link>
      </div>
    </div>
  );
};

const VendorSkill = {
  ELECTRONICS_SERVICE: "ELECTRONICS_SERVICE",
  HOME_CLEANING: "HOME_CLEANING",
  BATHROOM_CLEANING: "BATHROOM_CLEANING",
  PLUMBING: "PLUMBING",
  ELECTRICAL_WORK: "ELECTRICAL_WORK",
  CARPENTRY: "CARPENTRY",
  PAINTING: "PAINTING",
  GARDENING: "GARDENING",
  APPLIANCE_REPAIR: "APPLIANCE_REPAIR",
  PEST_CONTROL: "PEST_CONTROL",
};

const postcodes = [
  "632001",
  "632002",
  "632004",
  "632006",
  "632007",
  "632008",
  "632009",
  "632010",
  "632011",
  "632012",
  "632013",
  "632014",
  "632055",
  "632057",
  "632058",
  "632059",
  "632102",
  "632105",
  "632106",
  "632114",
  "632806",
];

export default Auth;
