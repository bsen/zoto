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
  FaIdCard,
  FaCheckCircle,
  FaWhatsapp,
  FaEdit,
  FaSave,
} from "react-icons/fa";

interface ServiceAssigned {
  id: string;
  status: string;
  createdAt: string;
  booking: {
    id: string;
    datetime: string;
    status: string;
    totalAmount: number;
    service: {
      name: string;
    };
  };
}

interface VendorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture: string | null;
  address: string;
  pincode: string;
  aadhaarNumber: string;
  panNumber: string;
  isVerified: boolean;
  createdAt: string;
}

interface ProfileResponse {
  vendor: VendorProfile;
  orders: ServiceAssigned[];
  currentPage: number;
  totalPages: number;
  totalOrders: number;
}

const VendorProfile: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editedVendor, setEditedVendor] = useState<VendorProfile | null>(null);
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVendorProfile(currentPage);
  }, [vendorId, currentPage]);

  const fetchVendorProfile = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<ProfileResponse>(
        `http://localhost:8080/api/admin/zotoplatforms/panel/vendors/${vendorId}/profile?page=${page}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfileData(response.data);
      setEditedVendor(response.data.vendor);
    } catch (err) {
      setError("Failed to fetch vendor profile. Please try again.");
      console.error("Error fetching vendor profile:", err);
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
    const message = `Hello ${name}, this is Zoto Platforms admin. How can we assist you today?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`,
      "_blank"
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedVendor) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/api/admin/zotoplatforms/panel/vendors/${vendorId}`,
        editedVendor,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsEditing(false);
      fetchVendorProfile(currentPage);
    } catch (err) {
      console.error("Error updating vendor profile:", err);
      setError("Failed to update vendor profile. Please try again.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedVendor) {
      setEditedVendor({
        ...editedVendor,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleVerificationToggle = async () => {
    if (!editedVendor) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/api/admin/zotoplatforms/panel/vendors/${vendorId}/verify`,
        { isVerified: !editedVendor.isVerified },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchVendorProfile(currentPage);
    } catch (err) {
      console.error("Error toggling vendor verification:", err);
      setError(
        "Failed to update vendor verification status. Please try again."
      );
    }
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
            {[...Array(6)].map((_, index) => (
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

  if (!profileData || !editedVendor) {
    return <div className="text-center">No vendor profile found.</div>;
  }

  const { vendor, orders } = profileData;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-indigo-600 mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Back
      </button>
      <h1 className="text-3xl font-bold mb-6">Vendor Profile</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center">
            {vendor.profilePicture ? (
              <img
                src={vendor.profilePicture}
                alt={vendor.name}
                className="w-16 h-16 rounded-full mr-4"
              />
            ) : (
              <FaUser className="w-16 h-16 text-gray-400 mr-4" />
            )}
            <div>
              <h2 className="text-2xl leading-6 font-medium text-gray-900">
                {vendor.name}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Vendor ID: {vendor.id}
              </p>
            </div>
          </div>
          <div>
            {isEditing ? (
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaSave className="mr-2" />
                Save
              </button>
            ) : (
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaEdit className="mr-2" />
                Edit
              </button>
            )}
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FaEnvelope className="mr-2" /> Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editedVendor.email}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                ) : (
                  vendor.email
                )}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FaPhone className="mr-2" /> Phone
              </dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 flex items-center">
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editedVendor.phone}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                ) : (
                  <>
                    {vendor.phone}
                    <button
                      onClick={() => openWhatsApp(vendor.phone, vendor.name)}
                      className="ml-2 text-green-600 hover:text-green-800"
                      title="Open WhatsApp chat"
                    >
                      <FaWhatsapp size={20} />
                    </button>
                  </>
                )}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FaMapMarkerAlt className="mr-2" /> Address
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      name="address"
                      value={editedVendor.address}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mb-2"
                    />
                    <input
                      type="text"
                      name="pincode"
                      value={editedVendor.pincode}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </>
                ) : (
                  `${vendor.address}, ${vendor.pincode}`
                )}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FaIdCard className="mr-2" /> Aadhaar Number
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input
                    type="text"
                    name="aadhaarNumber"
                    value={editedVendor.aadhaarNumber}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                ) : (
                  vendor.aadhaarNumber
                )}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FaIdCard className="mr-2" /> PAN Number
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input
                    type="text"
                    name="panNumber"
                    value={editedVendor.panNumber}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                ) : (
                  vendor.panNumber
                )}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FaCheckCircle className="mr-2" /> Verification Status
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {vendor.isVerified ? (
                  <span className="text-green-600">Verified</span>
                ) : (
                  <span className="text-red-600">Not Verified</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">Actions</h2>
        <div className="flex space-x-4">
          <button
            onClick={handleVerificationToggle}
            className={`px-4 py-2 ${
              vendor.isVerified
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            } text-white rounded transition duration-300`}
          >
            {vendor.isVerified ? "Revoke Verification" : "Verify Vendor"}
          </button>
          {vendor.isVerified && (
            <button
              onClick={() => {
                const message =
                  "Congratulations! Your profile has been verified on the Zoto Vendors Platform. You can now start accepting orders and growing your business with us. Welcome aboard!";
                window.open(
                  `https://wa.me/${vendor.phone}?text=${encodeURIComponent(
                    message
                  )}`,
                  "_blank"
                );
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition duration-300"
            >
              Send Verification update
            </button>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Service History</h2>
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
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    <Link
                      to={`/dashboard/order/${order.booking.id}`}
                      className="bg-indigo-50 py-1 px-3 rounded-full"
                    >
                      {order.booking.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.booking.datetime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.booking.service.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.booking.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No orders found
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

export default VendorProfile;
