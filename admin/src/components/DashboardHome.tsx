import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaChartBar, FaUsers, FaShoppingCart, FaCogs } from "react-icons/fa";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL =
  "https://server.zotoplatforms.com/api/admin/zotoplatforms/panel";

interface DashboardData {
  summary: SummaryData;
  categoryBookings: CategoryBooking[];
  recentOrders: RecentOrder[];
  customerTypes: CustomerTypes;
}

interface SummaryData {
  totalOrders: number;
  activeServices: number;
  totalCustomers: number;
  totalRevenue: number;
  changes: {
    orderChange: string;
    serviceChange: string;
    customerChange: string;
    revenueChange: string;
  };
}

interface CategoryBooking {
  name: string;
  count: number;
}

interface RecentOrder {
  id: string;
  service: { name: string };
  user: { name: string };
  totalAmount: number;
}

interface CustomerTypes {
  newCustomers: number;
  returningCustomers: number;
  inactiveCustomers: number;
}

const DashboardHome: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [summary, category, recent, types] = await Promise.all([
        axios.get<SummaryData>(`${API_BASE_URL}/dashboard-summary`, {
          headers,
        }),
        axios.get<CategoryBooking[]>(
          `${API_BASE_URL}/service-category-bookings`,
          { headers }
        ),
        axios.get<RecentOrder[]>(`${API_BASE_URL}/recent-orders`, { headers }),
        axios.get<CustomerTypes>(`${API_BASE_URL}/customer-types`, { headers }),
      ]);

      setDashboardData({
        summary: summary.data,
        categoryBookings: category.data,
        recentOrders: recent.data,
        customerTypes: types.data,
      });
    } catch (err) {
      setError("Failed to fetch dashboard data. Please try again.");
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (error)
    return <ErrorMessage message={error} onRetry={fetchDashboardData} />;
  if (!dashboardData) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className=""
    >
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Dashboard Overview
      </h2>
      <SummaryCards summaryData={dashboardData.summary} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ChartCard title="Service Category Bookings">
          <ServiceCategoryChart
            categoryBookings={dashboardData.categoryBookings}
          />
        </ChartCard>
        <ChartCard title="Customer Types">
          <CustomerTypesChart customerTypes={dashboardData.customerTypes} />
        </ChartCard>
      </div>
      <RecentOrdersTable recentOrders={dashboardData.recentOrders} />
    </motion.div>
  );
};

const SummaryCards: React.FC<{ summaryData: SummaryData }> = ({
  summaryData,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <MetricCard
      title="Total Orders"
      value={summaryData.totalOrders.toString()}
      icon={<FaShoppingCart className="text-indigo-500" />}
      change={summaryData.changes.orderChange}
    />
    <MetricCard
      title="Active Services"
      value={summaryData.activeServices.toString()}
      icon={<FaCogs className="text-green-500" />}
      change={summaryData.changes.serviceChange}
    />
    <MetricCard
      title="Customers"
      value={summaryData.totalCustomers.toString()}
      icon={<FaUsers className="text-yellow-500" />}
      change={summaryData.changes.customerChange}
    />
    <MetricCard
      title="Revenue"
      value={`${summaryData.totalRevenue.toFixed(2)}`}
      icon={<FaChartBar className="text-purple-500" />}
      change={summaryData.changes.revenueChange}
    />
  </div>
);

const MetricCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  change: string;
}> = ({ title, value, icon, change }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      {icon}
    </div>
    <p className="text-3xl font-bold mb-2 text-gray-900">{value}</p>
    <p className="text-sm text-green-600">{change} from last month</p>
  </div>
);

const ChartWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="bg-white p-6 rounded-lg shadow-lg h-64">{children}</div>;

const ServiceCategoryChart: React.FC<{
  categoryBookings: CategoryBooking[];
}> = ({ categoryBookings }) => {
  const chartData = {
    labels: categoryBookings.map((booking) => booking.name),
    datasets: [
      {
        label: "Service Bookings",
        data: categoryBookings.map((booking) => booking.count),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
      },
    ],
  };

  return (
    <ChartWrapper>
      {categoryBookings.length > 0 ? (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      ) : (
        <p className="text-gray-500 text-center">
          No category booking data available
        </p>
      )}
    </ChartWrapper>
  );
};
const CustomerTypesChart: React.FC<{ customerTypes: CustomerTypes }> = ({
  customerTypes,
}) => {
  const chartData = {
    labels: ["New", "Returning", "Inactive"],
    datasets: [
      {
        data: [
          customerTypes.newCustomers,
          customerTypes.returningCustomers,
          customerTypes.inactiveCustomers,
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  return (
    <ChartWrapper>
      <Doughnut
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
        }}
      />
    </ChartWrapper>
  );
};

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div>
    <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
    {children}
  </div>
);

const RecentOrdersTable: React.FC<{ recentOrders: RecentOrder[] }> = ({
  recentOrders,
}) => (
  <div className="p-6 bg-white rounded-lg shadow-lg">
    <h3 className="text-xl font-semibold mb-4 text-gray-800">Recent Orders</h3>
    {recentOrders.length > 0 ? (
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="pb-3 text-gray-600">Order ID</th>
            <th className="pb-3 text-gray-600">Service</th>
            <th className="pb-3 text-gray-600">Customer</th>
            <th className="pb-3 text-gray-600">Amount</th>
          </tr>
        </thead>
        <tbody>
          {recentOrders.map((order) => (
            <tr key={order.id}>
              <td className="py-2 text-gray-800">{order.id}</td>
              <td className="text-gray-800">{order.service.name}</td>
              <td className="text-gray-800">{order.user.name}</td>
              <td className="text-gray-800">{order.totalAmount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p className="text-gray-500 text-center">No recent orders available</p>
    )}
  </div>
);

const DashboardSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="bg-gray-100 p-6 rounded-lg">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-10 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {[...Array(2)].map((_, index) => (
        <div key={index} className="bg-gray-100 p-6 rounded-lg">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-40 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
    <div className="bg-gray-100 p-6 rounded-lg">
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="space-y-2">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-4 bg-gray-300 rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

const ErrorMessage: React.FC<{ message: string; onRetry: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className="text-center text-red-500 mt-8">
    <p>{message}</p>
    <button
      onClick={onRetry}
      className="mt-4 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
    >
      Retry
    </button>
  </div>
);

export default DashboardHome;
