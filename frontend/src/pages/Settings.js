import Sidebar from "../components/Sidebar";
import SOSButton from "../components/SOSButton";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMoon,
  FaSun,
  FaGlobe,
  FaBell,
  FaEnvelope,
  FaMobileAlt,
  FaShieldAlt,
  FaTrashAlt,
} from "react-icons/fa";

import "./Settings.css";
import { useUser, getPhotoUrl } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

function Settings() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { darkMode, setDarkMode } = useTheme();
  const { language, setLanguage, t, LANGUAGES } = useLanguage();

  const [notifications, setNotifications] = useState(
    user?.notifications ?? true
  );
  const [emailAlerts, setEmailAlerts] = useState(user?.emailAlerts ?? true);
  const [smsAlerts, setSmsAlerts] = useState(user?.smsAlerts ?? false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const userNotifications =
    JSON.parse(localStorage.getItem("notifications")) || [];

  const saveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const res = await axios.put(
        "${process.env.REACT_APP_API_URL}/api/buspass/settings",
        {
          darkMode,
          notifications,
          language,
          emailAlerts,
          smsAlerts,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.log(error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        {/* ---- Navbar ---- */}
        <div className="topbar">
          <h2>{t("settingsTitle")}</h2>
          <div className="user-box">
            <div
              className="notification-icon"
              onClick={() => navigate("/notifications")}
            >
              🔔
              <span className="notification-badge">
                {userNotifications.length}
              </span>
            </div>
            <div
              className="profile-box"
              onClick={() => navigate("/profile")}
              style={{ cursor: "pointer" }}
            >
              <div className="profile-circle nav-avatar">
                {user?.photo ? (
                  <img src={getPhotoUrl(user.photo)} alt="" />
                ) : (
                  user?.name?.charAt(0) || "U"
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="settings-page">
          {/* ---- Appearance ---- */}
          <div className="settings-card">
            <div className="settings-card-header">
              {darkMode ? <FaMoon /> : <FaSun />}
              <h3>Appearance</h3>
            </div>

            <div className="setting-item">
              <div className="setting-item-text">
                <span className="setting-label">{t("darkMode")}</span>
                <span className="setting-desc">
                  Switch to a purple dark theme across the whole app
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
                  {t("language")}
                </span>
                <span className="setting-desc">
                  Choose your preferred language for the app
                </span>
              </div>

              <select
                className="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {LANGUAGES.map((l) => (
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
              <h3>{t("notificationPrefs")}</h3>
            </div>

            <div className="setting-item">
              <div className="setting-item-text">
                <span className="setting-label">
                  <FaBell size={13} style={{ marginRight: 6 }} />
                  Push Notifications
                </span>
                <span className="setting-desc">
                  Get alerts for pass approval, expiry, and more
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
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
                  Receive payment receipts and updates via email
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

            <div className="setting-item">
              <div className="setting-item-text">
                <span className="setting-label">
                  <FaMobileAlt size={13} style={{ marginRight: 6 }} />
                  SMS Alerts
                </span>
                <span className="setting-desc">
                  Get critical alerts via SMS (data charges may apply)
                </span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={() => setSmsAlerts(!smsAlerts)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          {/* ---- Security ---- */}
          <div className="settings-card">
            <div className="settings-card-header">
              <FaShieldAlt />
              <h3>Security</h3>
            </div>

            <div className="setting-item">
              <div className="setting-item-text">
                <span className="setting-label">Change Password</span>
                <span className="setting-desc">
                  Update your account password
                </span>
              </div>
              <button
                className="link-btn"
                onClick={() => navigate("/profile")}
              >
                Manage
              </button>
            </div>
          </div>

          {/* ---- Danger zone ---- */}
          <div className="settings-card danger-card">
            <div className="settings-card-header danger">
              <FaTrashAlt />
              <h3>Danger Zone</h3>
            </div>

            <div className="setting-item">
              <div className="setting-item-text">
                <span className="setting-label">Delete Account</span>
                <span className="setting-desc">
                  Permanently delete your account and all associated data
                </span>
              </div>
              <button
                className="danger-btn"
                onClick={() =>
                  alert("Please contact support to delete your account.")
                }
              >
                Delete
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
              {saving ? t("savingSettings") : t("saveSettings")}
            </button>
            {saved && <span className="saved-tag">✓ Saved</span>}
          </div>
        </div>

        <SOSButton />
      </div>
    </div>
  );
}

export default Settings;