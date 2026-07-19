import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import "./EmergencyApplications.css";
import Swal from "sweetalert2";
import {
  FaSearch,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";

function EmergencyApplications() {
  const navigate = useNavigate();

  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get("${process.env.REACT_APP_API_URL}/api/emergency", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEmergencies(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const resolveEmergency = async (id) => {
    const result = await Swal.fire({
      title: "Resolve Emergency?",
      text: "Are you sure this emergency has been handled?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Resolve",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/emergency/${id}/resolve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEmergencies((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: "Resolved" } : item
        )
      );

      Swal.fire({
        icon: "success",
        title: "Resolved!",
        text: "Emergency marked as resolved.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Unable to resolve emergency.",
      });
    }
  };

  const openEmergency = (item) => {
    setSelectedEmergency(item);
    setShowModal(true);
  };

  const closeEmergency = () => {
    setSelectedEmergency(null);
    setShowModal(false);
  };

  const openMap = (latitude, longitude) => {
    if (!latitude || !longitude) {
      Swal.fire({
        icon: "error",
        title: "Location Missing",
        text: "User location not available",
      });
      return;
    }

    window.open(
      `https://www.google.com/maps?q=${latitude},${longitude}`,
      "_blank"
    );
  };

  const pendingCount = emergencies.filter(
    (item) => item.status === "Pending"
  ).length;

  const resolvedCount = emergencies.filter(
    (item) => item.status === "Resolved"
  ).length;

  const filtered = useMemo(() => {
    return emergencies.filter((item) => {
      if (filter !== "All" && item.status !== filter) return false;

      const keyword = search.toLowerCase();
      return (
        !keyword ||
        item.name?.toLowerCase().includes(keyword) ||
        item.email?.toLowerCase().includes(keyword) ||
        item.phone?.includes(keyword)
      );
    });
  }, [emergencies, filter, search]);

  return (
    <div className="dashboard-container">
      <AdminSidebar />

      <div className="main-content">
        {/* ---- Topbar ---- */}
        <div className="topbar">
          <div className="page-header">
            <h2>Emergency Applications</h2>
            <p>Monitor all passenger emergency requests</p>
          </div>

          <div className="topbar-right">
            <div className="admin-search-box">
              <FaSearch size={13} />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
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
              <span className="notification-badge">{pendingCount}</span>
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

        {/* ---- Filter chips ---- */}
        <div className="filter-buttons">
          <button
            className={filter === "All" ? "active-filter" : ""}
            onClick={() => setFilter("All")}
          >
            All
          </button>
          <button
            className={filter === "Pending" ? "active-filter" : ""}
            onClick={() => setFilter("Pending")}
          >
            Pending
          </button>
          <button
            className={filter === "Resolved" ? "active-filter" : ""}
            onClick={() => setFilter("Resolved")}
          >
            Resolved
          </button>
        </div>

        {/* ---- Stats ---- */}
        <div className="stats-grid">
          <div className="admin-card blue">
            <div className="card-icon">
              <FaExclamationTriangle />
            </div>
            <div>
              <h2>{emergencies.length}</h2>
              <p>Total Emergencies</p>
            </div>
          </div>

          <div className="admin-card orange">
            <div className="card-icon">
              <FaClock />
            </div>
            <div>
              <h2>{pendingCount}</h2>
              <p>Pending</p>
            </div>
          </div>

          <div className="admin-card green">
            <div className="card-icon">
              <FaCheckCircle />
            </div>
            <div>
              <h2>{resolvedCount}</h2>
              <p>Resolved</p>
            </div>
          </div>
        </div>

        {/* ---- Table panel ---- */}
        <div className="emergency-panel">
          <div className="emergency-panel-header">
            <h3>All Emergency Requests</h3>
            <span className="emergency-count">
              {filtered.length} of {emergencies.length}
            </span>
          </div>

          {loading ? (
            <div className="admin-loading">
              <div className="admin-spinner"></div>
              <p>Loading emergencies...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-card">
              <FaExclamationTriangle size={30} />
              <h3>No Emergency Requests</h3>
              <p>
                {emergencies.length === 0
                  ? "No emergencies have been reported yet."
                  : "Try adjusting your search or filter."}
              </p>
            </div>
          ) : (
            <div className="emergency-table-wrapper">
              <table className="emergency-table">
                <thead>
                  <tr>
                    <th>Passenger</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item._id}
                      onClick={() => openEmergency(item)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <div className="applicant-cell">
                          <div className="applicant-avatar-sm emergency-avatar">
                            {item.name?.charAt(0)}
                          </div>
                          <span>{item.name}</span>
                        </div>
                      </td>

                      <td>{item.email}</td>
                      <td>{item.phone}</td>

                      <td>
                        {new Date(item.createdAt).toLocaleDateString(
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
                          className={`status-pill-table ${
                            item.status === "Resolved"
                              ? "active"
                              : "pending"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>
                        <button
                          className="table-view-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            openMap(item.latitude, item.longitude);
                          }}
                        >
                          <FaMapMarkerAlt size={11} /> View
                        </button>
                      </td>

                      <td>
                        {item.status === "Pending" ? (
                          <button
                            className="table-approve-btn"
                            onClick={(event) => {
                              event.stopPropagation();
                              resolveEmergency(item._id);
                            }}
                          >
                            <FaCheckCircle size={11} /> Resolve
                          </button>
                        ) : (
                          <span className="done-tag">
                            <FaCheckCircle size={11} /> Resolved
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ---- Emergency detail modal ---- */}
      {showModal && selectedEmergency && (
        <div className="modal-overlay" onClick={closeEmergency}>
          <div
            className="emergency-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>🚨 Emergency Details</h2>
              <button className="close-btn" onClick={closeEmergency}>
                ✖
              </button>
            </div>

            <div className="modal-body">
              <div className="applicant-header">
                <div className="applicant-avatar emergency-avatar-lg">
                  {selectedEmergency.name?.charAt(0)}
                </div>
                <div>
                  <h2>{selectedEmergency.name}</h2>
                  <p>{selectedEmergency.email}</p>
                  <span>{selectedEmergency.phone}</span>
                </div>
              </div>

              <div className="details-section">
                <h3>Request Details</h3>

                <div className="detail-row">
                  <strong>Status</strong>
                  <span
                    className={`status-pill-table ${
                      selectedEmergency.status === "Resolved"
                        ? "active"
                        : "pending"
                    }`}
                  >
                    {selectedEmergency.status}
                  </span>
                </div>

                <div className="detail-row">
                  <strong>Date</strong>
                  <span>
                    {new Date(
                      selectedEmergency.createdAt
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="detail-row">
                  <strong>Latitude</strong>
                  <span>{selectedEmergency.latitude || "—"}</span>
                </div>

                <div className="detail-row">
                  <strong>Longitude</strong>
                  <span>{selectedEmergency.longitude || "—"}</span>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="table-view-btn wide"
                  onClick={() =>
                    openMap(
                      selectedEmergency.latitude,
                      selectedEmergency.longitude
                    )
                  }
                >
                  <FaMapMarkerAlt size={13} /> View Live Location
                </button>

                {selectedEmergency.status === "Pending" && (
                  <button
                    className="table-approve-btn wide"
                    onClick={() => {
                      resolveEmergency(selectedEmergency._id);
                      closeEmergency();
                    }}
                  >
                    <FaCheckCircle size={13} /> Resolve Emergency
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmergencyApplications;