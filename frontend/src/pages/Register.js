import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bgImage from "../assets/background/login.png";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    dob: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async () => {
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.mobile ||
      !formData.dob ||
      !formData.gender ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("⚠ Please fill all required fields");
      return;
    }

    if (formData.password.length < 6) {
      setError("⚠ Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("⚠ Passwords do not match");
      return;
    }

    setError("");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/register`,
        {
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.mobile,
          gender: formData.gender,
          dob: formData.dob,
          role: "user",
        }
      );

      console.log(response.data);

      alert("🎉 Account Created Successfully!");

      navigate("/login");

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message || "Registration Failed"
      );
    }
  };
 return (
    <div
        className="register-page"
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
      <div className="register-card">

        <Link to="/" className="back-home">
          ← Back to Home
        </Link>

        <div className="register-header">

          <div className="register-logo">
            🚌
          </div>

          <h1>Create Account</h1>

          <p>
            Register to access the Smart Bus Pass
            Portal
          </p>

        </div>

        {error && (
          <p className="error-msg">
            {error}
          </p>
        )}

        <div className="form-step">

          <input
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({
                ...formData,
                fullName: e.target.value,
              })
            }
          />

          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
          />

          <input
            type="tel"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={(e) =>
              setFormData({
                ...formData,
                mobile: e.target.value,
              })
            }
          />

          <input
            type="date"
            value={formData.dob}
            onChange={(e) =>
              setFormData({
                ...formData,
                dob: e.target.value,
              })
            }
          />

          <select
            value={formData.gender}
            onChange={(e) =>
              setFormData({
                ...formData,
                gender: e.target.value,
              })
            }
          >
            <option value="">
              Select Gender
            </option>

            <option value="Male">
              Male
            </option>

            <option value="Female">
              Female
            </option>

            <option value="Other">
              Other
            </option>

          </select>

          <div className="password-box">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Create Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value,
                })
              }
            />

            <span
              className="eye-icon"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              {showPassword ? "👁" : "🙈"}
            </span>

          </div>

          <div className="password-box">

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              placeholder="Confirm Password"
              value={
                formData.confirmPassword
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  confirmPassword:
                    e.target.value,
                })
              }
            />

            <span
              className="eye-icon"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
            >
              {showConfirmPassword
                ? "👁"
                : "🙈"}
            </span>

          </div>

          <button
            className="register-btn"
            onClick={handleSubmit}
          >
            Create Account
          </button>

        </div>
      </div>
    </div>
  );
}

export default Register;