import Sidebar from "../components/Sidebar";
import SOSButton from "../components/SOSButton";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import {
  FaChevronDown,
  FaCheckCircle,
  FaBus,
  FaMapMarkerAlt
} from "react-icons/fa";
import "./Dashboard.css";
import { useUser, getPhotoUrl } from "../context/UserContext";
function Dashboard() {
  const navigate = useNavigate();
  const passRef = useRef();
  const { user } = useUser(); // 👈 replaces local user state
  const [passData, setPassData] = useState([]); // ✅ always an array now
  const [selectedPassId, setSelectedPassId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const notifications =
    JSON.parse(localStorage.getItem("notifications")) || [];

  // ---- derived values (multi-pass safe) ----
  const activePasses = passData.filter((p) => p.status === "Active");
  const pendingPasses = passData.filter((p) => p.status === "Pending");
  const hasPass = activePasses.length > 0; // ✅ fixed: was undefined before

  const selectedPass =
    activePasses.find((p) => p._id === selectedPassId) ||
    activePasses[0] ||
    null;

  const daysRemaining = selectedPass?.expiryDate
    ? Math.ceil(
      (new Date(selectedPass.expiryDate) - new Date()) /
      (1000 * 60 * 60 * 24)
    )
    : 0;

  // ---- fetch passes (user now comes from shared UserContext) ----
  useEffect(() => {
    fetchMyPasses();
  }, []);

  // ---- fetch all passes ----
  const fetchMyPasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/buspass/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const passes = res.data.data || [];
      setPassData(passes);

      if (passes.length > 0) {
        const firstActive = passes.find((p) => p.status === "Active");
        setSelectedPassId((firstActive || passes[0])._id);
      }

      // check expiry for every active pass, not just one
      const today = new Date();
      const expiringNotifs = [];

      passes.forEach((pass) => {
        if (pass.status !== "Active") return;
        const expiry = new Date(pass.expiryDate);
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        if (diffDays <= 7 && diffDays > 0) {
          expiringNotifs.push({
            message: `⚠ Pass ${pass.passNumber} will expire in ${diffDays} day(s).`,
          });
        }
        if (diffDays <= 0) {
          expiringNotifs.push({
            message: `❌ Pass ${pass.passNumber} has expired.`,
          });
        }
      });

      if (expiringNotifs.length > 0) {
        localStorage.setItem("notifications", JSON.stringify(expiringNotifs));
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ---- expiry alert popup for currently selected pass ----
  useEffect(() => {
    if (!selectedPass) return;

    if (selectedPass.status === "Expired") {
      alert("❌ Your Bus Pass has expired.");
    } else if (
      selectedPass.status === "Active" &&
      daysRemaining <= 7 &&
      daysRemaining >= 0
    ) {
      alert(`⚠️ Your Bus Pass will expire in ${daysRemaining} day(s).`);
    }
  }, [selectedPass, daysRemaining]);

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <h2>Dashboard</h2>
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

        {/* Welcome */}
        <div className="welcome-card">
          <div>
            <p>Welcome back,</p>
            <h1>{user?.name || "User"} 👋</h1>
            <p>
              {hasPass
                ? "Your pass is active and ready to use."
                : "Apply for your first bus pass to get started."}
            </p>
          </div>
          <div className="action-buttons">
            <button className="apply-btn" onClick={() => navigate("/apply-pass")}>
              Apply New Pass
            </button>
          </div>
        </div>

        {/* Pass selector — multi pass dropdown */}
        {hasPass && (
          <div className="active-pass-card">
            <div className="active-pass-header">
              <h3>My Active Passes ({activePasses.length})</h3>

              <div className="pass-dropdown-wrapper">
                <button
                  className="pass-dropdown-toggle"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                >
                  {selectedPass?.passNumber || "Select Pass"}{" "}
                  <FaChevronDown
                    size={12}
                    style={{
                      transform: dropdownOpen ? "rotate(180deg)" : "none",
                      transition: "0.2s",
                    }}
                  />
                </button>

                {dropdownOpen && (
                  <div className="pass-dropdown-menu">
                    {activePasses.map((pass) => (
                      <div
                        key={pass._id}
                        className={`pass-dropdown-item ${pass._id === selectedPass?._id ? "selected" : ""
                          }`}
                        onClick={() => {
                          setSelectedPassId(pass._id);
                          setDropdownOpen(false);
                        }}
                      >
                        <div className="pass-dropdown-item-main">
                          <span className="pass-dropdown-route">
                            {pass.source} → {pass.destination}
                          </span>
                          <span className="pass-dropdown-number">
                            {pass.passNumber}
                          </span>
                        </div>
                        {pass._id === selectedPass?._id && (
                          <FaCheckCircle className="pass-dropdown-check" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedPass && (
              <div className="pass-details">
                <p>
                  <strong>Route:</strong> {selectedPass.source} →{" "}
                  {selectedPass.destination}
                </p>
                <p>
                  <strong>Pass No:</strong> {selectedPass.passNumber}
                </p>
                <p>
                  <strong>Type:</strong> {selectedPass.passType}
                </p>
                <p>
                  <strong>Expiry:</strong>{" "}
                  {new Date(selectedPass.expiryDate).toLocaleDateString()}
                </p>
              </div>
            )}

            <button
              className="view-pass-btn"
              onClick={() => navigate("/my-passes")}
            >
              View All Passes
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="stats-container">
          <div className="stat-card">
            <h3>{activePasses.length}</h3>
            <p>Active Pass{activePasses.length !== 1 ? "es" : ""}</p>
          </div>
          <div className="stat-card">
            <h3>{hasPass ? daysRemaining : 0}</h3>
            <p>Days Remaining</p>
          </div>
          <div className="stat-card">
            <h3>0</h3>
            <p>Total Trips</p>
          </div>
          <div className="stat-card">
            <h3>{pendingPasses.length}</h3>
            <p>Pending Applications</p>
          </div>
        </div>

        {selectedPass && selectedPass.status === "Active" ? (
          <div className="dashboard-bottom">
            <div className="pass-card" ref={passRef}>
              <div
                className={`status-badge ${(selectedPass?.status || "pending").toLowerCase()}`}
              >
                {selectedPass?.status || "Pending"}
              </div>

              <div className="pass-header">
                <div>
                  <h2>{user?.name || "User"}</h2>
                  <span className="pass-number">
                    ID: {selectedPass.passNumber}
                  </span>
                </div>
                <div className="bus-icon">
                  <FaBus />
                </div>
              </div>

              <div className="route">
                <FaMapMarkerAlt />
                {selectedPass.source}
                <span>→</span>
                {selectedPass.destination}
              </div>

              <div className="pass-card-body">
                <div className="pass-info">
                  <p><strong>Type:</strong> {selectedPass.passType}</p>
                  <p><strong>Category:</strong> {selectedPass.category}</p>
                  <p>
                    <strong>Applied:</strong>{" "}
                    {selectedPass.appliedDate
                      ? new Date(selectedPass.appliedDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Expiry:</strong>{" "}
                    {new Date(selectedPass.expiryDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="qr-section">
                  <div className="qr-container">
                    <QRCodeCanvas
                      size={100}
                      value={`https://onlinebuspass.vercel.app/verify-pass/${selectedPass._id}`}
                    />
                  </div>
                  <p>Scan to Verify</p>
                </div>
              </div>
            </div>

            <div className="activity-card">
              <h3>Recent Activity</h3>
              <ul>
                <li>✅ Pass approved & activated</li>
                <li>⚠ Pass expiring in 10 days</li>
                <li>💳 Payment confirmed</li>
                <li>📄 New application submitted</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="no-pass-card">
            <div className="no-pass-icon">🚌</div>
            <h2>No Active Pass Found</h2>
            <p>
              You haven't applied for any bus pass yet. Create your first
              digital bus pass and enjoy hassle-free travel.
            </p>
            <button
              className="apply-first-pass-btn"
              onClick={() => navigate("/apply-pass")}
            >
              + Apply For Your First Pass
            </button>
          </div>
        )}

        <SOSButton />
      </div>
    </div>
  );
}
export default Dashboard;