import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface Booking {
  id: string;
  datetime: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  service: {
    name: string;
  };
}

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture: string | null;
  addresses: Address[];
  _count: {
    bookings: number;
    reviews: number;
  };
}

interface ProfileResponse {
  user: CustomerProfile;
  bookings: Booking[];
  currentPage: number;
  totalPages: number;
  totalBookings: number;
}

const CustomerProfile: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomerProfile(currentPage);
  }, [userId, currentPage]);

  const fetchCustomerProfile = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<ProfileResponse>(
        `https://server.zotoplatforms.com/api/admin/zotoplatforms/panel/users/${userId}/profile?page=${page}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfileData(response.data);
    } catch (err) {
      setError("Failed to fetch customer profile. Please try again.");
      console.error("Error fetching customer profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (profileData && newPage > profileData.totalPages)) {
      return;
    }
    setCurrentPage(newPage);
  };

  const openWhatsApp = (phoneNumber: string, name: string) => {
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, "");
    const message = `Hello ${name}, thank you for connecting with Zoto Platforms!`;
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 w-32 bg-gray-300 rounded mb-6" />
        <div className="h-10 w-64 bg-gray-300 rounded mb-6" />
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 flex items-center">
            <div className="w-16 h-16 bg-gray-300 rounded-full mr-4" />
            <div>
              <div className="h-6 w-48 bg-gray-300 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-300 rounded" />
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
              >
                <div className="h-4 w-24 bg-gray-300 rounded" />
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <div className="h-4 w-48 bg-gray-300 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="h-8 w-48 bg-gray-300 rounded mb-4" />
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[...Array(5)].map((_, index) => (
                  <th key={index} className="px-6 py-3">
                    <div className="h-4 w-24 bg-gray-300 rounded" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, index) => (
                <tr key={index}>
                  {[...Array(5)].map((_, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-4">
                      <div className="h-4 w-24 bg-gray-300 rounded" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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

  if (!profileData) {
    return <div className="text-center">No customer profile found.</div>;
  }

  const { user, bookings } = profileData;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-indigo-600 mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Back
      </button>
      <h1 className="text-3xl font-bold mb-6">Customer Profile</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex items-center">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.name}
              className="w-16 h-16 rounded-full mr-4"
            />
          ) : (
            <FaUser className="w-16 h-16 text-gray-400 mr-4" />
          )}
          <div>
            <h2 className="text-2xl leading-6 font-medium text-gray-900">
              {user.name}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Customer ID: {user.id}
            </p>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FaEnvelope className="mr-2" /> Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.email}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FaPhone className="mr-2" /> Phone
              </dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 flex items-center">
                {!user.phone && "Not provided"}
                {user.phone && (
                  <button
                    onClick={() => openWhatsApp(user.phone, user.name)}
                    className="ml-2 text-green-600 hover:text-green-800 flex gap-2"
                    title="Open WhatsApp chat"
                  >
                    {user.phone} <FaWhatsapp size={20} />
                  </button>
                )}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FaMapMarkerAlt className="mr-2" /> Addresses
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.addresses && user.addresses.length > 0 ? (
                  user.addresses.map((address) => (
                    <div key={address.id} className="mb-2">
                      {address.street}, {address.city}, {address.state},{" "}
                      {address.country}, {address.zipCode}
                    </div>
                  ))
                ) : (
                  <p>No addresses found</p>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Order History</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings && bookings.length > 0 ? (
              bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    <Link
                      to={`/dashboard/order/${booking.id}`}
                      className="bg-indigo-50 py-1 px-3 rounded-full"
                    >
                      {booking.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(booking.datetime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.service.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {profileData.totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {profileData.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === profileData.totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;
