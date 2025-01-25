import React from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import Auth from "./components/Auth";
import Layout from "./components/Layout";
import DashboardHome from "./components/DashboardHome";
import NewOrders from "./components/NewOrders";
import Customers from "./components/Customers";
import ProcessedOrders from "./components/ProcessedOrders";
import OrderDetails from "./components/OrderDetails";
import CustomerProfile from "./components/CustomerProfile";
import Vendors from "./components/Vendors";
import VendorProfile from "./components/VendorsProfile";
import ServicesManagement from "./components/Services";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (token) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="dashboard/new-orders" element={<NewOrders />} />
          <Route
            path="dashboard/processed-orders"
            element={<ProcessedOrders />}
          />
          <Route path="dashboard/customers" element={<Customers />} />
          <Route path="dashboard/order/:orderId" element={<OrderDetails />} />
          <Route
            path="dashboard/customer/:userId"
            element={<CustomerProfile />}
          />
          <Route path="dashboard/vendors" element={<Vendors />} />
          <Route
            path="dashboard/vendor/:vendorId"
            element={<VendorProfile />}
          />
          <Route path="dashboard/services" element={<ServicesManagement />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
