import React from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import Auth from "./components/Auth";
import Home from "./components/Home";

const ProtectedRoute = ({ children }) => {
  const vendorToken = localStorage.getItem("vendorToken");
  const location = useLocation();

  if (!vendorToken) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const vendorToken = localStorage.getItem("vendorToken");
  const location = useLocation();

  if (vendorToken) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
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
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
