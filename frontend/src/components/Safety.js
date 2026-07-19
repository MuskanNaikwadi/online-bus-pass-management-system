import SOSButton from "./SOSButton";
import {
  FaShieldAlt,
  FaCheckCircle
} from "react-icons/fa";

function Safety() {
  return (
    <>
      <section id="safety" className="safety-section">

        <div className="safety-left">

          <div className="safety-badge">
            🛡️ Women Safety, Built In
          </div>

          <h2>
            Travel with confidence, day or night
          </h2>

          <p>
            A floating SOS button is available across the
            entire platform. One tap sends an emergency
            alert with your live location to trusted
            contacts and the nearest patrol.
          </p>

          <div className="safety-list">

            <div>
              <FaCheckCircle />
              <span>One-tap emergency SOS</span>
            </div>

            <div>
              <FaCheckCircle />
              <span>Share live location instantly</span>
            </div>

            <div>
              <FaCheckCircle />
              <span>Verified emergency contacts</span>
            </div>

            <div>
              <FaCheckCircle />
              <span>Nearest police station info</span>
            </div>

          </div>

          <button className="safety-btn">
            Try Safety Tools →
          </button>

        </div>

        <div className="safety-right">

          <div className="safety-card">

            <div className="safety-icon">
              <FaShieldAlt />
            </div>

            <h3>Always one tap away</h3>

            <p>
              The SOS button follows you on every page.
            </p>

          </div>

        </div>

      </section>

      {/* Floating SOS Button */}

      <SOSButton />
    </>
  );
}

export default Safety;