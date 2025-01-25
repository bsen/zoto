import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaChartBar,
  FaShoppingCart,
  FaUsers,
  FaSignOutAlt,
  FaClipboardCheck,
  FaToolbox,
  FaCog,
} from "react-icons/fa";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const sidebarItems = [
    { path: "/dashboard", icon: FaChartBar, text: "Dashboard" },
    { path: "/dashboard/new-orders", icon: FaShoppingCart, text: "New Orders" },
    {
      path: "/dashboard/processed-orders",
      icon: FaClipboardCheck,
      text: "Processed Orders",
    },
    { path: "/dashboard/customers", icon: FaUsers, text: "Customers" },
    { path: "/dashboard/vendors", icon: FaToolbox, text: "Vendors" },
    {
      path: "/dashboard/services",
      icon: FaCog,
      text: "Services",
    },
  ];

  return (
    <div className="flex flex-col w-52 bg-white border-r border-gray-200 h-screen shadow-lg flex-shrink-0">
      <div className="flex items-center justify-between h-16 px-4 bg-indigo-600">
        <h1 className="text-4xl font-bold text-white">
          z<span className="text-yellow-400">o</span>to
        </h1>
      </div>
      <nav className="flex-grow py-4">
        {sidebarItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 transition duration-150 ${
              isActive(item.path)
                ? "bg-indigo-100 border-r-4 border-indigo-500"
                : ""
            }`}
          >
            <item.icon
              className={`mr-3 ${
                isActive(item.path) ? "text-indigo-500" : "text-gray-500"
              }`}
              size={20}
            />
            <span
              className={
                isActive(item.path) ? "text-indigo-500 font-medium" : ""
              }
            >
              {item.text}
            </span>
          </Link>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center px-4 py-3 mt-auto mb-4 text-gray-700 hover:bg-red-50 transition duration-150"
      >
        <FaSignOutAlt className="mr-3 text-red-500" size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
