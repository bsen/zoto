import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";

interface Order {
  id: string;
  userId: string;
  serviceId: string;
  datetime: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  totalAmount: number;
  user: {
    name: string;
    email: string;
  };
  service: {
    name: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
  };
}

const NewOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/admin/zotoplatforms/panel/new-orders?page=${currentPage}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders(response.data.orders);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError("Failed to fetch orders. Please try again.");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return (
      <div>
        <div className="h-10 w-48 bg-gray-300 rounded mb-6 animate-pulse" />
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-100">
              <tr>
                {[...Array(7)].map((_, index) => (
                  <th key={index} className="p-4">
                    <div className="h-4 bg-gray-300 rounded animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(10)].map((_, index) => (
                <tr key={index}>
                  {[...Array(7)].map((_, cellIndex) => (
                    <td key={cellIndex} className="p-4">
                      <div className="h-4 bg-gray-300 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-between items-center">
          <div className="h-10 w-24 bg-gray-300 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-300 rounded animate-pulse" />
          <div className="h-10 w-24 bg-gray-300 rounded animate-pulse" />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center text-red-500">
        <FaExclamationTriangle className="text-5xl mb-4" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Orders</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-indigo-100">
            <tr>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Status
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="p-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                  <Link
                    to={`/dashboard/order/${order.id}`}
                    className="bg-indigo-50 py-1 px-3 rounded-full"
                  >
                    {order.id}
                  </Link>
                </td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-900">
                  {order.user.name.slice(0, 10)}...
                </td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-900">
                  {order.service.name.slice(0, 10)}...
                </td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(order.datetime).toLocaleString()}
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.paymentStatus === "PAID"
                        ? "bg-green-100 text-green-800"
                        : order.paymentStatus === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="p-4 whitespace-nowrap text-sm text-gray-900">
                  {order.totalAmount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaChevronLeft className="inline mr-2" />
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <FaChevronRight className="inline ml-2" />
        </button>
      </div>
    </div>
  );
};

export default NewOrders;
