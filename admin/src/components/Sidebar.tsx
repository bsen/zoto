import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartBar,
  FaShoppingCart,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaClipboardCheck,
} from "react-icons/fa";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
  ];

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0, width: isCollapsed ? "4rem" : "14rem" }}
      transition={{ duration: 0.3 }}
      className="flex flex-col bg-white border-r border-gray-200 h-screen shadow-lg"
    >
      <div className="flex items-center justify-between h-16 px-4 bg-indigo-600">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <h1 className="text-4xl font-bold text-white">
                z<span className="text-yellow-400">o</span>to
              </h1>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white"
        >
          {isCollapsed ? <FaBars size={20} /> : <FaTimes size={20} />}
        </button>
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
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={
                    isActive(item.path) ? "text-indigo-500 font-medium" : ""
                  }
                >
                  {item.text}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center px-4 py-3 mt-auto mb-4 text-gray-700 hover:bg-red-50 transition duration-150"
      >
        <FaSignOutAlt className="mr-3 text-red-500" size={20} />
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              Logout
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
};

export default Sidebar;
