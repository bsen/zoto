import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { format, addHours, setHours, setMinutes, isBefore } from "date-fns";
import { Clock, X } from "lucide-react";

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [bookingData, setBookingData] = useState({
    name: "",
    phone: "",
    street: "",
    city: "Vellore",
    state: "Tamil Nadu",
    country: "India",
    zipCode: "",
    bookingDate: format(addHours(new Date(), 4), "yyyy-MM-dd"),
    bookingTime: "12:00",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  useEffect(() => {
    fetchServiceData();
    fetchWalletBalance();
  }, [id]);

  // Effect to calculate final price
  useEffect(() => {
    if (!service) return;

    if (useWalletBalance) {
      if (service.price <= walletBalance) {
        setFinalPrice(0);
      } else {
        setFinalPrice(service.price - walletBalance);
      }
    } else {
      setFinalPrice(service.price);
    }
  }, [useWalletBalance, service, walletBalance]);

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/profileUrl", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWalletBalance(response.data.walletBalance);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const fetchServiceData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/services/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setService(response.data.data.service);
      setBookingData((prevData) => ({
        ...prevData,
        name: response.data.data.user.name,
        phone: response.data.data.user.phone || "",
      }));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching service data:", error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const bookingDateTime = new Date(
        `${bookingData.bookingDate}T${bookingData.bookingTime}`
      );
      setBooking(true);
      await axios.post(
        "http://localhost:8080/api/create-booking",
        {
          serviceId: id,
          name: bookingData.name,
          phone: bookingData.phone,
          address: {
            street: bookingData.street,
            city: bookingData.city,
            state: bookingData.state,
            country: bookingData.country,
            zipCode: bookingData.zipCode,
          },
          bookingDate: bookingDateTime.toISOString(),
          useWalletBalance,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("Error creating booking:", error);
    } finally {
      setBooking(false);
    }
  };

  const getAvailableTimeSlots = () => {
    const now = new Date();
    const bookingDate = new Date(bookingData.bookingDate);
    const isToday = bookingDate.toDateString() === now.toDateString();
    let startHour = 8;

    if (isToday) {
      startHour = Math.max(now.getHours() + 4, 8);
    }

    const slots = [];
    for (let hour = startHour; hour <= 20; hour++) {
      const time = setMinutes(setHours(bookingDate, hour), 0);
      if (!isToday || !isBefore(time, addHours(now, 4))) {
        slots.push(format(time, "HH:mm"));
      }
    }
    return slots;
  };

  const BookingSkeleton = () => (
    <div className="min-h-screen bg-indigo-600 p-4">
      <div className="container mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="h-64 bg-gray-300 rounded-lg mb-4"></div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
                <div className="flex justify-between items-center mb-4">
                  <div className="h-8 bg-gray-300 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded w-1/2 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(7)].map((_, index) => (
                <div key={index}>
                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-1"></div>
                  <div className="h-10 bg-gray-300 rounded w-full"></div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-1"></div>
                  <div className="h-10 bg-gray-300 rounded w-full"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-1"></div>
                  <div className="h-10 bg-gray-300 rounded w-full"></div>
                </div>
              </div>
              <div className="h-12 bg-gray-300 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SuccessModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white p-8 rounded-lg text-center shadow-xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-green-500 text-6xl mb-4"
        >
          ✓
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Booking Successful!
        </h2>
        <p className="text-gray-600">
          Your booking has been confirmed. Redirecting to home...
        </p>
      </motion.div>
    </motion.div>
  );

  if (loading) return <BookingSkeleton />;

  return (
    <div className="min-h-screen bg-indigo-600 p-4">
      <div className="container mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <div
              onClick={() => navigate("/")}
              className="text-3xl cursor-pointer font-semibold text-indigo-600"
            >
              z<span className="text-yellow-400">o</span>to →
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={service.images[0] || "/api/placeholder/400/300"}
                  alt={service.name}
                  className="w-full h-64 object-cover rounded-lg mb-4 shadow-md"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gray-50 p-6 rounded-lg shadow-md"
              >
                <h1 className="text-2xl mb-2 font-semibold text-indigo-600">
                  Book {service.name}
                </h1>
                <p className="mb-4 text-gray-700">{service.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-3xl font-bold text-indigo-600">
                      ₹{finalPrice}
                    </p>
                    {walletBalance > 0 && (
                      <div className="mt-2">
                        <label className="flex items-center text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={useWalletBalance}
                            onChange={(e) =>
                              setUseWalletBalance(e.target.checked)
                            }
                            className="mr-2"
                          />
                          Use wallet balance (₹{walletBalance})
                        </label>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock size={20} className="mr-2" />
                    {service.duration} minutes
                  </div>
                </div>
                <h4 className="text-lg font-semibold mt-6 mb-3 text-indigo-600">
                  Service Highlights
                </h4>
                <ul className="list-disc list-inside text-gray-700">
                  <li>Professional equipment</li>
                  <li>Trained experts</li>
                  <li>100% satisfaction guarantee</li>
                </ul>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={bookingData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={bookingData.phone}
                    onChange={handleInputChange}
                    maxLength={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={bookingData.street}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <select
                      name="city"
                      value={bookingData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="Vellore">Vellore</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <select
                      name="state"
                      value={bookingData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="Tamil Nadu">Tamil Nadu</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <select
                      name="country"
                      value={bookingData.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="India">India</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <select
                      name="zipCode"
                      value={bookingData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select ZIP Code</option>
                      {postcodes.map((code) => (
                        <option key={code} value={code}>
                          {code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Booking Date *
                    </label>
                    <input
                      type="date"
                      name="bookingDate"
                      value={bookingData.bookingDate}
                      onChange={handleInputChange}
                      min={format(new Date(), "yyyy-MM-dd")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Booking Time *
                    </label>
                    <select
                      name="bookingTime"
                      value={bookingData.bookingTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      {getAvailableTimeSlots().map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <motion.button
                  type="submit"
                  disabled={booking}
                  className="w-full flex justify-center items-center mt-6 bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition duration-300 font-semibold text-lg shadow-md disabled:bg-indigo-400"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {booking ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Confirm Booking"
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
      <AnimatePresence>{showSuccessModal && <SuccessModal />}</AnimatePresence>
    </div>
  );
};

export default Booking;
