import axios from "axios";
import { useState } from "react";
import "./Dashboard.css";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaBus,
  FaIdCard,
  FaShieldAlt,
  FaMoneyBill,
  FaBell,
  FaCog,
  FaUser,
  FaCamera,
  FaEdit,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useUser, getPhotoUrl } from "../context/UserContext";

function Profile() {
  const navigate = useNavigate();

  // ✅ shared across the whole app — updating this updates the navbar everywhere
  const { user, setUser, refreshUser } = useUser();

  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(user || {});
  const [showPasswordBox, setShowPasswordBox] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const notifications =
    JSON.parse(localStorage.getItem("notifications")) || [];

  const startEditing = () => {
    setProfile(user || {});
    setEditing(true);
  };

  const cancelEditing = () => {
    setProfile(user || {});
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/me`,
        {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          gender: profile.gender,
          dob: profile.dob,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ✅ this single line updates the name/photo everywhere in the app
      setUser(res.data.user);
      setProfile(res.data.user);
      setEditing(false);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Profile Update Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(res.data.message);
      setShowPasswordBox(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Password change failed");
    }
  };

 const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/logout`,
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
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    try {
      setUploading(true);
      const token = localStorage.getItem("token");

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/upload-photo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await refreshUser();
    } catch (error) {
      // ✅ show the REAL backend error instead of a generic message
      console.log("Photo upload error:", error.response?.data || error.message);
      alert(
        error.response?.data?.message ||
        "Photo Upload Failed — " + (error.message || "Unknown error")
      );
    } finally {
      setUploading(false);
      e.target.value = ""; // allow re-selecting the same file
    }
  };

  const handleDeletePhoto = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
       `${process.env.REACT_APP_API_URL}/api/users/delete-photo`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await refreshUser();
    } catch (error) {
      console.log("Delete photo error:", error.response?.data || error.message);
      alert(
        error.response?.data?.message ||
        "Photo Delete Failed — " + (error.message || "Unknown error")
      );
    }
  };

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="sidebar">
          <div className="logo">🚌 eBusPass</div>
        </div>
        <div className="main-content">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">🚌 eBusPass</div>

        <ul>
          <li onClick={() => navigate("/dashboard")}>
            <FaHome /> Dashboard
          </li>
          <li onClick={() => navigate("/apply-pass")}>
            <FaIdCard /> Apply For Pass
          </li>
          <li onClick={() => navigate("/my-passes")}>
            <FaBus /> My Passes
          </li>
          <li onClick={() => navigate("/women-safety")} style={{ cursor: "pointer" }}>
            <FaShieldAlt /> Women Safety
          </li>
          <li onClick={() => navigate("/payment-history")} style={{ cursor: "pointer" }}>
            <FaMoneyBill /> Payment History
          </li>
          <li onClick={() => navigate("/notifications")} style={{ cursor: "pointer" }}>
            <FaBell /> Notifications
          </li>
          <li onClick={() => navigate("/settings")} style={{ cursor: "pointer" }}>
            <FaCog /> Settings
          </li>
          <li className="active">
            <FaUser /> Profile
          </li>
          <li className="logout-item" onClick={handleLogout}>
            ← Logout
          </li>
        </ul>
      </div>

      {/* Main */}
      <div className="main-content">
        <div className="topbar">
          <h2>My Profile</h2>

          <div className="user-box">
            <div
              className="notification-icon"
              onClick={() => navigate("/notifications")}
            >
              🔔
              <span className="notification-badge">
                {notifications.length}
              </span>
            </div>

            <div className="profile-circle nav-avatar">
              {user.photo ? (
                <img src={getPhotoUrl(user.photo)} alt="" />
              ) : (
                user?.name?.charAt(0) || "U"
              )}
            </div>
          </div>
        </div>

        {/* ---- Hero profile header ---- */}
        <div className="profile-hero">
          <div className="profile-hero-avatar">
            {user.photo ? (
              <img src={getPhotoUrl(user.photo)} alt="Profile" />
            ) : (
              <span>{user?.name?.charAt(0) || "U"}</span>
            )}

            <label className="avatar-camera-btn" htmlFor="photoInput">
              <FaCamera size={13} />
            </label>
            <input
              type="file"
              id="photoInput"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoUpload}
            />
          </div>

          <div className="profile-hero-info">
            <h2>{user.name || "User"}</h2>
            <p className="profile-role-tag">Bus Pass User</p>
            <p className="profile-email-tag">{user.email}</p>
          </div>

          <div className="profile-hero-actions">
            <button
              className="upload-btn small"
              onClick={() => document.getElementById("photoInput").click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "📤 Upload Photo"}
            </button>
            {user.photo && (
              <button className="delete-btn small" onClick={handleDeletePhoto}>
                🗑️ Remove
              </button>
            )}
          </div>
        </div>

        <div className="profile-details">
          {/* ---- Personal information ---- */}
          <div className="detail-card">
            <div className="card-header-row">
              <h3>Personal Information</h3>
              <button className="edit-pill-btn" onClick={startEditing}>
                <FaEdit size={12} /> Edit
              </button>
            </div>

            <div className="info-grid">
              <div className="info-field">
                <span>Full Name</span>
                <strong>{user.name || "—"}</strong>
              </div>

              <div className="info-field">
                <span>Email Address</span>
                <strong>{user.email || "—"}</strong>
              </div>

              <div className="info-field">
                <span>Phone Number</span>
                <strong>{user.phone || "Not Added"}</strong>
              </div>

              <div className="info-field">
                <span>Gender</span>
                <strong>{user.gender || "Not Added"}</strong>
              </div>

              <div className="info-field">
                <span>Date of Birth</span>
                <strong>
                  {user.dob
                    ? new Date(user.dob).toLocaleDateString()
                    : "Not Added"}
                </strong>
              </div>

              <div className="info-field">
                <span>Account Created</span>
                <strong>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "—"}
                </strong>
              </div>
            </div>

            <div className="profile-buttons">
              <button
                className="password-btn"
                onClick={() => setShowPasswordBox(!showPasswordBox)}
              >
                Change Password
              </button>
            </div>

            {showPasswordBox && (
              <div className="password-card">
                <h3>Change Password</h3>

                <div className="password-input-wrapper">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    placeholder="Current Password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                  <span
                    className="password-eye-icon"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                  >
                    {showCurrentPass ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                <div className="password-input-wrapper">
                  <input
                    type={showNewPass ? "text" : "password"}
                    placeholder="New Password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                  />
                  <span
                    className="password-eye-icon"
                    onClick={() => setShowNewPass(!showNewPass)}
                  >
                    {showNewPass ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                  <span
                    className="password-eye-icon"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                  >
                    {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                <div className="password-card-buttons">
                  <button
                    className="cancel-password-btn"
                    onClick={() => {
                      setShowPasswordBox(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button className="save-btn" onClick={handleChangePassword}>
                    Save Password
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ---- Account summary ---- */}
          <div className="summary-card">
            <h3>Account Summary</h3>

            <div className="summary-grid">
              <div className="summary-box">
                <h2>{notifications.length}</h2>
                <p>Notifications</p>
              </div>

              <div className="summary-box status">
                <h2>Active</h2>
                <p>Account Status</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Edit modal ---- */}
      {editing && (
        <div className="sos-overlay" onClick={cancelEditing}>
          <div
            className="edit-profile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Edit Personal Information</h3>

            <div className="edit-form-grid">
              <div className="edit-field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profile.name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
              </div>

              <div className="edit-field">
                <label>Email</label>
                <input
                  type="email"
                  value={profile.email || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                />
              </div>

              <div className="edit-field">
                <label>Phone</label>
                <input
                  type="text"
                  value={profile.phone || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                />
              </div>

              <div className="edit-field">
                <label>Gender</label>
                <select
                  value={profile.gender || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, gender: e.target.value })
                  }
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="edit-field">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={
                    profile.dob
                      ? new Date(profile.dob).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setProfile({ ...profile, dob: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="edit-modal-buttons">
              <button className="edit-btn" onClick={cancelEditing}>
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;