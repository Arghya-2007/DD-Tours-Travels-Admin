import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Trips from "./pages/Trips";
import Users from "./pages/Users";
import Bookings from "./pages/Bookings";
import Settings from "./pages/Settings";
// 🔴 FIX 1: Import it with the name you use below (AdminBlogs)
import AdminBlogs from "./pages/AdminBlogs";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Note: No "/" at the start of these paths */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="trips" element={<Trips />} />
          <Route path="bookings" element={<Bookings />} />

          {/* 🔴 FIX 2: Use relative path "blogs" (Result: /admin/blogs) */}
          <Route path="blogs" element={<AdminBlogs />} />

          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Redirect Root to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
