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

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/orders?page=${currentPage}&limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response.data.data.orders);
      setOrders(response.data.data.orders);
      setTotalPages(response.data.data.totalPages);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8080/api/bookings/${orderId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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

  return (
    <div className="h-screen p-4 bg-indigo-600 overflow-y-auto no-scrollbar">
      <div className="container mx-auto">
        <div className="flex gap-4 mb-4">
          <div
            onClick={() => {
              navigate("/");
            }}
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
                      <p className="text-gray-600">Status: {order.status}</p>
                      <p className="text-gray-600">
                        Total: ₹{order.totalAmount}
                      </p>
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
                      onClick={() => handleCancelOrder(order.id)}
                      className="mt-4 bg-red-100 text-rose-600 px-4 py-2 rounded-full"
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
    </div>
  );
};

export default Orders;
