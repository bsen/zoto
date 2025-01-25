import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const VendorSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    address: "",
    pincode: "",
    aadhaarNumber: "",
    panNumber: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("vendorToken");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      setIsLoading(true);
      setError("");

      const response = await axios.post(
        "https://www.server.zotoplatforms.com/vendor/api/vendor-auth/signup",
        formData
      );

      if (response.data.status === 200) {
        localStorage.setItem("vendorToken", response.data.data.token);
        navigate("/");
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            z<span className="text-yellow-400">o</span>to Vendor
          </h1>
          <p className="mt-2 text-2xl text-white">Create your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-lg"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
              />
            </div>

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
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                required
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your address"
              />
            </div>

            <div>
              <label
                htmlFor="pincode"
                className="block text-sm font-medium text-gray-700"
              >
                Pincode
              </label>
              <select
                id="pincode"
                name="pincode"
                required
                value={formData.pincode}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a pincode</option>
                {["631102", "631202", "631303"].map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="aadhaarNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Aadhaar Number
              </label>
              <input
                id="aadhaarNumber"
                name="aadhaarNumber"
                type="text"
                required
                value={formData.aadhaarNumber}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Aadhaar number"
              />
            </div>

            <div>
              <label
                htmlFor="panNumber"
                className="block text-sm font-medium text-gray-700"
              >
                PAN Number
              </label>
              <input
                id="panNumber"
                name="panNumber"
                type="text"
                required
                value={formData.panNumber}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter PAN number"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorSignup;
