import React, { useState } from "react";
import { FaShieldAlt, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import axios from "axios";
import "./SOSButton.css";

function SOSButton() {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleSendSOS = () => {

        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        setLoading(true);

        navigator.geolocation.getCurrentPosition(

            async (position) => {
                console.log("Position:", position.coords);
                console.log(
                    "CURRENT LOCATION:",
                    position.coords.latitude,
                    position.coords.longitude
                );
                try {

                    const token = localStorage.getItem("token");

                    await axios.post(
                        "http://localhost:5000/api/emergency",
                        {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    setLoading(false);
                    setShowModal(false);

                    alert("✅ Emergency Alert Sent Successfully.");

                } catch (error) {

                    console.log(error);
                    setLoading(false);

                }

            },

            (error) => {

                console.log(error);

                setLoading(false);

                alert("Location access denied.");

            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }

        );

    };

    return (
        <>
            {/* Floating Button */}
            <button
                className="floating-sos-btn"
                onClick={() => setShowModal(true)}
            >
                <FaShieldAlt />
                <span>SOS</span>
            </button>

            {/* Modal */}
            {showModal && (
                <div className="sos-overlay">

                    <div className="sos-modal">

                        <button
                            className="close-btn"
                            onClick={() => setShowModal(false)}
                        >
                            <FaTimes />
                        </button>

                        <div className="warning-icon">
                            <FaExclamationTriangle />
                        </div>

                        <h2>Emergency SOS</h2>

                        <p>
                            Press <strong>Send SOS</strong> only in an emergency.
                            Your live location and emergency details will be
                            shared with the Transport Administrator.
                        </p>

                        <div className="modal-buttons">

                            <button
                                className="cancel-btn"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="send-btn"
                                onClick={handleSendSOS}
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send SOS"}
                            </button>

                        </div>

                    </div>

                </div>
            )}
        </>
    );
}

export default SOSButton;