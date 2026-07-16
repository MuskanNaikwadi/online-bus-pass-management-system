import Sidebar from "../components/Sidebar";
import SOSButton from "../components/SOSButton";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaLocationArrow,
} from "react-icons/fa";

import "./WomenSafety.css";
import "./Dashboard.css";
import { useUser, getPhotoUrl } from "../context/UserContext";

const EMERGENCY_CONTACTS = [
  { icon: "🚓", label: "Police", number: "100" },
  { icon: "👩", label: "Women Helpline", number: "1091" },
  { icon: "🚑", label: "Ambulance", number: "108" },
  { icon: "🔥", label: "Fire", number: "101" },
];

function WomenSafety() {
  const navigate = useNavigate();

  // ✅ user now comes from shared UserContext — no local fetch needed
  const { user } = useUser();

  const [sosState, setSosState] = useState("idle");
  const [coords, setCoords] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeContact, setActiveContact] = useState(null); // holds {icon, label, number} or null
  const [copied, setCopied] = useState(false);

  const openContact = (contact) => {
    setCopied(false);
    setActiveContact(contact);
  };

  const closeContact = () => {
    setActiveContact(null);
    setCopied(false);
  };

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(activeContact.number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.log("Copy failed:", err);
    }
  };

  const notifications =
    JSON.parse(localStorage.getItem("notifications")) || [];

  const getLiveLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported on this device"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  };

  const confirmSOS = () => {
    setSosState("confirm");
  };

  const cancelSOS = () => {
    setSosState("idle");
    setErrorMsg("");
    setCoords(null);
  };

  const sendSOS = async () => {
    try {
      setSosState("locating");

      let location = "Location unavailable";

      try {
        const pos = await getLiveLocation();
        setCoords(pos);
        location = pos.lat.toFixed(6) + ", " + pos.lng.toFixed(6);
      } catch (geoErr) {
        console.log("Geolocation failed:", geoErr);
      }

      setSosState("sending");

      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/buspass/sos",
        {
          message: "Emergency SOS Alert",
          location: location,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res.data);
      setSosState("success");

      setTimeout(() => {
        setSosState("idle");
        setCoords(null);
      }, 4000);
    } catch (error) {
      console.log(error);
      setErrorMsg(
        error.response?.data?.message || "Failed to send SOS. Please try again."
      );
      setSosState("failed");
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <div className="topbar">
          <h2>Safety</h2>
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

        <div className="safety-hero">
          <div className="safety-hero-icon">
            <FaShieldAlt />
          </div>
          <div>
            <h3>You're Protected</h3>
            <p>
              Reach emergency services instantly, or send your live location
              to our response team with one tap.
            </p>
          </div>
        </div>

        <div className="safety-grid">
          <div className="safety-card">
            <h3>Emergency Contacts</h3>
            <p className="safety-subtext">Tap any contact to call directly</p>

            <div className="contacts-list">
              {EMERGENCY_CONTACTS.map((c) => (
                <button
                  key={c.number}
                  className="contact-row"
                  onClick={() => openContact(c)}
                >
                  <span className="contact-icon">{c.icon}</span>
                  <span className="contact-label">{c.label}</span>
                  <span className="contact-number">
                    <FaPhoneAlt size={12} /> {c.number}
                  </span>
                </button>
              ))}
            </div>

            <button className="emergency-btn" onClick={confirmSOS}>
              Emergency SOS
            </button>
          </div>

          <div className="safety-card tips-card">
            <h3>Safety Tips</h3>
            <ul className="tips-list">
              <li>Share your live trip status with a trusted contact.</li>
              <li>Sit near the driver or in well-lit areas of the bus.</li>
              <li>Keep your phone charged before night travel.</li>
              <li>Trust your instincts — use SOS if something feels wrong.</li>
            </ul>
          </div>
        </div>

        <SOSButton />
      </div>

      {sosState !== "idle" && (
        <div className="sos-overlay">
          <div className="sos-modal">
            {sosState === "confirm" && (
              <>
                <div className="sos-icon warn">
                  <FaExclamationTriangle />
                </div>
                <h3>Send Emergency SOS?</h3>
                <p>
                  This will alert our response team with your live location.
                  Only proceed in a genuine emergency.
                </p>
                <div className="sos-modal-buttons">
                  <button className="sos-cancel-btn" onClick={cancelSOS}>
                    Cancel
                  </button>
                  <button className="sos-confirm-btn" onClick={sendSOS}>
                    Yes, Send SOS
                  </button>
                </div>
              </>
            )}

            {sosState === "locating" && (
              <>
                <div className="sos-spinner"></div>
                <h3>Getting Your Location</h3>
                <p>
                  <FaLocationArrow size={12} /> Please allow location access
                </p>
              </>
            )}

            {sosState === "sending" && (
              <>
                <div className="sos-spinner"></div>
                <h3>Sending Alert</h3>
                <p>Notifying emergency response team</p>
              </>
            )}

            {sosState === "success" && (
              <>
                <div className="sos-icon success">
                  <FaCheckCircle />
                </div>
                <h3>SOS Sent Successfully</h3>
                <p>Help is on the way. Stay safe.</p>
                {coords && (
                  <div className="sos-location-pill">
                    <FaMapMarkerAlt size={12} /> {coords.lat.toFixed(4)},{" "}
                    {coords.lng.toFixed(4)}
                  </div>
                )}
              </>
            )}

            {sosState === "failed" && (
              <>
                <div className="sos-icon fail">
                  <FaTimesCircle />
                </div>
                <h3>SOS Failed</h3>
                <p>{errorMsg}</p>
                <div className="sos-modal-buttons">
                  <button className="sos-cancel-btn" onClick={cancelSOS}>
                    Close
                  </button>
                  <button className="sos-confirm-btn" onClick={sendSOS}>
                    Retry
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ---- Contact number modal ---- */}
      {activeContact && (
        <div className="sos-overlay" onClick={closeContact}>
          <div
            className="contact-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="contact-modal-icon">{activeContact.icon}</div>
            <h3>{activeContact.label}</h3>
            <p className="contact-modal-number">{activeContact.number}</p>

            <div className="contact-modal-buttons">
              <a
                href={"tel:" + activeContact.number}
                className="contact-call-btn"
              >
                <FaPhoneAlt size={13} /> Call Now
              </a>

              <button
                className="contact-copy-btn"
                onClick={copyNumber}
              >
                {copied ? "Copied!" : "Copy Number"}
              </button>
            </div>
            <button className="contact-close-btn" onClick={closeContact}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WomenSafety;