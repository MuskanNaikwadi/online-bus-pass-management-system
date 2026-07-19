import Sidebar from "../components/Sidebar";
import SOSButton from "../components/SOSButton";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaLock,
  FaMobileAlt,
  FaCreditCard,
  FaUniversity,
  FaWallet,
} from "react-icons/fa";

import "./ApplyPass.css";
import { useUser, getPhotoUrl } from "../context/UserContext";

const STEP_LABELS = ["Personal", "Route", "Documents", "Payment"];

function ApplyPass() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [passType, setPassType] = useState("");
  const [error, setError] = useState("");
  const [document, setDocument] = useState(null);

  // ✅ user now comes from shared UserContext — no local fetch needed
  const { user } = useUser();

  const notifications =
    JSON.parse(localStorage.getItem("notifications")) || [];

  // ---- Payment flow state ----
  // idle | processing | success | failed
  // ---- Payment flow state ----
  // idle | processing | success | failed
  const [paymentStatus, setPaymentStatus] = useState("idle");

  // ---- Payment method selection ----
  const [paymentMethod, setPaymentMethod] = useState("upi"); // upi | card | netbanking | wallet

  const [upiId, setUpiId] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [selectedBank, setSelectedBank] = useState("");

  const [selectedWallet, setSelectedWallet] = useState("");

  const [paymentFormError, setPaymentFormError] = useState("");
  // ✅ calculate applicant age from DOB — needed for Child pass tiers
  const calculateAge = (dobValue) => {
    if (!dobValue) return null;
    const birthDate = new Date(dobValue);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    if (
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const applicantAge = calculateAge(dob);

  let passFee = 0;
  let discount = 0;
  let discountLabel = "";

  if (passType === "One Day") passFee = 50;
  else if (passType === "Monthly") passFee = 500;
  else if (passType === "Quarterly") passFee = 1300;
  else if (passType === "Half Yearly") passFee = 2500;
  else if (passType === "Yearly") passFee = 4500;

  if (category === "Student") {
    discount = passFee * 0.4;
    discountLabel = "Student Discount (20%)";
  } else if (category === "Senior Citizen") {
    discount = passFee * 0.5;
    discountLabel = "Senior Citizen Discount (30%)";
  } else if (category === "Child") {
    if (applicantAge !== null && applicantAge <= 5) {
      // ✅ age 0-5 → completely free
      discount = passFee;
      discountLabel = "Child Pass (Age 0-5) — Free";
    } else {
      // ✅ age 6-12 → half price
      discount = passFee * 0.5;
      discountLabel = "Child Pass (Age 6-12) — 50% Off";
    }
  }

  const totalAmount = passFee - discount;

  // ---- Actual backend submission (called only after payment "succeeds") ----
  const submitApplication = async () => {
    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("fullName", fullName);
    formData.append("dob", dob);
    formData.append("gender", gender);
    formData.append("mobile", mobile);
    formData.append("email", email);
    formData.append("category", category);
    formData.append("source", source);
    formData.append("destination", destination);
    formData.append("passType", passType);

    if (document) {
      formData.append("document", document);
    }

    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/buspass`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  };
  // ---- Validate the selected payment method's fields before "charging" ----
  const validatePaymentMethod = () => {
    if (paymentMethod === "upi") {
      if (!upiId || !/^[\w.\-]+@[\w]+$/.test(upiId)) {
        return "Please enter a valid UPI ID (e.g. name@bank)";
      }
    } else if (paymentMethod === "card") {
      const cleanNumber = cardNumber.replace(/\s/g, "");
      if (!/^\d{16}$/.test(cleanNumber)) {
        return "Enter a valid 16-digit card number";
      }
      if (!cardName.trim()) {
        return "Enter the name on card";
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
        return "Enter expiry in MM/YY format";
      }
      if (!/^\d{3,4}$/.test(cardCvv)) {
        return "Enter a valid CVV";
      }
    } else if (paymentMethod === "netbanking") {
      if (!selectedBank) {
        return "Please select your bank";
      }
    } else if (paymentMethod === "wallet") {
      if (!selectedWallet) {
        return "Please select a wallet";
      }
    }
    return "";
  };
  // ---- Payment handler: animation first, then real submit ----
  const handlePayNow = async () => {
    const validationError = validatePaymentMethod();
    if (validationError) {
      setPaymentFormError(validationError);
      return;
    }
    setPaymentFormError("");

    setPaymentStatus("processing");

    try {
      // simulate payment gateway processing time
      await new Promise((resolve) => setTimeout(resolve, 2200));

      // only submit to backend once "payment" has gone through
      await submitApplication();

      // record payment + notification locally (used by other pages)
      const payments =
        JSON.parse(localStorage.getItem("payments")) || [];

      payments.unshift({
        paymentId: "PAY-" + Math.floor(100000 + Math.random() * 900000),
        amount: totalAmount,
        date: new Date().toLocaleString(),
      });
      localStorage.setItem("payments", JSON.stringify(payments));

      localStorage.setItem(
        "notifications",
        JSON.stringify([
          {
            message: "✅ Payment successful. Your pass application has been submitted.",
            date: new Date().toLocaleString(),
          },
        ])
      );

      setPaymentStatus("success");

      // let the success animation show briefly, then leave
      setTimeout(() => {
        navigate("/dashboard");
      }, 1800);
    } catch (err) {
      console.log(err);
      setPaymentStatus("failed");
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <div className="topbar">
          <div className="page-header">
            <h2>Apply For Pass</h2>
          </div>

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

        <div className="apply-content">
          <button
            className="back-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>

          {/* ---- Step Progress ---- */}
          <div className="steps">
            {STEP_LABELS.map((label, index) => {
              const stepNumber = index + 1;
              return (
                <React.Fragment key={label}>
                  <div
                    className={`step ${step >= stepNumber ? "active" : ""}`}
                  >
                    <span>
                      {step > stepNumber ? <FaCheckCircle /> : stepNumber}
                    </span>
                    <p>{label}</p>
                  </div>

                  {stepNumber !== STEP_LABELS.length && (
                    <div
                      className={`step-line ${step > stepNumber ? "active-line" : ""
                        }`}
                    ></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="form-card">
            {step === 1 && (
              <div>
                <h3>Personal Details</h3>
                {error && <div className="error-message">{error}</div>}

                <div className="form-grid">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-buttons single">
                  <button
                    className="continue-btn"
                    onClick={() => {
                      if (!fullName || !dob || !gender || !mobile || !email) {
                        setError("Please fill all fields");
                        return;
                      }
                      if (!/^[0-9]{10}$/.test(mobile)) {
                        setError("Mobile number must contain exactly 10 digits");
                        return;
                      }
                      if (!email.includes("@")) {
                        setError("Please enter a valid email address");
                        return;
                      }

                      setError("");
                      setStep(2);
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3>Route & Category Details</h3>
                {error && <div className="error-message">{error}</div>}

                <div className="form-grid">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    <option value="Child">Child</option>
                    <option value="Student">Student</option>
                    <option value="General">General</option>
                    <option value="Senior Citizen">Senior Citizen</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Source Stop"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />

                  <input
                    type="text"
                    placeholder="Destination Stop"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />

                  <select
                    value={passType}
                    onChange={(e) => setPassType(e.target.value)}
                  >
                    <option value="">Select Pass Type</option>
                    <option>One Day</option>
                    <option>Monthly</option>
                    <option>Quarterly</option>
                    <option>Half Yearly</option>
                    <option>Yearly</option>
                  </select>
                </div>

                <div className="form-buttons">
                  <button className="back-step-btn" onClick={() => setStep(1)}>
                    Back
                  </button>

                  <button
                    className="continue-btn"
                    onClick={() => {
                      if (!category || !source || !destination || !passType) {
                        setError("Please fill all fields");
                        return;
                      }

                      const birthDate = new Date(dob);
                      const today = new Date();
                      let age = today.getFullYear() - birthDate.getFullYear();

                      if (
                        today.getMonth() < birthDate.getMonth() ||
                        (today.getMonth() === birthDate.getMonth() &&
                          today.getDate() < birthDate.getDate())
                      ) {
                        age--;
                      }

                      if (category === "Child" && age > 12) {
                        setError("Only age 0-12 can apply for Child Pass");
                        return;
                      }
                      if (category === "Senior Citizen" && age < 60) {
                        setError("Senior Citizen Pass requires age 60+");
                        return;
                      }
                      if (
                        category === "Student" &&
                        (age < 13 || age > 25)
                      ) {
                        setError("Student Pass is only for age 13-25");
                        return;
                      }

                      setError("");
                      setStep(3);
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3>Upload Documents</h3>
                {error && <div className="error-message">{error}</div>}

                <div className="upload-box">
                  <div className="upload-icon">📄</div>
                  <h4>Upload Verification Document</h4>

                  <p className="document-info">
                    {category === "Student" &&
                      "Upload your Student ID Card or Bonafide Certificate"}
                    {category === "Senior Citizen" &&
                      "Upload your Aadhaar Card or Age Proof"}
                    {category === "Child" && "Upload Birth Certificate"}
                    {category === "General" && "Upload Aadhaar Card"}
                  </p>

                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (
                        file &&
                        !["image/png", "image/jpeg", "application/pdf"].includes(
                          file.type
                        )
                      ) {
                        setError("Only PDF, JPG and PNG files are allowed");
                        return;
                      }
                      setError("");
                      setDocument(file);
                    }}
                  />

                  {document && <p className="file-name">📄 {document.name}</p>}
                </div>

                <div className="form-buttons">
                  <button className="back-step-btn" onClick={() => setStep(2)}>
                    Back
                  </button>

                  <button
                    className="continue-btn"
                    onClick={() => {
                      if (!document) {
                        setError("Please upload required document");
                        return;
                      }
                      setError("");
                      setStep(4);
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h3>Payment Summary</h3>

                <div className="payment-summary">
                  <div className="summary-row">
                    <span>Passenger Name</span>
                    <strong>{fullName}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Category</span>
                    <strong>{category}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Route</span>
                    <strong>{source} → {destination}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Pass Type</span>
                    <strong>{passType}</strong>
                  </div>

                  <hr />

                  <div className="summary-row">
                    <span>Pass Fee</span>
                    <strong>₹{passFee}</strong>
                  </div>
                  <div className="summary-row discount">
                    <span>{discountLabel || "Discount"}</span>
                    <strong>- ₹{discount}</strong>
                  </div>
                  <div className="summary-row total">
                    <span>Total Amount</span>
                    <strong>₹{totalAmount}</strong>
                  </div>
                </div>

                {/* ---- Payment method selector ---- */}
                <div className="payment-methods-section">
                  <h4>Select Payment Method</h4>

                  <div className="payment-method-tabs">
                    <button
                      type="button"
                      className={`method-tab ${paymentMethod === "upi" ? "active" : ""}`}
                      onClick={() => {
                        setPaymentMethod("upi");
                        setPaymentFormError("");
                      }}
                    >
                      <FaMobileAlt size={16} />
                      <span>UPI</span>
                    </button>

                    <button
                      type="button"
                      className={`method-tab ${paymentMethod === "card" ? "active" : ""}`}
                      onClick={() => {
                        setPaymentMethod("card");
                        setPaymentFormError("");
                      }}
                    >
                      <FaCreditCard size={16} />
                      <span>Card</span>
                    </button>

                    <button
                      type="button"
                      className={`method-tab ${paymentMethod === "netbanking" ? "active" : ""}`}
                      onClick={() => {
                        setPaymentMethod("netbanking");
                        setPaymentFormError("");
                      }}
                    >
                      <FaUniversity size={16} />
                      <span>Net Banking</span>
                    </button>

                    <button
                      type="button"
                      className={`method-tab ${paymentMethod === "wallet" ? "active" : ""}`}
                      onClick={() => {
                        setPaymentMethod("wallet");
                        setPaymentFormError("");
                      }}
                    >
                      <FaWallet size={16} />
                      <span>Wallet</span>
                    </button>
                  </div>

                  {paymentFormError && (
                    <div className="error-message">{paymentFormError}</div>
                  )}

                  {/* ---- UPI ---- */}
                  {paymentMethod === "upi" && (
                    <div className="payment-method-form">
                      <label>Enter your UPI ID</label>
                      <input
                        type="text"
                        placeholder="yourname@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                      <div className="upi-app-row">
                        <span className="upi-app-chip">📱 GPay</span>
                        <span className="upi-app-chip">📱 PhonePe</span>
                        <span className="upi-app-chip">📱 Paytm</span>
                        <span className="upi-app-chip">📱 BHIM</span>
                      </div>
                    </div>
                  )}

                  {/* ---- Card ---- */}
                  {paymentMethod === "card" && (
                    <div className="payment-method-form">
                      <label>Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                          const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
                          setCardNumber(formatted);
                        }}
                      />

                      <label>Name on Card</label>
                      <input
                        type="text"
                        placeholder="As printed on card"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                      />

                      <div className="card-row">
                        <div>
                          <label>Expiry (MM/YY)</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                              if (val.length > 2) {
                                val = val.slice(0, 2) + "/" + val.slice(2);
                              }
                              setCardExpiry(val);
                            }}
                          />
                        </div>
                        <div>
                          <label>CVV</label>
                          <input
                            type="password"
                            placeholder="•••"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) =>
                              setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                            }
                          />
                        </div>
                      </div>

                      <div className="card-brands-row">
                        <span className="card-brand-chip">💳 Visa</span>
                        <span className="card-brand-chip">💳 Mastercard</span>
                        <span className="card-brand-chip">💳 RuPay</span>
                      </div>
                    </div>
                  )}

                  {/* ---- Net Banking ---- */}
                  {paymentMethod === "netbanking" && (
                    <div className="payment-method-form">
                      <label>Select Your Bank</label>
                      <div className="bank-grid">
                        {[
                          "State Bank of India",
                          "HDFC Bank",
                          "ICICI Bank",
                          "Axis Bank",
                          "Punjab National Bank",
                          "Bank of Baroda",
                          "Kotak Mahindra Bank",
                          "Canara Bank",
                        ].map((bank) => (
                          <button
                            type="button"
                            key={bank}
                            className={`bank-option ${selectedBank === bank ? "selected" : ""
                              }`}
                            onClick={() => setSelectedBank(bank)}
                          >
                            🏦 {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ---- Wallet ---- */}
                  {paymentMethod === "wallet" && (
                    <div className="payment-method-form">
                      <label>Select Wallet</label>
                      <div className="wallet-grid">
                        {["Paytm Wallet", "Amazon Pay", "Mobikwik", "Freecharge"].map(
                          (wallet) => (
                            <button
                              type="button"
                              key={wallet}
                              className={`wallet-option ${selectedWallet === wallet ? "selected" : ""
                                }`}
                              onClick={() => setSelectedWallet(wallet)}
                            >
                              👛 {wallet}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-buttons">
                  <button
                    className="back-step-btn"
                    onClick={() => setStep(3)}
                    disabled={paymentStatus === "processing"}
                  >
                    Back
                  </button>

                  <button
                    className="pay-now-btn"
                    onClick={handlePayNow}
                    disabled={paymentStatus === "processing"}
                  >
                    <FaLock size={13} style={{ marginRight: 8 }} />
                    Pay ₹{totalAmount} & Submit
                  </button>
                </div>

                <p className="payment-secure-note">
                  <FaLock size={11} /> 100% Secure Payments. Your data is encrypted.
                </p>
              </div>
            )}
          </div>
        </div>

        <SOSButton />
      </div>

      {/* ---- Payment animation overlay ---- */}
      {paymentStatus !== "idle" && (
        <div className="payment-overlay">
          <div className="payment-modal">
            {paymentStatus === "processing" && (
              <>
                <div className="payment-spinner"></div>
                <h3>Processing Payment…</h3>
                <p>
                  Paying via{" "}
                  {paymentMethod === "upi" && "UPI"}
                  {paymentMethod === "card" && "Card"}
                  {paymentMethod === "netbanking" && `Net Banking (${selectedBank})`}
                  {paymentMethod === "wallet" && selectedWallet}
                </p>
                <p>Please don't close or refresh this page.</p>
                <div className="payment-amount-pill">₹{totalAmount}</div>
              </>
            )}
            {paymentStatus === "success" && (
              <>
                <div className="payment-success-icon">
                  <FaCheckCircle />
                </div>
                <h3>Payment Successful!</h3>
                <p>Your bus pass application has been submitted.</p>
              </>
            )}

            {paymentStatus === "failed" && (
              <>
                <div className="payment-failed-icon">
                  <FaTimesCircle />
                </div>
                <h3>Payment Failed</h3>
                <p>Something went wrong. Please try again.</p>
                <button
                  className="retry-btn"
                  onClick={() => setPaymentStatus("idle")}
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplyPass;