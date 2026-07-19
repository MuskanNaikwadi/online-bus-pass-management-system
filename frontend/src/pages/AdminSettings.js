import AdminSidebar from "../components/AdminSidebar";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaMoon,
  FaSun,
  FaGlobe,
  FaBell,
  FaEnvelope,
  FaShieldAlt,
  FaClock,
  FaLock,
  FaHistory,
  FaExclamationTriangle,
} from "react-icons/fa";

import "./AdminSettings.css";
import { useAdminTheme } from "../context/AdminThemeContext";

const ADMIN_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी (Hindi)" },
];

function AdminSettings() {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useAdminTheme();

  const [language, setLanguage] = useState("en");
  const [newApplicationAlerts, setNewApplicationAlerts] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminSettings();
  }, []);

  const fetchAdminSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const settings = res.data.adminSettings || {};
      setLanguage(settings.language ?? "en");
      setNewApplicationAlerts(settings.newApplicationAlerts ?? true);
      setEmergencyAlerts(settings.emergencyAlerts ?? true);
      setEmailAlerts(settings.emailAlerts ?? true);
      setSessionTimeout(settings.sessionTimeout ?? 30);
      setTwoFactorEnabled(settings.twoFactorEnabled ?? false);
    } catch (error) {
      console.log("Fetch admin settings error:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/admin-settings`,
        {
          darkMode,
          language,
          newApplicationAlerts,
          emergencyAlerts,
          emailAlerts,
          sessionTimeout,
          twoFactorEnabled,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save admin settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClearActivityLog = async () => {
    const result = await Swal.fire({
      title: "Clear Activity Log?",
      text: "This will remove your local admin action history.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Clear",
      confirmButtonColor: "#dc2626",
    });

    if (result.isConfirmed) {
      localStorage.removeItem("adminActivityLog");
      Swal.fire({
        icon: "success",
        title: "Cleared",
        timer: 1200,
        showConfirmButton: false,
      });
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <AdminSidebar />
        <div className="main-content">
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <AdminSidebar />

      <div className="main-content">
        {/* ---- Topbar ---- */}
        <div className="topbar">
          <div className="page-header">
            <h2>Admin Settings</h2>
            <p>Preferences here apply only to the admin panel</p>
          </div>

          <div className="topbar-right">
            <div
              className="profile-circle"
              onClick={() => navigate("/admin-profile")}
              style={{ cursor: "pointer" }}
            >
              A
            </div>
          </div>
        </div>

        <div className="admin-settings-page">
          {/* ---- Scope notice ---- */}
          <div className="scope-notice">
            <FaShieldAlt />
            <span>
              These settings affect the <strong>admin panel only</strong>.
              Regular users and their app experience are never impacted.
            </span>
          </div>

          {/* ---- Appearance ---- */}
          <div className="settings-card">
            <div className="settings-card-header">
              {darkMode ? <FaMoon /> : <FaSun />}
              <h3>Appearance</h3>
            </div>

            <div className="setting-item">
              <div className="setting-item-text">
                <span className="setting-label">Admin Dark Mode</span>
                <span className="setting-desc">
                  Purple dark theme for the admin panel only
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-item-text">
                <span className="setting-label">
                  <FaGlobe size={13} style={{ marginRight: 6 }} />
                  Admin Panel Language
                </span>
                <span className="setting-desc">
                  Language for the admin interface
                </span>
              </div>
              <select
                className="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {ADMIN_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ---- Notifications ---- */}
          <div className="settings-card">
            <div className="settings-card-header">
              <FaBell />
              <h3>Alerts & Notifications</h3>
            </div>

            <div className="setting-item">
              <div className="setting-item-text">
                <span className="setting-label">
                  <FaBell size={13} style={{ marginRight: 6 }} />
                  New Application Alerts
                </span>
                <span className="setting-desc">
                  Get notified when a user submits a new pass application
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={newApplicationAlerts}
                  onChange={() =>
                    setNewApplicationAlerts(!newApplicationAlerts)
                  }
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-item-text">
                <span className="setting-label">
                  <FaExclamationTriangle size={13} style={{ marginRight: 6 }} />
                  Emergency SOS Alerts
                </span>
                <span className="setting-desc">
                  Get notified instantly for emergency SOS triggers
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={emergencyAlerts}
                  onChange={() => setEmergencyAlerts(!emergencyAlerts)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-item-text">
                <span className="setting-label">
                  <FaEnvelope size={13} style={{ marginRight: 6 }} />
                  Email Alerts
                </span>
                <span className="setting-desc">
                  Receive a daily summary email of pending applications
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={() => setEmailAlerts(!emailAlerts)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          {/* ---- Security (admin-exclusive features) ---- */}
          <div className="settings-card">
            <div className="settings-card-header">
              <FaLock />
              <h3>Security</h3>
            </div>

            <div className="setting-item">
              <div className="setting-item-text">
                <span className="setting-label">
                  <FaClock size={13} style={{ marginRight: 6 }} />
                  Session Timeout
                </span>
                <span className="setting-desc">
                  Auto-logout after this many minutes of inactivity
                </span>
              </div>
              <select
                className="language-select"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-item-text">
                <span className="setting-label">
                  <FaShieldAlt size={13} style={{ marginRight: 6 }} />
                  Two-Factor Authentication
                </span>
                <span className="setting-desc">
                  Require an OTP on login for extra admin security
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-item-text">
                <span className="setting-label">Change Password</span>
                <span className="setting-desc">
                  Update your admin account password
                </span>
              </div>
              <button
                className="link-btn"
                onClick={() => navigate("/admin-profile")}
              >
                Manage
              </button>
            </div>
          </div>

          {/* ---- System / Activity ---- */}
          <div className="settings-card">
            <div className="settings-card-header">
              <FaHistory />
              <h3>Activity</h3>
            </div>

            <div className="setting-item">
              <div className="setting-item-text">
                <span className="setting-label">Clear Local Activity Log</span>
                <span className="setting-desc">
                  Remove locally stored admin action history from this device
                </span>
              </div>
              <button className="link-btn danger" onClick={handleClearActivityLog}>
                Clear
              </button>
            </div>
          </div>

          {/* ---- Save bar ---- */}
          <div className="settings-save-bar">
            <button
              className="save-settings-btn"
              onClick={saveSettings}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Admin Settings"}
            </button>
            {saved && <span className="saved-tag">✓ Saved</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;