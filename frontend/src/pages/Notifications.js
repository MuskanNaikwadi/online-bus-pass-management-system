import Sidebar from "../components/Sidebar";
import SOSButton from "../components/SOSButton";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaMoneyBillWave,
  FaFileAlt,
  FaBell,
  FaCheckDouble,
} from "react-icons/fa";
import "./Dashboard.css";
import "./Notifications.css";

import { useUser, getPhotoUrl } from "../context/UserContext";

const FILTERS = ["All", "Unread", "approval", "rejection", "payment", "refund", "expiry", "sos"];

const TYPE_META = {
  approval: { icon: <FaCheckCircle />, className: "approval", label: "Approved" },
  rejection: { icon: <FaTimesCircle />, className: "rejection", label: "Rejected" },
  expiry: { icon: <FaExclamationTriangle />, className: "expiry", label: "Expiry" },
  sos: { icon: <FaShieldAlt />, className: "sos", label: "SOS" },
  refund: { icon: <FaMoneyBillWave />, className: "refund", label: "Refund" },
  payment: { icon: <FaMoneyBillWave />, className: "payment", label: "Payment" },
  document: { icon: <FaFileAlt />, className: "document", label: "Document" },
};

function Notifications() {
  const navigate = useNavigate();

  // ✅ user now comes from shared UserContext — no local fetch needed
  const { user } = useUser();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // ✅ correct endpoint — user-specific notifications, not admin's global list
      const res = await axios.get(
        "http://localhost:5000/api/buspass/user-notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications(res.data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/buspass/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.log(error);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/buspass/notifications/read-all",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.log(error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "All") return notifications;
    if (activeFilter === "Unread") return notifications.filter((n) => !n.isRead);
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        {/* ---- Navbar — same as Dashboard ---- */}
        <div className="topbar">
          <h2>Notifications</h2>

          <div className="user-box">
            <div
              className="notification-icon"
              onClick={() => navigate("/notifications")}
            >
              🔔
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount}
                </span>
              )}
            </div>

            <div
              className="profile-box"
              onClick={() => navigate("/profile")}
              style={{ cursor: "pointer" }}
            >
              <div className="profile-circle nav-avatar">
                {user?.photo ? (
                  <img src={getPhotoUrl(user.photo)} alt="Profile" />
                ) : (
                  user?.name?.charAt(0) || "U"
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="notif-panel">
          <div className="notif-panel-header">
            <div>
              <h3>All Notifications</h3>
              <p className="notif-subtext">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""
                  }`
                  : "You're all caught up"}
              </p>
            </div>

            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={markAllRead}>
                <FaCheckDouble size={12} /> Mark all as read
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div className="notif-filter-bar">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`notif-chip ${activeFilter === f ? "active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f === "All" || f === "Unread"
                  ? f
                  : TYPE_META[f]?.label || f}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="notif-loading">
              <div className="notif-spinner"></div>
              <p>Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="no-notif">
              <div className="no-notif-icon">
                <FaBell />
              </div>
              <h3>No Notifications</h3>
              <p>
                {activeFilter === "All"
                  ? "You don't have any notifications yet."
                  : "Nothing here for this filter."}
              </p>
            </div>
          ) : (
            <div className="notif-list">
              {filteredNotifications.map((item) => {
                const meta = TYPE_META[item.type] || TYPE_META.approval;
                return (
                  <div
                    key={item._id}
                    className={`notif-item ${item.isRead ? "" : "unread"}`}
                    onClick={() => !item.isRead && markAsRead(item._id)}
                  >
                    <div className={`notif-icon-badge ${meta.className}`}>
                      {meta.icon}
                    </div>

                    <div className="notif-content">
                      <div className="notif-top-row">
                        <h4>{item.title}</h4>
                        {!item.isRead && <span className="unread-dot"></span>}
                      </div>
                      <p>{item.message}</p>
                      <small>
                        {new Date(item.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <SOSButton />
      </div>
    </div>
  );
}

export default Notifications;