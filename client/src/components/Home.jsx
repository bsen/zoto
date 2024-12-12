import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Instagram,
  Linkedin,
  Facebook,
  FileText,
  BookOpen,
  X,
  Wallet,
} from "lucide-react";
import { useClickAway } from "react-use";
import "leaflet/dist/leaflet.css";

const Header = ({ user, setUser }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [redeemStatus, setRedeemStatus] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useClickAway(dropdownRef, () => {
    setShowDropdown(false);
  });

  const handleRedeemSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8080/api/redeem-referral",
        { referralCode },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRedeemStatus({
        type: "success",
        message: `Success! You and ${response.data.data.referrer.name} both received ₹500!`,
      });

      setUser((prev) => ({
        ...prev,
        walletBalance: response.data.data.currentUser.newBalance,
        referredWith: referralCode,
      }));

      setTimeout(() => {
        setShowRedeemModal(false);
        setRedeemStatus(null);
        setReferralCode("");
      }, 3000);
    } catch (error) {
      setRedeemStatus({
        type: "error",
        message: error.response?.data?.message || "Failed to redeem code",
      });
    }
  };

  return (
    <header className="text-white p-2.5">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <motion.h1
            className="text-4xl font-bold"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            z<span className="text-yellow-400">o</span>to
          </motion.h1>
        </Link>
        <nav className="flex items-center">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <img
                src={user.profileUrl || "/user.png"}
                className="w-10 h-10 rounded-full cursor-pointer border-2 border-white"
                onClick={() => setShowDropdown(!showDropdown)}
                alt="Profile"
              />

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 text-gray-700"
                  >
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <div className="flex items-center text-green-600 mt-2">
                        <Wallet size={16} className="mr-1" />
                        <p className="text-sm">₹{user.walletBalance}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate("/orders")}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center border-neutral-200"
                    >
                      My Orders
                    </button>
                    {user.referralCode && (
                      <div className="px-4 py-2 border-t border-b border-neutral-200">
                        <p className="text-sm font-semibold">
                          Your Referral Code
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {user.referralCode}
                          </code>
                        </div>
                      </div>
                    )}
                    {!user.referredWith && (
                      <button
                        onClick={() => {
                          setShowRedeemModal(true);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-neutral-800"
                      >
                        Redeem Code
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-white text-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-100 transition duration-300"
            >
              Login/Signup
            </Link>
          )}
        </nav>
      </div>

      <AnimatePresence>
        {showRedeemModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-md relative"
            >
              <button
                onClick={() => setShowRedeemModal(false)}
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Redeem Referral Code
              </h2>

              {redeemStatus ? (
                <div
                  className={`p-4 rounded-lg ${
                    redeemStatus.type === "success"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {redeemStatus.message}
                </div>
              ) : (
                <form onSubmit={handleRedeemSubmit}>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) =>
                      setReferralCode(e.target.value.toUpperCase())
                    }
                    placeholder="Enter referral code"
                    className="w-full p-3 border rounded-lg mb-4 text-black"
                    maxLength={8}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300 relative"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <span className="sr-only">Loading...</span>
                      </>
                    ) : (
                      "Redeem Code"
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const HomePage = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchServices();
    checkAuthStatus();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/services");
      setServices(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching services:", error);
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    if (token) {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/profileUrl",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser({
          name: response.data.name,
          profileUrl: response.data.profileUrl,
          walletBalance: response.data.walletBalance,
          referredWith: response.data.referredWith,
          referralCode: response.data.referralCode,
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        localStorage.removeItem("token");
      }
    }
  };

  const handleBookService = (serviceId, status) => {
    if (!status) return;
    user ? navigate(`/booking/${serviceId}`) : navigate("/login");
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  const ServiceSkeleton = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse"
    >
      <div className="w-full h-48 bg-gray-300"></div>
      <div className="p-4">
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
        <div className="h-10 bg-gray-300 rounded"></div>
      </div>
    </motion.div>
  );

  return (
    <div className="h-screen bg-indigo-600 overflow-y-auto no-scrollbar">
      <Header user={user} setUser={setUser} />

      <main className="container mx-auto mt-10 px-4">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-white mb-16 max-sm:hidden"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            Your One Stop Solution for Home Services
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience top-notch cleaning, AC repair, and appliance repair
            services at your doorstep in Vellore.
          </p>
          <Link className="bg-yellow-400 text-indigo-600 px-8 py-3 rounded-full text-xl font-semibold hover:bg-yellow-300 transition duration-300 inline-block shadow-lg hover:shadow-xl transform hover:scale-105">
            Book a Service
          </Link>
        </motion.section>

        <section className="bg-white rounded-lg shadow-lg p-4 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {isLoading
                ? Array(6)
                    .fill()
                    .map((_, index) => <ServiceSkeleton key={index} />)
                : services.map((service) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5 }}
                      className="bg-gray-100 rounded-lg overflow-hidden shadow-md relative transform hover:scale-105 transition duration-300"
                    >
                      <div className="absolute top-2 right-2 bg-yellow-400 text-indigo-600 px-2 py-1 rounded-full text-sm font-bold">
                        ₹{service.price}
                      </div>
                      <img
                        src={service.images[0] || "/default-service.jpg"}
                        alt={service.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h4 className="text-xl font-semibold text-indigo-600 mb-2">
                          {service.name}
                        </h4>
                        <p className="text-gray-600 mb-2">
                          {service.description}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          <span className="inline-block mr-2">⏱</span>
                          {service.duration} minutes
                        </p>
                        <button
                          onClick={() =>
                            handleBookService(service.id, service.status)
                          }
                          className={`w-full text-center py-2 rounded-full transition duration-300 ${
                            service.status
                              ? "bg-indigo-600 text-white hover:bg-indigo-700"
                              : "bg-gray-300 text-gray-600 cursor-not-allowed"
                          }`}
                        >
                          {service.status ? "Book Now" : "Coming Soon"}
                        </button>
                      </div>
                    </motion.div>
                  ))}
            </AnimatePresence>
          </div>
        </section>

        <section className="bg-white p-4 rounded-lg shadow-lg mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-100 p-6 rounded-lg shadow transform hover:scale-105 transition duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 mr-2">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>
                  <span className="text-gray-600">{review.rating}/5</span>
                </div>
                <p className="text-gray-700 mb-4">{review.content}</p>
                <p className="font-semibold text-indigo-600">{review.name}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <footer className="bg-indigo-600 text-white mt-16 py-12 border-t border-indigo-500">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">About Zoto</h3>
              <p className="text-sm">
                Zoto Platforms is a leading service company dedicated to making
                your life easier. We provide a wide range of home and vehicle
                maintenance services including room cleaning, bathroom
                sanitization, kitchen cleaning, AC servicing, washing machine
                repairs, and bike/car repairs. Our mission is to transform your
                daily living experience with our professional and reliable
                services.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Our Services</h3>
              <ul className="space-y-2 text-sm">
                <li>Home Cleaning</li>
                <li>Bathroom Sanitization</li>
                <li>Kitchen Cleaning</li>
                <li>AC Servicing</li>
                <li>Washing Machine Repairs</li>
                <li>Bike & Car Repairs</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/terms"
                    className="flex items-center text-yellow-300 hover:text-yellow-100 transition duration-300 group"
                  >
                    <FileText size={18} className="mr-2" />
                    Terms & Conditions
                    <span className="ml-1 block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-yellow-300"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blogs"
                    className="flex items-center text-yellow-300 hover:text-yellow-100 transition duration-300 group"
                  >
                    <BookOpen size={18} className="mr-2" />
                    Blogs
                    <span className="ml-1 block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-yellow-300"></span>
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
                <div className="flex space-x-4">
                  <a
                    href="https://www.instagram.com/zotoplatforms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-200 transition-colors"
                  >
                    <Instagram size={24} />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/zoto-platforms-pvt-ltd/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-200 transition-colors"
                  >
                    <Linkedin size={24} />
                  </a>
                  <a
                    href="https://www.facebook.com/share/oEbxBC6edDx7HHbh/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-200 transition-colors"
                  >
                    <Facebook size={24} />
                  </a>
                </div>
              </div>

              {token && (
                <button
                  onClick={handleLogout}
                  className="bg-rose-100 w-fit text-rose-600 mt-6 px-7 py-2 rounded-full hover:bg-rose-200 transition duration-300"
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          <p className="mt-8 text-center text-sm">
            &copy; 2024 Zoto Platforms. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

const reviews = [
  {
    id: 1,
    name: "Aravind Swaminathan",
    content:
      "Excellent service! The cleaning team was thorough and professional.",
    rating: 5,
  },
  {
    id: 2,
    name: "Lakshmi Ranganathan",
    content:
      "Very satisfied with the AC repair. Technician was knowledgeable and efficient.",
    rating: 4,
  },
  {
    id: 3,
    name: "Karthik Sundaram",
    content:
      "Great experience with Zoto. Booking was easy and service was prompt.",
    rating: 5,
  },
  {
    id: 4,
    name: "Priya Venkatesh",
    content: "The fridge repair service was top-notch. Highly recommend!",
    rating: 5,
  },
];
