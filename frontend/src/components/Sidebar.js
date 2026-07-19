import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import {
  FaBus,
  FaIdCard,
  FaBell,
  FaShieldAlt,
  FaMoneyBill,
  FaCog,
  FaHome,
  FaUser,
  FaSyncAlt
} from "react-icons/fa";

function Sidebar() {

  const navigate = useNavigate();
  const location = useLocation();

 const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "${process.env.REACT_APP_API_URL}/api/users/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.log(error);
    } finally {
      localStorage.clear();
      window.location.href = "/login";
    }
  };
  const menuItems = [
    {
      path: "/dashboard",
      icon: <FaHome />,
      name: "Dashboard"
    },
    {
      path: "/apply-pass",
      icon: <FaIdCard />,
      name: "Apply For Pass"
    },
    {
      path: "/my-passes",
      icon: <FaBus />,
      name: "My Passes"
    },
    {
      path: "/women-safety",
      icon: <FaShieldAlt />,
      name: "Women Safety"
    },
    {
      path: "/payment-history",
      icon: <FaMoneyBill />,
      name: "Payment History"
    },
    {
      path: "/notifications",
      icon: <FaBell />,
      name: "Notifications"
    },
    {
      path: "/settings",
      icon: <FaCog />,
      name: "Settings"
    },
    {
      path: "/profile",
      icon: <FaUser />,
      name: "Profile"
    }
  ];


  return (
    <div className="sidebar">

      <div className="logo">
        🚌 eBusPass
      </div>


      <ul>

        {menuItems.map((item) => (

          <li
            key={item.path}
            className={
              location.pathname === item.path
              ? "active"
              : ""
            }
            onClick={() => navigate(item.path)}
          >

            {item.icon}
            <span>{item.name}</span>

          </li>

        ))}


        <li
          className="logout-item"
          onClick={handleLogout}
        >
          ← Logout
        </li>


      </ul>

    </div>
  );
}

export default Sidebar;