import axios from "axios";
import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import {
  FaCamera,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";

import "./AdminProfile.css";
import { useUser, getPhotoUrl } from "../context/UserContext";

function AdminProfile() {

  // ✅ same UserContext as regular users — but since it's scoped by JWT token,
  // an admin only ever sees/edits their OWN document. No cross-user effect possible.
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

      setUser(res.data.user);
      setProfile(res.data.user);
      setEditing(false);

      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Passwords do not match",
      });
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

      Swal.fire({
        icon: "success",
        title: res.data.message,
        timer: 1500,
        showConfirmButton: false,
      });

      setShowPasswordBox(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Password change failed",
      });
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
      console.log("Photo upload error:", error.response?.data || error.message);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: error.response?.data?.message || "Photo Upload Failed",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
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
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error.response?.data?.message || "Photo Delete Failed",
      });
    }
  };

  if (!user) {
    return (
      <div className="dashboard-container">
        <AdminSidebar />
        <div className="main-content">
          <p>Loading profile...</p>
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
            <h2>Admin Profile</h2>
            <p>Manage your own admin account details</p>
          </div>

          <div className="topbar-right">
            <div className="profile-circle nav-avatar">
              {user.photo ? (
                <img src={getPhotoUrl(user.photo)} alt="" />
              ) : (
                user?.name?.charAt(0) || "A"
              )}
            </div>
          </div>
        </div>

        {/* ---- Scope notice ---- */}
        <div className="scope-notice">
          <FaShieldAlt />
          <span>
            Changes here only affect <strong>your own admin account</strong>.
            No regular user's profile is ever modified.
          </span>
        </div>

        {/* ---- Hero profile header ---- */}
        <div className="profile-hero">
          <div className="profile-hero-avatar">
            {user.photo ? (
              <img src={getPhotoUrl(user.photo)} alt="Profile" />
            ) : (
              <span>{user?.name?.charAt(0) || "A"}</span>
            )}

            <label className="avatar-camera-btn" htmlFor="adminPhotoInput">
              <FaCamera size={13} />
            </label>
            <input
              type="file"
              id="adminPhotoInput"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoUpload}
            />
          </div>

          <div className="profile-hero-info">
            <h2>{user.name || "Admin"}</h2>
            <p className="profile-role-tag admin-role-tag">Administrator</p>
            <p className="profile-email-tag">{user.email}</p>
          </div>

          <div className="profile-hero-actions">
            <button
              className="upload-btn small"
              onClick={() =>
                document.getElementById("adminPhotoInput").click()
              }
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
              <h3>Account Information</h3>
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
                <span>Role</span>
                <strong className="role-badge">Administrator</strong>
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

          {/* ---- Summary ---- */}
          <div className="summary-card">
            <h3>Admin Summary</h3>

            <div className="summary-grid">
              <div className="summary-box">
                <h2>Active</h2>
                <p>Account Status</p>
              </div>

              <div className="summary-box status">
                <h2>Admin</h2>
                <p>Access Level</p>
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
            <h3>Edit Account Information</h3>

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

export default AdminProfile;