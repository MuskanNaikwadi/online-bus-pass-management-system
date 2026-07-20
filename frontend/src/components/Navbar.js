import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const [transparent, setTransparent] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setTransparent(window.scrollY < 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${transparent ? "transparent" : ""}`}>
      <h2>🚌 eBusPass</h2>

      {/* Hamburger Button - only mobile */}
      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Nav Links */}
      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="#safety" onClick={() => setMenuOpen(false)}>Safety</a>
        <a href="#impact" onClick={() => setMenuOpen(false)}>Impact</a>
        <Link to="/ai-chat" className="nav-link" onClick={() => setMenuOpen(false)}>
          🤖 AI Assistant
        </Link>
        <Link to="/login" onClick={() => setMenuOpen(false)}>
          <button className="login-btn">Login</button>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;