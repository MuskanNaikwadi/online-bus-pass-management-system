import axios from "axios";
import { useEffect, useRef, useState } from "react";
import React from "react";
import Sidebar from "../components/Sidebar";
import SOSButton from "../components/SOSButton";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FaBus, FaMapMarkerAlt } from "react-icons/fa";

import "./MyPasses.css";
import { useUser, getPhotoUrl } from "../context/UserContext";

function MyPasses() {
  const navigate = useNavigate();

  // ✅ user now comes from shared UserContext — no local fetch needed
  const { user } = useUser();

  const [passData, setPassData] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const notifications =
    JSON.parse(localStorage.getItem("notifications")) || [];

  // one ref PER pass, keyed by pass._id
  const passRefs = useRef({});

 // fetch passes on mount
 useEffect(() => {
    const fetchMyPass = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "${process.env.REACT_APP_API_URL}/api/buspass/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPassData(
          res.data.data.filter((pass) => pass.status !== "Expired")
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPass();
  }, []);

  const handleDownload = async (pass) => {
    try {
      setDownloadingId(pass._id);
      const node = passRefs.current[pass._id];
      if (!node) return;

      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: null,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);
      pdf.save(`BusPass-${pass.passNumber}.pdf`);
    } catch (error) {
      console.log(error);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        {/* Topbar — same structure as Dashboard */}
        <div className="topbar">
          <h2>My Passes</h2>

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

        {loading ? (
          <div className="payment-loading">
            <div className="payment-loading-spinner"></div>
            <p>Loading your passes...</p>
          </div>
        ) : passData.length === 0 ? (
          <div className="no-pass-card">
            <div className="no-pass-icon">🚌</div>
            <h2>No Pass Found</h2>
            <p>You have not applied for any pass yet.</p>
            <button
              className="apply-first-pass-btn"
              onClick={() => navigate("/apply-pass")}
            >
              Apply For Pass
            </button>
          </div>
        ) : (
          <div className="passes-grid">
            {passData.map((pass) => (
              <div className="pass-wrapper" key={pass._id}>
                <div
                  className="pass-card"
                  ref={(el) => (passRefs.current[pass._id] = el)}
                >
                  <div
                    className={`status-badge ${(
                      pass.status || "Pending"
                    ).toLowerCase()}`}
                  >
                    {pass.status}
                  </div>

                  <div className="pass-header">
                    <div>
                      <h2>{pass.fullName}</h2>
                      <span className="pass-number">
                        ID: {pass.passNumber}
                      </span>
                    </div>

                    <div className="bus-icon">
                      <FaBus />
                    </div>
                  </div>

                  <div className="route">
                    <FaMapMarkerAlt />
                    {pass.source}
                    <span>→</span>
                    {pass.destination}
                  </div>

                  <div className="pass-card-body">
                    <div className="pass-info">
                      <p>
                        <strong>Type:</strong> {pass.passType}
                      </p>
                      <p>
                        <strong>Category:</strong> {pass.category}
                      </p>
                      <p>
                        <strong>Applied:</strong>{" "}
                        {pass.createdAt
                          ? new Date(pass.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                      <p>
                        <strong>Expiry:</strong>{" "}
                        {pass.expiryDate
                          ? new Date(pass.expiryDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>

                    <div className="qr-section">
                      <div className="qr-container">
                        <QRCodeCanvas
                          size={100}
                          value={`https://onlinebuspass.vercel.app/verify-pass/${pass._id}`}
                        />
                      </div>
                      <p>Scan to Verify</p>
                    </div>
                  </div>
                </div>

                <button
                  className="download-btn"
                  disabled={downloadingId === pass._id}
                  onClick={() => handleDownload(pass)}
                >
                  {downloadingId === pass._id
                    ? "Preparing..."
                    : "Download Pass"}
                </button>
              </div>
            ))}
          </div>
        )}

        <SOSButton />
      </div>
    </div>
  );
}

export default MyPasses;