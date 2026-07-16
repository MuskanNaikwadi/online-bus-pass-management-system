import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const [transparent, setTransparent] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setTransparent(window.scrollY < 500);
    };

    window.addEventListener("scroll", handleScroll);

    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${transparent ? "transparent" : ""}`}>
      <h2>🚌 eBusPass</h2>

      <div className="nav-links">
        <a href="#features">Features</a>
        <a href="#safety">Safety</a>
        <a href="#impact">Impact</a>

        {/* AI Assistant */}
        <Link to="/ai-chat" className="nav-link">
          🤖 AI Assistant
        </Link>

        <Link to="/login">
          <button className="login-btn">
            Login
          </button>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;