import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetData, setResetData] = useState({
    phone: "",
    newPass: "",
  });
  const [resetMessage, setResetMessage] = useState({ type: "", message: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResetChange = (e) => {
    setResetData({ ...resetData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      setIsLoading(true);
      setError("");

      const response = await axios.post(
        "https://www.server.zotoplatforms.com/api/auth/login",
        formData
      );

      if (response.data.status === 200) {
        localStorage.setItem("token", response.data.data.token);
        navigate("/");
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResetMessage({ type: "", message: "" });

    try {
      const response = await axios.post(
        "https://www.server.zotoplatforms.com/api/update/pass",
        resetData
      );

      if (response.data.success) {
        setResetMessage({ type: "success", message: response.data.message });
        setTimeout(() => {
          setShowResetModal(false);
          setResetData({ phone: "", newPass: "" });
        }, 1000);
      } else {
        setResetMessage({ type: "error", message: response.data.message });
      }
    } catch (error) {
      setResetMessage({
        type: "error",
        message: error.response?.data?.message || "Failed to reset password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center">
          <Link to="/" className="flex items-center w-full justify-center">
            <img src="/zoto.png" className="h-10 rounded" alt="Logo" />
          </Link>
          <p className="mt-2 text-2xl text-white">Welcome back</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 bg-white p-6 rounded-lg shadow"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                maxLength={10}
                className="mt-1 block w-full p-3 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            <div className="text-center mt-4 space-y-2">
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-indigo-600 hover:text-indigo-500 block w-full"
              >
                Forgot Password?
              </button>
              <Link
                to="/signup"
                className="text-indigo-600 hover:text-indigo-500 block"
              >
                Don't have an account? Sign up
              </Link>
            </div>
          </div>
        </form>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <h2 className="text-xl font-semibold mb-4">Reset Password</h2>

            {resetMessage.message && (
              <div
                className={`mb-4 p-3 rounded ${
                  resetMessage.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {resetMessage.message}
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  value={resetData.phone}
                  onChange={handleResetChange}
                  maxLength={10}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  name="newPass"
                  type="password"
                  required
                  value={resetData.newPass}
                  onChange={handleResetChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter new password"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 py-3 px-4 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isLoading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetMessage({ type: "", message: "" });
                    setResetData({ phone: "", newPass: "" });
                  }}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
