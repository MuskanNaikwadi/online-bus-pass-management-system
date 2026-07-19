import React from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaHome,
  FaClipboardList,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBell,
  FaUser,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { useUser, getPhotoUrl } from "../context/UserContext";

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, setUser } = useUser();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to log out of the admin panel?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "${process.env.REACT_APP_API_URL}/api/users/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
   } catch (error) {
      console.log("Admin logout error:", error);
    } finally {
      localStorage.clear();
      window.location.href = "/login"; // ✅ hard reload clears all state
    }
  };

  const NAV_ITEMS = [
    { path: "/admin-dashboard", label: "Dashboard", icon: <FaHome /> },
    { path: "/admin-applications", label: "Applications", icon: <FaClipboardList /> },
    { path: "/admin-approved-passes", label: "Approved Passes", icon: <FaCheckCircle /> },
    { path: "/admin-emergencies", label: "Emergency Application", icon: <FaExclamationTriangle /> },
    { path: "/admin-rejected-passes", label: "Rejected Passes", icon: <FaBell /> },
    { path: "/admin-settings", label: "Settings", icon: <FaCog /> },
    { path: "/admin-profile", label: "Profile", icon: <FaUser /> },
  ];

  return (
    <div className="sidebar">
      <div className="logo">Admin Panel</div>

      {/* ---- Mini profile — syncs instantly with AdminProfile changes ---- */}
      <div
        className="sidebar-admin-mini-profile"
        onClick={() => navigate("/admin-profile")}
        style={{ cursor: "pointer" }}
      >
        <div className="sidebar-admin-avatar">
          {user?.photo ? (
            <img src={getPhotoUrl(user.photo)} alt="" />
          ) : (
            user?.name?.charAt(0) || "A"
          )}
        </div>
        <div>
          <p className="sidebar-admin-name">{user?.name || "Admin"}</p>
          <span className="sidebar-admin-role">Administrator</span>
        </div>
      </div>

      <ul>
        {NAV_ITEMS.map((item) => (
          <li
            key={item.path}
            className={location.pathname === item.path ? "active" : ""}
            onClick={() => navigate(item.path)}
            style={{ cursor: "pointer" }}
          >
            {item.icon} {item.label}
          </li>
        ))}

        <li
          className="logout-item"
          onClick={handleLogout}
          style={{ cursor: "pointer" }}
        >
          ← Logout
        </li>
      </ul>
    </div>
  );
}

export default AdminSidebar;