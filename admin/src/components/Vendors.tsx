import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  createdAt: string;
  _count: {
    serviceAssigned: number;
  };
}

const Vendors: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (searchQuery) {
      const delayDebounceFn = setTimeout(() => {
        searchVendors();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      fetchVendors();
    }
  }, [currentPage, searchQuery]);

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://server.zotoplatforms.com/api/admin/zotoplatforms/panel/vendors?page=${currentPage}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setVendors(response.data.vendors);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError("Failed to fetch vendors. Please try again.");
      console.error("Error fetching vendors:", err);
    } finally {
      setLoading(false);
    }
  };

  const searchVendors = async () => {
    setSearching(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://server.zotoplatforms.com/api/admin/zotoplatforms/panel/search-vendors",
        { query: searchQuery },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setVendors(response.data.vendors);
      setTotalPages(1); // Search results are not paginated
    } catch (err) {
      setError("Failed to search vendors. Please try again.");
      console.error("Error searching vendors:", err);
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

  const renderVendorList = () => (
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
              Verified
            </th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Available
            </th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Services
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {vendors.map((vendor) => (
            <tr key={vendor.id}>
              <td className="p-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                <Link
                  to={`/dashboard/vendor/${vendor.id}`}
                  className="bg-indigo-50 px-3 py-1 rounded-full"
                >
                  {vendor.name}
                </Link>
              </td>
              <td className="p-4 whitespace-nowrap text-sm text-gray-900">
                {vendor.email}
              </td>
              <td className="p-4 whitespace-nowrap text-sm text-gray-900">
                {vendor.phone}
              </td>
              <td className="p-4 whitespace-nowrap text-sm text-gray-900">
                {vendor.isVerified ? (
                  <FaCheckCircle className="text-green-500" />
                ) : (
                  <FaTimesCircle className="text-red-500" />
                )}
              </td>
              <td className="p-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(vendor.createdAt).toLocaleDateString()}
              </td>
              <td className="p-4 whitespace-nowrap text-sm text-gray-900">
                {vendor._count.serviceAssigned} assigned
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
      <h1 className="text-3xl font-bold mb-6">Vendors</h1>
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search vendors by name, email, or phone"
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
      ) : vendors.length > 0 ? (
        <>
          {renderVendorList()}
          {!searchQuery && renderPagination()}
        </>
      ) : (
        <div className="text-center text-gray-500">No vendors found</div>
      )}
    </div>
  );
};

export default Vendors;
