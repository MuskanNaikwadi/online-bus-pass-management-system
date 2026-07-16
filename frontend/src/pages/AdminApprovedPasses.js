import AdminSidebar from "../components/AdminSidebar";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminApprovedPasses.css";
import {
  FaSearch,
  FaBus,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaCalendarAlt,
} from "react-icons/fa";

function AdminApprovedPasses() {
  const navigate = useNavigate();

  const [passData, setPassData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchApprovedPasses();
  }, []);

  const fetchApprovedPasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/buspass/approved",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPassData(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ---- derived stats ----
  const expiringSoonCount = useMemo(() => {
    const today = new Date();
    return passData.filter((p) => {
      const diffDays = Math.ceil(
        (new Date(p.expiryDate) - today) / (1000 * 60 * 60 * 24)
      );
      return diffDays <= 7 && diffDays >= 0;
    }).length;
  }, [passData]);

  const filteredPasses = useMemo(() => {
    const keyword = search.toLowerCase();
    return passData.filter(
      (pass) =>
        !keyword ||
        pass.fullName?.toLowerCase().includes(keyword) ||
        pass.passNumber?.toLowerCase().includes(keyword) ||
        pass.source?.toLowerCase().includes(keyword) ||
        pass.destination?.toLowerCase().includes(keyword) ||
        pass.passType?.toLowerCase().includes(keyword)
    );
  }, [passData, search]);

  const isExpiringSoon = (expiryDate) => {
    const diffDays = Math.ceil(
      (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return diffDays <= 7 && diffDays >= 0;
  };

  return (
    <div className="dashboard-container">
      <AdminSidebar />

      <div className="main-content">
        {/* ---- Topbar ---- */}
        <div className="topbar">
          <div className="page-header">
            <h2>Approved Passes</h2>
            <p>All active bus passes currently issued to users</p>
          </div>

          <div className="topbar-right">
            <div className="admin-search-box">
              <FaSearch size={13} />
              <input
                type="text"
                placeholder="Search by name, pass no, or route..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div
              className="notification-icon"
              onClick={() => navigate("/admin-notifications")}
              style={{ cursor: "pointer" }}
            >
              🔔
              <span className="notification-badge">
                {expiringSoonCount}
              </span>
            </div>

            <div
              className="profile-circle"
              onClick={() => navigate("/admin-profile")}
              style={{ cursor: "pointer" }}
            >
              A
            </div>
          </div>
        </div>

        {/* ---- Stats ---- */}
        <div className="approved-stats">
          <div className="approved-stat-card">
            <div className="stat-icon total">
              <FaBus />
            </div>
            <div>
              <h3>{passData.length}</h3>
              <p>Total Approved Passes</p>
            </div>
          </div>

          <div className="approved-stat-card">
            <div className="stat-icon expiring">
              <FaCalendarAlt />
            </div>
            <div>
              <h3>{expiringSoonCount}</h3>
              <p>Expiring in 7 Days</p>
            </div>
          </div>
        </div>

        {/* ---- Table panel ---- */}
        <div className="approved-panel">
          <div className="approved-panel-header">
            <h3>All Passes</h3>
            <span className="approved-count">
              {filteredPasses.length} of {passData.length}
            </span>
          </div>

          {loading ? (
            <div className="admin-loading">
              <div className="admin-spinner"></div>
              <p>Loading approved passes...</p>
            </div>
          ) : filteredPasses.length === 0 ? (
            <div className="empty-card">
              <FaCheckCircle size={30} />
              <h3>No Approved Passes</h3>
              <p>
                {passData.length === 0
                  ? "No passes have been approved yet."
                  : "Try adjusting your search."}
              </p>
            </div>
          ) : (
            <div className="approved-table-wrapper">
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Pass No</th>
                    <th>Route</th>
                    <th>Type</th>
                    <th>Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPasses.map((pass) => (
                    <tr key={pass._id}>
                      <td>
                        <div className="applicant-cell">
                          <div className="applicant-avatar-sm">
                            {pass.fullName?.charAt(0)}
                          </div>
                          <span>{pass.fullName}</span>
                        </div>
                      </td>

                      <td>
                        <span className="pass-number-cell">
                          {pass.passNumber}
                        </span>
                      </td>

                      <td>
                        <span className="route-cell">
                          <FaMapMarkerAlt size={11} />
                          {pass.source} → {pass.destination}
                        </span>
                      </td>

                      <td>{pass.passType}</td>

                      <td>
                        <span
                          className={`expiry-cell ${
                            isExpiringSoon(pass.expiryDate) ? "expiring" : ""
                          }`}
                        >
                          {new Date(pass.expiryDate).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                          {isExpiringSoon(pass.expiryDate) && (
                            <span className="expiring-tag">Soon</span>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminApprovedPasses;