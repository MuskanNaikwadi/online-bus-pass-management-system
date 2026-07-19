import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AdminSidebar from "../components/AdminSidebar";
import "./AdminApplications.css";
import {
  FaSearch,
  FaFileAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
} from "react-icons/fa";

import "./Admin.css";

function AdminApplications() {
  const navigate = useNavigate();
  const [passData, setPassData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [documentVerified, setDocumentVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPendingPasses();
  }, []);

  const fetchPendingPasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/buspass/pending`,
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

  const openApplication = (pass) => {
    setSelectedApplication(pass);
    setShowModal(true);
    setDocumentVerified(pass.documentVerified || false);
  };

  const closeApplication = () => {
    setShowModal(false);
    setSelectedApplication(null);
  };

  const verifyDocument = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/buspass/${id}/verify-document`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPassData((prev) => prev.filter((item) => item._id !== id));

      await Swal.fire({
        icon: "success",
        title: "Approved!",
        text: "Bus Pass Approved Successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log("Status:", error.response?.status);
      console.log("Data:", error.response?.data);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Approval Failed.",
      });
    }
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
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPassData((prev) => prev.filter((item) => item._id !== id));

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

  const filteredPasses = useMemo(() => {
    const keyword = search.toLowerCase();
    return passData.filter(
      (pass) =>
        !keyword ||
        pass.fullName?.toLowerCase().includes(keyword) ||
        pass.passType?.toLowerCase().includes(keyword) ||
        pass.source?.toLowerCase().includes(keyword) ||
        pass.destination?.toLowerCase().includes(keyword)
    );
  }, [passData, search]);

  return (
    <div className="applications-page">
      <AdminSidebar />

      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div className="page-header">
            <h2>All Applications</h2>
            <p>Review and manage pending bus pass applications</p>
          </div>

          <div className="topbar-right">
            <div className="admin-search-box">
              <FaSearch size={13} />
              <input
                type="text"
                placeholder="Search by name, route, or type..."
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

        {/* ---- Applications list (card style, same interaction as dashboard) ---- */}
        <div className="applications-panel">
          <div className="applications-panel-header">
            <h3>Pending Applications</h3>
            <span className="applications-count">
              {filteredPasses.length} of {passData.length}
            </span>
          </div>

          {loading ? (
            <div className="admin-loading">
              <div className="admin-spinner"></div>
              <p>Loading applications...</p>
            </div>
          ) : filteredPasses.length === 0 ? (
            <div className="empty-card">
              <FaFileAlt size={30} />
              <h3>No Applications Found</h3>
              <p>
                {passData.length === 0
                  ? "There are no pending applications right now."
                  : "Try adjusting your search."}
              </p>
            </div>
          ) : (
            <div className="applications-list">
              {filteredPasses.map((pass) => (
                <div
                  className="application-card"
                  key={pass._id}
                  onClick={() => openApplication(pass)}
                >
                  <div className="application-left">
                    <div className="application-avatar">
                      {pass.fullName?.charAt(0)}
                    </div>
                    <div>
                      <h3>{pass.fullName}</h3>
                      <p>{pass.passType}</p>
                      <span>
                        <FaMapMarkerAlt size={11} /> {pass.source} →{" "}
                        {pass.destination}
                      </span>
                    </div>
                  </div>

                  <div className="application-right">
                    <span className="pending-badge">Pending</span>
                    <span className="open-text">
                      Review <FaArrowRight size={11} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---- Review modal — same logic as AdminDashboard ---- */}
      {showModal && selectedApplication && (
        <div className="modal-overlay" onClick={closeApplication}>
          <div
            className="application-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Bus Pass Application</h2>
              <button className="close-btn" onClick={closeApplication}>
                ✖
              </button>
            </div>

            <div className="modal-body">
              <div className="applicant-header">
                <div className="applicant-avatar">
                  {selectedApplication.fullName.charAt(0)}
                </div>
                <div>
                  <h2>{selectedApplication.fullName}</h2>
                  <p>{selectedApplication.email}</p>
                  <span>{selectedApplication.mobile}</span>
                </div>
              </div>

              <div className="details-section">
                <h3>Pass Details</h3>

                <div className="detail-row">
                  <strong>Category</strong>
                  <span>{selectedApplication.category}</span>
                </div>

                <div className="detail-row">
                  <strong>Pass Type</strong>
                  <span>{selectedApplication.passType}</span>
                </div>

                <div className="detail-row">
                  <strong>Route</strong>
                  <span>
                    {selectedApplication.source} →{" "}
                    {selectedApplication.destination}
                  </span>
                </div>

                <div className="detail-row">
                  <strong>Amount</strong>
                  <span>₹ {selectedApplication.amount}</span>
                </div>

                <div className="detail-row">
                  <strong>Status</strong>
                  <span className="status pending">
                    {selectedApplication.status}
                  </span>
                </div>
              </div>

              <div className="document-section">
                <h3>Uploaded Document</h3>
                <button
                  className="view-btn"
                  onClick={() =>
                    window.open(
                      `${process.env.REACT_APP_API_URL}/${selectedApplication.document}`,
                      "_blank"
                    )
                  }
                >
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
                    if (checked) {
                      await verifyDocument(selectedApplication._id);
                    }
                  }}
                />
                <label htmlFor="verifyDoc">
                  I have verified the uploaded document.
                </label>
              </div>

              <div className="modal-actions">
                <button
                  className="approve-btn"
                  onClick={() => {
                    if (!documentVerified) {
                      Swal.fire({
                        toast: true,
                        position: "top",
                        icon: "warning",
                        title: "Please verify the document first.",
                        showConfirmButton: false,
                        timer: 2500,
                        timerProgressBar: true,
                        target: document.querySelector(".application-modal"),
                      });
                      return;
                    }

                    approveApplication(selectedApplication._id);
                  }}
                >
                  <FaCheckCircle size={13} /> Approve
                </button>

                <button
                  className="reject-btn"
                  onClick={() => rejectApplication(selectedApplication._id)}
                >
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

export default AdminApplications;