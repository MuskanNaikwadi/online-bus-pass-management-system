import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./AiChat.css";

function AiChat() {
    const [message, setMessage] = useState("");
    const [reply, setReply] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!message) return;

        setLoading(true);

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/chat`, {
                message,
            });

            setReply(res.data.reply);
        } catch (err) {
            console.log(err);
            setReply("Something went wrong!");
        }

        setLoading(false);
    };

    return (
        <div className="ai-page">

            <div className="ai-card">
                <div className="back-home-container">
                    <Link to="/" className="back-home-btn">
                        ⬅ Back to Home
                    </Link>
                </div>


                <div className="ai-header">
                    <h1>🤖 AI Assistant</h1>
                    <p>Your smart bus pass helper</p>
                </div>

                <textarea
                    className="ai-textarea"
                    placeholder="Ask anything..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />

                <button
                    className="ai-btn"
                    onClick={sendMessage}
                >
                    {loading ? "Thinking..." : "Ask AI"}
                </button>

                <div className="response-box">
                    <h2>💬 Response</h2>

                    <p>
                        {reply || "Your AI response will appear here..."}
                    </p>

                </div>

            </div>

        </div>
    );
}

export default AiChat;