import AdminSidebar from "../components/AdminSidebar";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminRejectedPasses.css";
import {
  FaSearch,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaMoneyBillWave,
} from "react-icons/fa";

function AdminRejectedPasses() {
  const navigate = useNavigate();

  const [passData, setPassData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchRejectedPasses();
  }, []);

  const fetchRejectedPasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/buspass/rejected",
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
  const refundedCount = passData.filter(
    (p) => p.paymentStatus === "Refunded"
  ).length;

  const totalRefundAmount = passData
    .filter((p) => p.paymentStatus === "Refunded")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const filteredPasses = useMemo(() => {
    const keyword = search.toLowerCase();
    return passData.filter(
      (pass) =>
        !keyword ||
        pass.fullName?.toLowerCase().includes(keyword) ||
        pass.passNumber?.toLowerCase().includes(keyword) ||
        pass.source?.toLowerCase().includes(keyword) ||
        pass.destination?.toLowerCase().includes(keyword)
    );
  }, [passData, search]);

  const getRefundClass = (status) => {
    if (status === "Refunded") return "refunded";
    if (status === "Pending") return "pending";
    return "none";
  };

  return (
    <div className="dashboard-container">
      <AdminSidebar />

      <div className="main-content">
        {/* ---- Topbar ---- */}
        <div className="topbar">
          <div className="page-header">
            <h2>Rejected Passes</h2>
            <p>Applications rejected by admin, with refund status</p>
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
              <span className="notification-badge">{passData.length}</span>
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
        <div className="rejected-stats">
          <div className="rejected-stat-card">
            <div className="stat-icon total">
              <FaTimesCircle />
            </div>
            <div>
              <h3>{passData.length}</h3>
              <p>Total Rejected</p>
            </div>
          </div>

          <div className="rejected-stat-card">
            <div className="stat-icon refunded">
              <FaMoneyBillWave />
            </div>
            <div>
              <h3>{refundedCount}</h3>
              <p>Refunds Processed</p>
            </div>
          </div>

          <div className="rejected-stat-card">
            <div className="stat-icon amount">₹</div>
            <div>
              <h3>₹{totalRefundAmount.toLocaleString("en-IN")}</h3>
              <p>Total Refunded Amount</p>
            </div>
          </div>
        </div>

        {/* ---- Table panel ---- */}
        <div className="rejected-panel">
          <div className="rejected-panel-header">
            <h3>All Rejected Applications</h3>
            <span className="rejected-count">
              {filteredPasses.length} of {passData.length}
            </span>
          </div>

          {loading ? (
            <div className="admin-loading">
              <div className="admin-spinner"></div>
              <p>Loading rejected passes...</p>
            </div>
          ) : filteredPasses.length === 0 ? (
            <div className="empty-card">
              <FaTimesCircle size={30} />
              <h3>No Rejected Passes</h3>
              <p>
                {passData.length === 0
                  ? "No applications have been rejected yet."
                  : "Try adjusting your search."}
              </p>
            </div>
          ) : (
            <div className="rejected-table-wrapper">
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Pass No</th>
                    <th>Route</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Rejected On</th>
                    <th>Refund Status</th>
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

                      <td className="amount-cell">₹{pass.amount}</td>

                      <td>
                        {new Date(pass.updatedAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </td>

                      <td>
                        <span
                          className={`refund-pill ${getRefundClass(
                            pass.paymentStatus
                          )}`}
                        >
                          {pass.paymentStatus === "Refunded"
                            ? "✓ Refunded"
                            : pass.paymentStatus === "Pending"
                            ? "No Payment Made"
                            : pass.paymentStatus || "—"}
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

export default AdminRejectedPasses;