import React from "react";

const Footer = () => {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* Left Section */}
        <div className="footer-section">
          <h2 className="footer-logo">🚌 eBusPass</h2>

          <p>
            Smart Travel Starts With Smart Pass
            Management
          </p>

          <p>
            A smart public transport platform
            for modern, safe and student-friendly
            travel.
          </p>
        </div>

        {/* Platform Links */}
        <div className="footer-section">
          <h3>Platform</h3>

          <ul>
            <li>Features</li>
            <li>Women Safety</li>
            <li>Impact</li>
            <li>Login</li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer-section">
          <h3>Support Center</h3>

          <ul>
            <li>📧 support@ebuspass.gov.in</li>
            <li>📞 1800-200-101</li>
            <li>🏢 Transport Authority</li>
          </ul>
        </div>

        {/* Social */}
        <div className="footer-section">
          <h3>Connect</h3>

          <div className="social-icons">
            <div className="social-icon">X</div>
            <div className="social-icon">in</div>
            <div className="social-icon">f</div>
            <div className="social-icon">ig</div>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 eBusPass - Smart Travel Starts With Smart Pass Management
      </div>

    </footer>
  );
};

export default Footer;