import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
} from "react-icons/fa";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  _count: {
    bookings: number;
    reviews: number;
  };
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (searchQuery) {
      const delayDebounceFn = setTimeout(() => {
        searchCustomers();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      fetchCustomers();
    }
  }, [currentPage, searchQuery]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/admin/zotoplatforms/panel/users?page=${currentPage}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCustomers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError("Failed to fetch customers. Please try again.");
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async () => {
    setSearching(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8080/api/admin/zotoplatforms/panel/search-users",
        { query: searchQuery },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCustomers(response.data.users);
      setTotalPages(1); // Search results are not paginated
    } catch (err) {
      setError("Failed to search customers. Please try again.");
      console.error("Error searching customers:", err);
    } finally {
      setSearching(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const renderSkeletonLoader = () => (
    <div className="container mx-auto">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-indigo-100">
            <tr>
              {[...Array(5)].map((_, index) => (
                <th key={index} className="p-4">
                  <div className="h-4 bg-gray-300 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, index) => (
              <tr key={index}>
                {[...Array(5)].map((_, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4">
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

  const renderCustomerList = () => (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-indigo-100">
          <tr>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Activity
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="p-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                <Link
                  to={`/dashboard/customer/${customer.id}`}
                  className="bg-indigo-50 px-3 py-1 rounded-full"
                >
                  {customer.name}
                </Link>
              </td>
              <td className="p-4 whitespace-nowrap text-sm text-gray-900">
                {customer.email}
              </td>
              <td className="p-4 whitespace-nowrap text-sm text-gray-900">
                {customer.phone}
              </td>
              <td className="p-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(customer.createdAt).toLocaleDateString()}
              </td>
              <td className="p-4 whitespace-nowrap text-sm text-gray-900">
                {customer._count.bookings} bookings, {customer._count.reviews}{" "}
                reviews
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPagination = () => (
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
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Customers</h1>
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search customers by email"
            className="w-full px-4 py-2 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {loading || searching ? (
        renderSkeletonLoader()
      ) : error ? (
        <div className="text-center text-red-500">
          <FaExclamationTriangle className="text-5xl mb-4" />
          <p>{error}</p>
        </div>
      ) : customers.length > 0 ? (
        <>
          {renderCustomerList()}
          {!searchQuery && renderPagination()}
        </>
      ) : (
        <div className="text-center text-gray-500">No customers found</div>
      )}
    </div>
  );
};

export default Customers;
