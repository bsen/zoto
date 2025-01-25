import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";

interface Category {
  id: string;
  name: string;
  _count: {
    services: number;
  };
}

interface CategoryFormData {
  name: string;
}

interface Service {
  id?: string;
  name: string;
  description: string;
  price: number;
  discountedPrice: number | null;
  duration: number | null;
  image: string;
  status: boolean;
  averageRating: number;
  reviewCount: number;
}

interface ServiceFormData {
  id?: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  duration?: number;
  image: string;
  categoryId: string;
  status: boolean;
}

const ServicesManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState<"category" | "service">(
    "service"
  );
  const [deleteId, setDeleteId] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: "",
  });
  const [serviceFormData, setServiceFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    price: 0,
    image: "",
    categoryId: "",
    status: true,
  });

  const fetchCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8080/api/admin/zotoplatforms/panel/categories",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCategories(response.data);
      if (response.data.length > 0 && !selectedCategory) {
        setSelectedCategory(response.data[0].id);
      }
    } catch (err) {
      setError("Failed to fetch categories");
      console.error("Error fetching categories:", err);
    }
  }, [selectedCategory]);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/admin/zotoplatforms/panel/categories/${selectedCategory}/services?page=${currentPage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setServices(response.data.services);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError("Failed to fetch services");
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, currentPage]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (selectedCategory) {
      fetchServices();
    }
  }, [fetchServices]);

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      if (isEditing) {
        await axios.put(
          `http://localhost:8080/api/admin/zotoplatforms/panel/categories/${selectedCategory}`,
          categoryFormData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          "http://localhost:8080/api/admin/zotoplatforms/panel/categories",
          categoryFormData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      fetchCategories();
      setShowCategoryModal(false);
      setCategoryFormData({ name: "" });
      setIsEditing(false);
    } catch (err) {
      setError("Failed to save category");
      console.error("Error saving category:", err);
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      if (isEditing) {
        await axios.put(
          `http://localhost:8080/api/admin/zotoplatforms/panel/services/${serviceFormData.id}`,
          serviceFormData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          "http://localhost:8080/api/admin/zotoplatforms/panel/services",
          serviceFormData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      fetchServices();
      setShowServiceModal(false);
      setServiceFormData({
        name: "",
        description: "",
        price: 0,
        image: "",
        categoryId: selectedCategory,
        status: true,
      });
      setIsEditing(false);
    } catch (err) {
      setError("Failed to save service");
      console.error("Error saving service:", err);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      if (deleteType === "service") {
        await axios.delete(
          `http://localhost:8080/api/admin/zotoplatforms/panel/services/${deleteId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        fetchServices();
      } else {
        await axios.delete(
          `http://localhost:8080/api/admin/zotoplatforms/panel/categories/${deleteId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        fetchCategories();
      }
      setShowDeleteModal(false);
    } catch (err) {
      setError(`Failed to delete ${deleteType}`);
      console.error(`Error deleting ${deleteType}:`, err);
    }
  };

  if (error) {
    return (
      <div className="text-center text-red-500">
        <FaExclamationTriangle className="text-5xl mb-4" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Services Management</h1>
        <div className="space-x-4">
          <button
            onClick={() => {
              setIsEditing(false);
              setCategoryFormData({ name: "" });
              setShowCategoryModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            <FaPlus className="inline mr-2" />
            New Category
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setServiceFormData({
                name: "",
                description: "",
                price: 0,
                image: "",
                categoryId: selectedCategory,
                status: true,
              });
              setShowServiceModal(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            <FaPlus className="inline mr-2" />
            New Service
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Categories sidebar */}
        <div className="col-span-1 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex justify-between items-center"
              >
                <button
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-grow text-left px-4 py-2 rounded-md transition ${
                    selectedCategory === category.id
                      ? "bg-indigo-100 text-indigo-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {category.name}
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setCategoryFormData({
                        name: category.name,
                      });
                      setIsEditing(true);
                      setShowCategoryModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md ml-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteType("category");
                      setDeleteId(category.id);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services list */}
        <div className="col-span-3 bg-white rounded-lg shadow-md">
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Services</h2>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded-md" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="border rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        {service.image && (
                          <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={
                                service.image &&
                                (service.image.startsWith("http://") ||
                                  service.image.startsWith("https://"))
                                  ? service.image
                                  : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
                              }
                              alt={service.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src =
                                  "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";
                              }}
                            />
                          </div>
                        )}
                        <h3 className="text-lg font-semibold">
                          {service.name}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {service.description}
                        </p>
                        <div className="mt-2 space-x-4">
                          <span className="text-gray-600">
                            ₹{service.price.toFixed(2)}
                          </span>
                          {service.discountedPrice && (
                            <span className="text-green-600">
                              ₹{service.discountedPrice.toFixed(2)}
                            </span>
                          )}
                          {service.duration && (
                            <span className="text-gray-600">
                              {service.duration} mins
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setServiceFormData({
                              id: service.id,
                              name: service.name,
                              description: service.description,
                              price: service.price,
                              discountedPrice:
                                service.discountedPrice || undefined,
                              duration: service.duration || undefined,
                              image: service.image,
                              categoryId: selectedCategory, // Use the selected category
                              status: service.status,
                            });
                            setIsEditing(true);
                            setShowServiceModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteType("service");
                            setDeleteId(service.id!);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="p-4 border-t flex justify-between items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              <FaChevronLeft className="inline" />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              <FaChevronRight className="inline" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEditing ? "Edit Category" : "New Category"}
              </h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.name}
                    onChange={(e) =>
                      setCategoryFormData({
                        ...categoryFormData,
                        name: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {isEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEditing ? "Edit Service" : "New Service"}
              </h2>
              <button
                onClick={() => setShowServiceModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleServiceSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={serviceFormData.name}
                    onChange={(e) =>
                      setServiceFormData({
                        ...serviceFormData,
                        name: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Image URL
                  </label>
                  <div className="mt-1 space-y-2">
                    <input
                      type="url"
                      value={serviceFormData.image}
                      onChange={(e) =>
                        setServiceFormData({
                          ...serviceFormData,
                          image: e.target.value,
                        })
                      }
                      placeholder="Enter image URL"
                      className="block w-full border rounded-md px-3 py-2"
                    />
                    {serviceFormData.image && (
                      <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                        <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden">
                          <img
                            src={serviceFormData.image}
                            alt="Service preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder-image.jpg";
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 truncate flex-1">
                          {serviceFormData.image}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setServiceFormData({
                              ...serviceFormData,
                              image: "",
                            })
                          }
                          className="p-1 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={serviceFormData.description}
                    onChange={(e) =>
                      setServiceFormData({
                        ...serviceFormData,
                        description: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price
                    </label>
                    <input
                      type="number"
                      value={serviceFormData.price}
                      onChange={(e) =>
                        setServiceFormData({
                          ...serviceFormData,
                          price: parseFloat(e.target.value),
                        })
                      }
                      className="mt-1 block w-full border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Discounted Price
                    </label>
                    <input
                      type="number"
                      value={serviceFormData.discountedPrice || ""}
                      onChange={(e) =>
                        setServiceFormData({
                          ...serviceFormData,
                          discountedPrice: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        })
                      }
                      className="mt-1 block w-full border rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={serviceFormData.duration || ""}
                      onChange={(e) =>
                        setServiceFormData({
                          ...serviceFormData,
                          duration: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      className="mt-1 block w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      value={serviceFormData.categoryId}
                      onChange={(e) =>
                        setServiceFormData({
                          ...serviceFormData,
                          categoryId: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border rounded-md px-3 py-2"
                      required
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="status"
                    checked={serviceFormData.status}
                    onChange={(e) =>
                      setServiceFormData({
                        ...serviceFormData,
                        status: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label
                    htmlFor="status"
                    className="text-sm font-medium text-gray-700"
                  >
                    Service Active
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {isEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Confirm Delete</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this {deleteType}? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManagement;
