import AdminSidebar from "../components/AdminSidebar";
import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./AdminDashboard.css";
import {
  FaBus,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaArrowRight,
  FaMapMarkerAlt,
  FaFileAlt,
  FaSearch,
} from "react-icons/fa";

function AdminDashboard() {
  const navigate = useNavigate();
  const [passData, setPassData] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [documentVerified, setDocumentVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/admin/dashboard`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Dashboard Stats:", res.data.data);
      } catch (error) {
        console.log("Dashboard Stats Error:", error);
      }
    };

    const fetchApplications = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/buspass`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPassData(res.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchEmergencies = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/emergency`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmergencies(res.data.data);
      } catch (error) {
        console.log("Emergency Error:", error);
      }
    };

    fetchDashboardStats();
    fetchApplications();
    fetchEmergencies();
  }, []);

  const totalApplications = passData.length;
  const pendingCount = passData.filter((p) => p.status === "Pending").length;
  const approvedCount = passData.filter((p) => p.status === "Active").length;
  const rejectedCount = passData.filter((p) => p.status === "Rejected").length;

  const pendingEmergencies = useMemo(
    () => emergencies.filter((e) => e.status === "Pending"),
    [emergencies]
  );
  const resolvedEmergencies = useMemo(
    () => emergencies.filter((e) => e.status === "Resolved"),
    [emergencies]
  );

  const filteredApplications = passData.filter((pass) => {
    if (pass.status !== "Pending") return false;
    const keyword = search.toLowerCase();
    return (
      pass.fullName?.toLowerCase().includes(keyword) ||
      pass.email?.toLowerCase().includes(keyword) ||
      pass.passType?.toLowerCase().includes(keyword) ||
      pass.category?.toLowerCase().includes(keyword)
    );
  });

  const resolveEmergency = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/emergency/${id}/resolve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmergencies((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: "Resolved" } : item
        )
      );
    } catch (error) {
      console.log("Resolve Error:", error);
    }
  };

  const verifyDocument = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/buspass/${id}/verify-document`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPassData((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, documentVerified: true } : item
        )
      );
      Swal.fire({
        icon: "success",
        title: "Verified",
        text: "Document verified successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message);
    }
  };

  const approveApplication = async (id) => {
    closeApplication();
    const result = await Swal.fire({
      title: "Approve Application?",
      text: "Are you sure you want to approve this application?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#16a34a",
    });
    if (!result.isConfirmed) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/buspass/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPassData((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: "Active" } : item
        )
      );
      await Swal.fire({
        icon: "success",
        title: "Approved!",
        text: "Bus Pass Approved Successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Approval Failed.",
      });
    }
  };

  const openApplication = (pass) => {
    setSelectedApplication(pass);
    setShowModal(true);
    setDocumentVerified(pass.documentVerified || false);
  };

  const closeApplication = () => {
    setShowModal(false);
    setSelectedApplication(null);
  };

  const rejectApplication = async (id) => {
    closeApplication();
    const result = await Swal.fire({
      title: "Reject Application?",
      text: "Are you sure you want to reject this application?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Reject",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/buspass/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPassData((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: "Rejected" } : item
        )
      );
      await Swal.fire({
        icon: "success",
        title: "Rejected!",
        text: "Application Rejected Successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Reject Failed.",
      });
    }
  };

  return (
    <div className="dashboard-container">
      <AdminSidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="page-header">
            <h2>Admin Dashboard</h2>
            <p>Welcome back, <strong>Admin</strong> 👋</p>
          </div>
          <div className="topbar-right">
            <div className="admin-search-box">
              <FaSearch size={13} />
              <input
                type="text"
                placeholder="Search by name, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="notification-icon" onClick={() => navigate("/admin-notifications")}>
              🔔
              <span className="notification-badge">{pendingEmergencies.length}</span>
            </div>
            <div className="profile-circle" onClick={() => navigate("/admin-profile")}>A</div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="admin-card blue">
            <div className="card-icon"><FaBus /></div>
            <div><h2>{totalApplications}</h2><p>Total Applications</p></div>
          </div>
          <div className="admin-card orange">
            <div className="card-icon"><FaExclamationTriangle /></div>
            <div><h2>{pendingCount}</h2><p>Pending Applications</p></div>
          </div>
          <div className="admin-card green">
            <div className="card-icon"><FaCheckCircle /></div>
            <div><h2>{approvedCount}</h2><p>Approved Passes</p></div>
          </div>
          <div className="admin-card red">
            <div className="card-icon"><FaTimesCircle /></div>
            <div><h2>{rejectedCount}</h2><p>Rejected Passes</p></div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="emergency-card">
            <div className="emergency-header">
              <div>
                <h3>🚨 Live Emergency Alerts</h3>
                <p className="emergency-subtitle">Real-time SOS requests from passengers</p>
              </div>
              <div className="emergency-status">
                <span className="live-dot"></span>LIVE
              </div>
            </div>
            <div className="emergency-summary">
              <div className="summary-box red">
                <h3>{pendingEmergencies.length}</h3><span>Pending Alerts</span>
              </div>
              <div className="summary-box green">
                <h3>{resolvedEmergencies.length}</h3><span>Resolved</span>
              </div>
            </div>
            <div className="emergency-list">
              {pendingEmergencies.length === 0 ? (
                <div className="no-emergency">
                  <FaCheckCircle size={22} /><p>No Active Emergency</p>
                </div>
              ) : (
                pendingEmergencies.map((item) => (
                  <div key={item._id} className="emergency-item">
                    <div className="emergency-user">
                      <div className="avatar">{item.name.charAt(0)}</div>
                      <div>
                        <h4>{item.name}</h4>
                        <p>{item.email}</p>
                        <p>{item.phone}</p>
                        <small>{new Date(item.createdAt).toLocaleString()}</small>
                      </div>
                    </div>
                    <div className="emergency-right">
                      <span className={item.status === "Resolved" ? "status resolved" : "status pending"}>
                        {item.status}
                      </span>
                      <button className="location-btn" onClick={() => window.open(`https://www.google.com/maps?q=${item.latitude},${item.longitude}`, "_blank")}>
                        <FaMapMarkerAlt size={11} /> View Location
                      </button>
                      {item.status !== "Resolved" && (
                        <button className="resolve-btn" onClick={() => resolveEmergency(item._id)}>Resolve</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="applications-card">
            <div className="applications-header">
              <h3>Pending Applications</h3>
              <span className="applications-count">{filteredApplications.length} pending</span>
            </div>
            {loading ? (
              <div className="admin-loading">
                <div className="admin-spinner"></div>
                <p>Loading applications...</p>
              </div>
            ) : filteredApplications.length > 0 ? (
              <div className="applications-list">
                {filteredApplications.map((pass) => (
                  <div className="application-card" key={pass._id} onClick={() => openApplication(pass)}>
                    <div className="application-left">
                      <div className="application-avatar">{pass.fullName?.charAt(0)}</div>
                      <div>
                        <h3>{pass.fullName}</h3>
                        <p>{pass.passType}</p>
                        <span><FaMapMarkerAlt size={11} /> {pass.source} → {pass.destination}</span>
                      </div>
                    </div>
                    <div className="application-right">
                      <span className="pending-badge">Pending</span>
                      <span className="open-text">Review <FaArrowRight size={11} /></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-applications">
                <FaFileAlt size={26} /><p>No matching application found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && selectedApplication && (
        <div className="modal-overlay">
          <div className="application-modal">
            <div className="modal-header">
              <h2>Bus Pass Application</h2>
              <button className="close-btn" onClick={closeApplication}>✖</button>
            </div>
            <div className="modal-body">
              <div className="applicant-header">
                <div className="applicant-avatar">{selectedApplication.fullName.charAt(0)}</div>
                <div>
                  <h2>{selectedApplication.fullName}</h2>
                  <p>{selectedApplication.email}</p>
                  <span>{selectedApplication.mobile}</span>
                </div>
              </div>
              <div className="details-section">
                <h3>Pass Details</h3>
                <div className="detail-row"><strong>Category</strong><span>{selectedApplication.category}</span></div>
                <div className="detail-row"><strong>Pass Type</strong><span>{selectedApplication.passType}</span></div>
                <div className="detail-row"><strong>Route</strong><span>{selectedApplication.source} → {selectedApplication.destination}</span></div>
                <div className="detail-row"><strong>Amount</strong><span>₹ {selectedApplication.amount}</span></div>
                <div className="detail-row"><strong>Status</strong><span className="status pending">{selectedApplication.status}</span></div>
              </div>
              <div className="document-section">
                <h3>Uploaded Document</h3>
                <button className="view-btn" onClick={() => window.open(`${process.env.REACT_APP_API_URL}/${selectedApplication.document}`, "_blank")}>
                  <FaFileAlt size={13} /> View Document
                </button>
              </div>
              <div className="verify-section">
                <input
                  type="checkbox"
                  id="verifyDoc"
                  checked={documentVerified}
                  onChange={async (e) => {
                    const checked = e.target.checked;
                    setDocumentVerified(checked);
                    if (checked) await verifyDocument(selectedApplication._id);
                  }}
                />
                <label htmlFor="verifyDoc">I have verified the uploaded document.</label>
              </div>
              <div className="modal-actions">
                <button className="approve-btn" onClick={() => {
                  if (!documentVerified) {
                    Swal.fire({ toast: true, position: "top", icon: "warning", title: "Please verify the document first.", showConfirmButton: false, timer: 2500, timerProgressBar: true });
                    return;
                  }
                  approveApplication(selectedApplication._id);
                }}>
                  <FaCheckCircle size={13} /> Approve
                </button>
                <button className="reject-btn" onClick={() => rejectApplication(selectedApplication._id)}>
                  <FaTimesCircle size={13} /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;