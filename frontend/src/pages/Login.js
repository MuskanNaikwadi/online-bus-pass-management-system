import React, { useState } from "react";
import { Link } from "react-router-dom";
import bgImage from "../assets/background/login.png";
import axios from "axios";
import Swal from "sweetalert2";
import "./login.css";
function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/login`,
        {
          email,
          password,
        }
      );

      console.log("Login Response:", response.data);

      // ✅ wipe everything from any previous session before storing new token
      localStorage.clear();
      localStorage.setItem("token", response.data.token);

      const userName = response.data.user.name || "User";

      // ✅ Sweet Alert on success
      Swal.fire({
        icon: "success",
        title: `Welcome, ${userName}! 🎉`,
        text: "Login successful. Redirecting...",
        timer: 1800,
        showConfirmButton: false,
        customClass: {
          popup: "custom-swal-popup",
          title: "custom-swal-title",
        },
      }).then(() => {
        // ✅ full hard reload — guarantees ALL React state/context resets cleanly
        if (response.data.user.role === "admin") {
          window.location.href = "/admin-dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      });
    } catch (error) {
      console.log("Login Error:", error.response?.data || error.message);
      const msg = error.response?.data?.message || "Login Failed";
      setError(msg);

      // ✅ Sweet Alert on failure
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: msg,
        confirmButtonText: "Try Again",
        customClass: {
          popup: "custom-swal-popup",
          title: "custom-swal-title",
          confirmButton: "custom-swal-confirm-btn",
        },
        buttonsStyling: false,
      });
    }
  };
  return (
    <div
      className="login-page"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <div className="overlay"></div>

      <div className="login-card">
        <Link to="/" className="back-home">
          ← Back to Home
        </Link>

        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Login to manage your smart bus pass</p>
        </div>

        <form className="login-form">
          {error && <p className="error-msg">{error}</p>}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="login-options">
            <label>
              <input type="checkbox" />
              Remember Me
            </label>

            <span className="forgot-password">Forgot Password?</span>
          </div>

          <button type="button" className="login-btn" onClick={handleLogin}>
            Login
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?
            <Link to="/register">Register Now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;