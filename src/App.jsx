// App.jsx
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Halaman Auth
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";

// Halaman Dashboard
import Dashboard from "./pages/Dashboard/Dashboard";

// Halaman MasterData dan Tracking
import MasterData from "./pages/MasterData/MasterData";
import Tracking from "./pages/Tracking/Tracking";
import TrackingSuperAdmin from "./pages/Tracking/TrackingSuperAdmin";

// Halaman InfoDriver, ByPass, Settings
import InfoDriver from "./pages/Auth/InfoDriver";
import InfoDriverDetail from "./pages/Auth/InfoDriverDetail";
import ByPass from "./pages/Auth/ByPass";
import Settings from "./pages/Auth/Settings";

// Halaman EditTruck
import EditTruck from "./pages/MasterData/EditTruck";

// Halaman Checkpoint
import Checkpoint from "./pages/Dashboard/Checkpoint";

// Halaman Timbang Muat & Timbang Gudang
import TimbangMuat from "./pages/Dashboard/TimbangMuat";
import TimbangGudang from "./pages/Dashboard/TimbangGudang";

// Logout
function Logout({ setUserRole }) {
  const navigate = useNavigate();
  useEffect(() => {
    setUserRole(null);
    localStorage.removeItem("userRole");
    navigate("/login", { replace: true });
  }, [setUserRole, navigate]);
  return null;
}

// Default route berdasarkan role
const defaultRouteByRole = (role) => {
  switch (role) {
    case "Admin":
    case "Super Admin":
      return "/dashboard";
    case "User":
      return "/info-driver"; // User default buka Info Driver
    default:
      return "/login";
  }
};

export default function App() {
  const [userRole, setUserRole] = useState(() => localStorage.getItem("userRole") || null);
  const isLoggedIn = !!userRole;

  // Simpan role ke localStorage
  useEffect(() => {
    if (userRole) localStorage.setItem("userRole", userRole);
    else localStorage.removeItem("userRole");
  }, [userRole]);

  // Proteksi route
  const protectedRoute = (element, allowedRoles) => {
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(userRole)) return <Navigate to={defaultRouteByRole(userRole)} replace />;
    return element;
  };

  return (
    <Routes>
      {/* Auth */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login setUserRole={setUserRole} />} />

      {/* Logout */}
      <Route path="/logout" element={<Logout setUserRole={setUserRole} />} />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={protectedRoute(<Dashboard role={userRole} />, ["Admin", "Super Admin"])}
      />

      {/* Master Data → Admin & User */}
      <Route path="/master-data" element={protectedRoute(<MasterData role={userRole} />, ["Admin", "User"])} />

      {/* Edit Truck → Admin */}
      <Route path="/edit-truck/:truckId" element={protectedRoute(<EditTruck role={userRole} />, ["Admin"])} />

      {/* Tracking */}
      <Route
        path="/tracking"
        element={protectedRoute(
          userRole === "Super Admin" ? <TrackingSuperAdmin role={userRole} /> : <Tracking role={userRole} />,
          ["Admin", "Super Admin", "User"]
        )}
      />

      {/* Checkpoint */}
      <Route path="/checkpoint" element={protectedRoute(<Checkpoint role={userRole} />, ["Admin", "Super Admin", "User"])} />

      {/* Timbang Muat */}
      <Route path="/timbang-muat" element={protectedRoute(<TimbangMuat role={userRole} />, ["Admin", "Super Admin", "User"])} />

      {/* Timbang Gudang */}
      <Route path="/timbang-gudang" element={protectedRoute(<TimbangGudang role={userRole} />, ["Admin", "Super Admin", "User"])} />

      {/* Info Driver */}
      <Route path="/info-driver" element={protectedRoute(<InfoDriver role={userRole} />, ["Admin", "Super Admin", "User"])} />
      <Route path="/info-driver/:truckId" element={protectedRoute(<InfoDriverDetail role={userRole} />, ["Admin", "Super Admin", "User"])} />

      {/* ByPass → Super Admin */}
      <Route path="/bypass" element={protectedRoute(<ByPass role={userRole} />, ["Super Admin"])} />

      {/* Settings → Admin & Super Admin */}
      <Route path="/settings" element={protectedRoute(<Settings role={userRole} />, ["Admin", "Super Admin"])} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={isLoggedIn ? defaultRouteByRole(userRole) : "/login"} replace />} />
    </Routes>
  );
}
