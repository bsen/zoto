import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  IndianRupee,
  User,
  X,
  Loader,
  Check,
  FileText,
  BookOpen,
  Instagram,
  Linkedin,
  Facebook,
} from "lucide-react";

const Home = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendorName, setVendorName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showOtpErrorModal, setShowOtpErrorModal] = useState(false);
  const [loadingOrderIds, setLoadingOrderIds] = useState([]);
  const [showOtpInput, setShowOtpInput] = useState({});
  const [isVerified, setIsVerified] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("vendorToken");
  const date = new Date();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchVendorInfo();
      fetchPendingOrders();
      fetchAcceptedOrders();
    }
  }, [token, navigate]);

  const fetchVendorInfo = async () => {
    try {
      const response = await axios.get(
        "https://www.server.zotoplatforms.com/vendor/api/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setVendorName(response.data.data.name);
      setIsVerified(response.data.data.isVerified);
    } catch (error) {
      console.error("Error fetching vendor info:", error);
      setError("Please Refresh Or Try Again Later!");
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const response = await axios.get(
        "https://www.server.zotoplatforms.com/vendor/api/nearby-orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPendingOrders(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      setError("Please Refresh Or Try Again Later!");
      setIsLoading(false);
    }
  };

  const fetchAcceptedOrders = async () => {
    try {
      const response = await axios.get(
        "https://www.server.zotoplatforms.com/vendor/api/accepted-orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAcceptedOrders(response.data.data);
    } catch (error) {
      console.error("Error fetching accepted orders:", error);
      setError("Please Refresh Or Try Again Later!");
    }
  };

  const handleAcceptOrder = async (orderId) => {
    if (!isVerified) {
      setShowVerificationModal(true);
      return;
    }

    setLoadingOrderIds((prev) => [...prev, orderId]);
    try {
      await axios.post(
        `https://www.server.zotoplatforms.com/vendor/api/accept-order/${orderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPendingOrders(pendingOrders.filter((order) => order.id !== orderId));
      await fetchAcceptedOrders();
    } catch (error) {
      console.error("Error accepting order:", error);
      setError("Please Refresh Or Try Again Later!");
    } finally {
      setLoadingOrderIds((prev) => prev.filter((id) => id !== orderId));
    }
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleCompleteOrder = async (orderId, otp) => {
    try {
      if (!otp) {
        setError("Please enter the OTP to complete the order.");
        return;
      }
      setLoadingOrderIds((prev) => [...prev, orderId]);
      const response = await axios.post(
        `https://www.server.zotoplatforms.com/vendor/api/complete-order/${orderId}`,
        { otp },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setShowSuccessModal(true);
        setAcceptedOrders(
          acceptedOrders.filter((order) => order.id !== orderId)
        );
        setShowOtpInput((prev) => ({ ...prev, [orderId]: false }));
      }
    } catch (error) {
      console.error("Error completing order:", error);
      if (error.response && error.response.status === 409) {
        setShowOtpErrorModal(true);
      } else {
        setError("Please Refresh Or Try Again Later!");
      }
    } finally {
      setLoadingOrderIds((prev) => prev.filter((id) => id !== orderId));
    }
  };

  const OrderCard = ({ order, isAccepted = false }) => {
    const [localOtp, setLocalOtp] = useState("");
    const isOtpValid = localOtp.length === 6;
    const otpInputRef = useRef(null);

    useEffect(() => {
      if (showOtpInput[order.id] && otpInputRef.current) {
        otpInputRef.current.focus();
      }
    }, [showOtpInput, order.id]);

    const handleOtpChange = (e) => {
      const value = e.target.value.replace(/\D/g, "");
      if (value.length <= 6) {
        setLocalOtp(value);
      }
    };

    const formatAddress = (address) => {
      if (typeof address === "string") {
        return address;
      } else if (typeof address === "object") {
        return `${address.street || ""}, ${address.city || ""}, ${
          address.state || ""
        } ${address.zipCode || ""}`.trim();
      }
      return "No address available";
    };

    const isLoading = loadingOrderIds.includes(order.id);

    const buttonClass = `w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center ${
      isOtpValid ? "opacity-100" : "opacity-50 cursor-not-allowed"
    }`;

    return (
      <div className="bg-white rounded-lg overflow-hidden shadow-lg relative mb-4">
        <div className="p-6">
          <h4 className="text-xl font-semibold text-blue-700 mb-3">
            {order.serviceName || order.service?.name || "Unnamed Service"}
          </h4>
          <div className="space-y-3">
            <div className="flex items-center text-blue-600">
              <MapPin size={18} className="mr-3 text-neutral-600" />
              <span>{formatAddress(order.address)}</span>
            </div>
            <div className="flex items-center text-blue-600">
              <Clock size={18} className="mr-3 text-neutral-600" />
              <span>
                {order.dateTime || order.datetime
                  ? new Date(order.dateTime || order.datetime).toLocaleString()
                  : "No date available"}
              </span>
            </div>
            <div className="flex items-center text-blue-600">
              <IndianRupee size={18} className="mr-3 text-neutral-600" />
              <span>{order.totalAmount || "Price not available"}</span>
            </div>
            <div className="flex items-center text-blue-600">
              <User size={18} className="mr-3 text-neutral-600" />
              <span>
                {order.customerName || order.user?.name || "Unknown User"}
              </span>
            </div>
          </div>
          <div className="mt-6">
            {!isAccepted ? (
              <button
                onClick={() => handleAcceptOrder(order.id)}
                className="w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition duration-300 shadow-md disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader className="animate-spin mr-2" size={20} />
                    Accepting...
                  </div>
                ) : (
                  "Accept Order"
                )}
              </button>
            ) : (
              <div>
                {showOtpInput[order.id] ? (
                  <div className="space-y-2">
                    <input
                      ref={otpInputRef}
                      type="text"
                      value={localOtp}
                      onChange={handleOtpChange}
                      placeholder="Enter 6-digit OTP"
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleCompleteOrder(order.id, localOtp)}
                      className={buttonClass}
                      disabled={!isOtpValid || isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <Loader className="animate-spin mr-2" size={20} />
                          Verifying...
                        </div>
                      ) : (
                        <>
                          <Check size={20} className="mr-2" />
                          Verify and Complete
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      setShowOtpInput((prev) => ({ ...prev, [order.id]: true }))
                    }
                    className="w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition duration-300 shadow-md"
                  >
                    Complete Order
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
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
    <div className="min-h-screen bg-blue-600">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-white">
            z<span className="text-yellow-400">o</span>to
          </h1>
        </div>
        <div className="text-blue-500 size-8 flex justify-center items-center font-semibold border border-white  rounded-full bg-white cursor-pointer"></div>
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
            <div className="grid grid-cols-1 gap-6">
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
      <div className="h-screen bg-blue-600 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4 justify-center">
          <img src="zoto.png" className="h-14 rounded-full border-2" />
          <div className="text-white text-2xl">{error}</div>
          <button
            className="bg-white px-4 py-2 text-blue-600 font-semibold rounded-full"
            onClick={() => {
              try {
                localStorage.clear();
              } finally {
                window.location.reload();
              }
            }}
          >
            Click to refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-600">
      <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <img src="zoto.png" className="max-sm:h-14 h-20" />
        </div>
        {vendorName ? (
          <div
            className="text-blue-500 size-8 flex justify-center items-center font-semibold border border-white  rounded-full bg-white cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            {vendorName[0]}
          </div>
        ) : (
          <div></div>
        )}
      </div>

      <main>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              Earn Money with Zoto Vendor Platform
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-xl text-blue-100">
              Join our network of skilled professionals and start earning by
              providing top-notch services to customers in your area.
            </p>
            <div className="mt-8">
              <a
                href="#available-orders"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-950"
              >
                View Available Orders
              </a>
            </div>
          </div>

          <div id="available-orders">
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence>
                {pendingOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </AnimatePresence>
            </div>
            {pendingOrders.length === 0 && (
              <div className="text-white text-xl text-center mt-12 flex justify-center">
                <img src="box.png" className="h-14" />
              </div>
            )}
          </div>
        </div>
        <footer className="bg-blue-600 text-white mt-16 py-12 border-t border-blue-500">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
                  <div className="flex space-x-4">
                    <a
                      href="https://www.instagram.com/zotoplatforms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-200 transition-colors"
                    >
                      <Instagram size={24} />
                    </a>
                    <a
                      href="https://www.linkedin.com/company/zoto-platforms-pvt-ltd/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-200 transition-colors"
                    >
                      <Linkedin size={24} />
                    </a>
                    <a
                      href="https://www.facebook.com/share/oEbxBC6edDx7HHbh/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-200 transition-colors"
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
              &copy; {date.getFullYear()} Zoto Platforms. All rights reserved.
            </p>
          </div>
        </footer>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="w-full text-center">
                <h2 className="text-2xl font-bold text-blue-950 text-center underline underline-offset-4">
                  Accepted Orders
                </h2>
              </div>
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
              <p className="text-blue-600 text-center py-4">
                No accepted orders at the moment.
              </p>
            )}
          </div>
        </div>
      )}
      {showOtpErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-blue-700">
                Incorrect OTP
              </h3>
              <button
                onClick={() => setShowOtpErrorModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              The OTP you entered is incorrect. Please try again with the
              correct OTP.
            </p>
            <button
              onClick={() => setShowOtpErrorModal(false)}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-green-600">
                Order Completed
              </h3>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Your order has been successfully completed. Thank you for your
              service!
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-300"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-blue-700">
                Account Not Verified
              </h3>
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  window.location.reload();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Your account is not verified yet. You need to complete the
              verification process before accepting orders.
            </p>
            <p className="text-gray-600 mb-4">
              For assistance, please contact us at:{" "}
              <a
                href="mailto:zotoplatforms@gmail.com"
                className="text-blue-600 hover:text-blue-800"
              >
                zotoplatforms@gmail.com
              </a>
            </p>
            <button
              onClick={() => {
                setShowVerificationModal(false);
                window.location.reload();
              }}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in-out">
          {error}
        </div>
      )}
    </div>
  );
};

export default Home;
