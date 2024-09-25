import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, IndianRupee, User, X } from "lucide-react";

const Home = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendorName, setVendorName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("vendorToken");

  useEffect(() => {
    if (!token) {
      navigate("/vendor/login");
    } else {
      fetchVendorInfo();
      fetchPendingOrders();
      fetchAcceptedOrders();
    }
  }, [token, navigate]);

  const fetchVendorInfo = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/vendor/api/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setVendorName(response.data.data.name);
    } catch (error) {
      console.error("Error fetching vendor info:", error);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/vendor/api/nearby-orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPendingOrders(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      setError("Failed to fetch pending orders. Please try again.");
      setIsLoading(false);
    }
  };

  const fetchAcceptedOrders = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/vendor/api/accepted-orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAcceptedOrders(response.data.data);
    } catch (error) {
      console.error("Error fetching accepted orders:", error);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await axios.post(
        `http://localhost:8080/vendor/api/accept-order/${orderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPendingOrders(pendingOrders.filter((order) => order.id !== orderId));
      fetchAcceptedOrders();
    } catch (error) {
      console.error("Error accepting order:", error);
      setError("Failed to accept order. Please try again.");
    }
  };

  const handleCompleteOrder = async () => {
    try {
      await axios.post(
        `http://localhost:8080/vendor/api/complete-order/${selectedOrder.id}`,
        { otp },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAcceptedOrders(
        acceptedOrders.filter((order) => order.id !== selectedOrder.id)
      );
      setShowModal(false);
      setSelectedOrder(null);
      setOtp("");
    } catch (error) {
      console.error("Error completing order:", error);
      setError("Failed to complete order. Please check the OTP and try again.");
    }
  };

  const OrderCard = ({ order, isAccepted = false }) => {
    if (!order) {
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg overflow-hidden shadow-md relative transform hover:scale-105 transition duration-300"
      >
        <div className="p-4">
          <h4 className="text-xl font-semibold text-indigo-600 mb-2">
            {order.service?.name || "Unnamed Service"}
          </h4>
          <p className="text-gray-600 mb-2">
            {order.service?.description || "No description available"}
          </p>
          <div className="flex items-center text-gray-500 mb-2">
            <MapPin size={16} className="mr-2" />
            <span>{order.address?.zipCode || "No ZIP code"}</span>
          </div>
          <div className="flex items-center text-gray-500 mb-2">
            <Clock size={16} className="mr-2" />
            <span>
              {order.datetime
                ? new Date(order.datetime).toLocaleString()
                : "No date available"}
            </span>
          </div>
          <div className="flex items-center text-gray-500 mb-2">
            <IndianRupee size={16} className="mr-2" />
            <span>{order.totalAmount || "Price not available"}</span>
          </div>
          <div className="flex items-center text-gray-500 mb-4">
            <User size={16} className="mr-2" />
            <span>{order.user?.name || "Unknown User"}</span>
          </div>
          {!isAccepted ? (
            <button
              onClick={() => handleAcceptOrder(order.id)}
              className="w-full bg-indigo-600 text-white py-2 rounded-full hover:bg-indigo-700 transition duration-300"
            >
              Accept Order
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedOrder(order);
                setShowModal(true);
              }}
              className="w-full bg-green-600 text-white py-2 rounded-full hover:bg-green-700 transition duration-300"
            >
              Complete Order
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  const SkeletonOrderCard = () => (
    <div className="bg-white rounded-lg overflow-hidden shadow-md p-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-indigo-600">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-white">
            z<span className="text-yellow-400">o</span>to
          </h1>
        </div>
        <div className="w-32 h-6 bg-gray-200 rounded-full animate-pulse"></div>
      </div>

      <main>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
          </div>

          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-8 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <SkeletonOrderCard key={index} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="h-screen bg-indigo-600 flex justify-center items-center">
        <div className="text-white text-2xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-600">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-white">
            z<span className="text-yellow-400">o</span>to
          </h1>
        </div>
        <div
          className="text-indigo-500 font-semibold border border-white px-2 py-0.5 rounded-full bg-white cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          Welcome, {vendorName}
        </div>
      </div>

      <main>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              Earn Money with Zoto Vendor Platform
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-xl text-indigo-100">
              Join our network of skilled professionals and start earning by
              providing top-notch services to customers in your area.
            </p>
            <div className="mt-8">
              <a
                href="#available-orders"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-yellow-400 hover:bg-yellow-500"
              >
                View Available Orders
              </a>
            </div>
          </div>

          <div id="available-orders">
            <h3 className="text-3xl font-bold text-white mb-8">
              Available Orders
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {pendingOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </AnimatePresence>
            </div>
            {pendingOrders.length === 0 && (
              <div className="text-white text-xl text-center mt-12">
                No pending orders available at the moment.
              </div>
            )}
          </div>
        </div>
      </main>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Accepted Orders</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            {acceptedOrders.length > 0 ? (
              acceptedOrders.map((order) => (
                <OrderCard key={order.id} order={order} isAccepted={true} />
              ))
            ) : (
              <p>No accepted orders at the moment.</p>
            )}
            {selectedOrder && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Complete Order</h3>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full px-3 py-2 border rounded-md mb-2"
                />
                <button
                  onClick={handleCompleteOrder}
                  className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-300"
                >
                  Verify OTP and Complete Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
