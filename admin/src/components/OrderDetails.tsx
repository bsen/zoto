import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaExclamationTriangle, FaWhatsapp } from "react-icons/fa";

interface OrderDetails {
  id: string;
  userId: string;
  serviceId: string;
  datetime: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  notes: string;
  name: string;
  phone: string;
  user: {
    id: string;
    email: string;
  };
  service: {
    name: string;
    description: string;
    price: number;
  };
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

const OrderDetails: React.FC = () => {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `https://server.zotoplatforms.com/api/admin/zotoplatforms/panel/orders/${orderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrder(response.data);
      } catch (err) {
        setError("Failed to fetch order details. Please try again.");
        console.error("Error fetching order details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const openWhatsApp = (phoneNumber: string, orderDetails: OrderDetails) => {
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, "");
    const message =
      `Hello ${orderDetails.name},\n\nThank you for your order with Zoto Platforms!\n\n` +
      `Order Details:\n` +
      `- Order ID: ${orderDetails.id}\n` +
      `- Service: ${orderDetails.service.name}\n` +
      `- Date: ${new Date(orderDetails.datetime).toLocaleString()}\n` +
      `- Status: ${orderDetails.status}\n` +
      `- Total Amount: ₹${orderDetails.totalAmount.toFixed(2)}\n\n` +
      `If you have any questions about your order, please don't hesitate to ask.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-10 w-48 bg-gray-300 rounded mb-6 animate-pulse" />
        <div className="h-8 w-64 bg-gray-300 rounded mb-6 animate-pulse" />
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <div className="h-6 w-1/2 bg-gray-300 rounded animate-pulse mb-2" />
            <div className="h-4 w-1/3 bg-gray-300 rounded animate-pulse" />
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            {[...Array(10)].map((_, index) => (
              <div
                key={index}
                className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
              >
                <div className="h-4 w-1/4 bg-gray-300 rounded animate-pulse" />
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <div className="h-4 w-3/4 bg-gray-300 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
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

  if (!order) {
    return <div className="text-center">No order found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div
        onClick={() => navigate(-1)}
        className="flex items-center text-indigo-600 mb-6 cursor-pointer"
      >
        <FaArrowLeft className="mr-2" />
        Back to Orders
      </div>
      <h1 className="text-3xl font-bold mb-6">Order Details</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">
            Order ID: {order.id}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Placed on {new Date(order.datetime).toLocaleString()}
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Customer</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <Link
                  to={`/dashboard/customer/${order.user.id}`}
                  className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-full"
                >
                  {order.name}
                </Link>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {order.user.email}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 flex items-center">
                <button
                  onClick={() => openWhatsApp(order.phone, order)}
                  className="ml-2 text-green-600 hover:text-green-800 flex gap-2"
                  title="Open WhatsApp chat"
                >
                  {order.phone} <FaWhatsapp size={20} />
                </button>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Service</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {order.service.name}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Total Amount
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                ₹{order.totalAmount.toFixed(2)}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {order.status}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Payment Status
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {order.paymentStatus}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {order.address.street}, {order.address.city},{" "}
                {order.address.state}, {order.address.country},{" "}
                {order.address.zipCode}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {order.notes || "No notes"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
