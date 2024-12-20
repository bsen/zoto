import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, PackageOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://www.server.zotoplatforms.com/api/orders?page=${currentPage}&limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders(response.data.data.orders);
      setTotalPages(response.data.data.totalPages);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setIsLoading(false);
    }
  };

  const openCancelModal = (order) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://www.server.zotoplatforms.com/api/bookings/${orderId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowCancelModal(false);
      setOrderToCancel(null);
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  const OrderSkeleton = () => (
    <div className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse mb-4">
      <div className="p-4">
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-300 rounded mt-4"></div>
      </div>
    </div>
  );

  const EmptyOrderState = () => (
    <div className="text-center py-12">
      <PackageOpen className="mx-auto h-24 w-24 text-gray-400" />
      <h3 className="mt-2 text-lg font-medium text-gray-900">
        No orders found
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        You haven't placed any orders yet.
      </p>
    </div>
  );

  const CancelModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-lg p-6 w-full max-w-md relative"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Cancel Order
        </h2>
        <p className="text-gray-600 mb-2">
          Are you sure you want to cancel this order?
        </p>
        <p className="text-red-600 text-sm mb-6">
          Please note: If wallet balance was used for this booking, it will not
          be refunded upon cancellation.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => handleCancelOrder(orderToCancel.id)}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300"
          >
            Yes, Cancel Order
          </button>
          <button
            onClick={() => {
              setShowCancelModal(false);
              setOrderToCancel(null);
            }}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition duration-300"
          >
            No, Keep Order
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="h-screen p-4 bg-indigo-600 overflow-y-auto no-scrollbar">
      <div className="container mx-auto">
        <div className="flex gap-4 mb-4">
          <div
            onClick={() => navigate("/")}
            className="text-3xl cursor-pointer font-semibold text-white"
          >
            z<span className="text-yellow-400">o</span>to →
          </div>
          <h1 className="text-3xl font-semibold text-white">Your Orders</h1>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4">
          <AnimatePresence>
            {isLoading ? (
              Array(5)
                .fill()
                .map((_, index) => <OrderSkeleton key={index} />)
            ) : orders.length === 0 ? (
              <EmptyOrderState />
            ) : (
              orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gray-100 rounded-lg p-4 mb-4 shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-indigo-600">
                        {order.service.name}
                      </h3>
                      <p className="text-gray-600">
                        Order ID: {order.id.substring(0, 6)}
                      </p>
                      <p className="text-gray-600">
                        Date: {new Date(order.datetime).toLocaleString()}
                      </p>
                      <p className="text-gray-600">
                        Total: ₹{order.totalAmount}
                      </p>
                      <p className="text-gray-600">Status: {order.status}</p>

                      {order.vendorName && (
                        <div className="mt-2">
                          <p className="text-indigo-600">
                            Vendor: {order.vendorName}
                          </p>
                        </div>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        Address: {order.address.street}, {order.address.city},{" "}
                        {order.address.state}, {order.address.zipCode}
                      </p>
                    </div>
                    <img
                      src={order.service.images[0] || "/default-service.jpg"}
                      alt={order.service.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>

                  {order.status === "PENDING" && (
                    <button
                      onClick={() => openCancelModal(order)}
                      className="mt-4 bg-red-100 text-rose-600 px-4 py-2 rounded-full hover:bg-red-200 transition duration-300"
                    >
                      Cancel Order
                    </button>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {!isLoading && orders.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center text-indigo-600 disabled:text-gray-400"
              >
                <ArrowLeft size={20} className="mr-2" />
                Previous
              </button>
              <span className="text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="flex items-center text-indigo-600 disabled:text-gray-400"
              >
                Next
                <ArrowRight size={20} className="ml-2" />
              </button>
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>{showCancelModal && <CancelModal />}</AnimatePresence>
    </div>
  );
};

export default Orders;
