import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import phonepe from "../assets/payment/phonepe.png";
import gpay from "../assets/payment/gpay.png";
import paytm from "../assets/payment/paytm.png";

import "./Payment.css";

function Payment() {

    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState("");

    const amount = 400;

    return (

        <div className="payment-container">

            <div className="payment-card">

                <h2>💳 Payment Gateway</h2>

                <h3>Amount : ₹ {amount}</h3>

                <h4>Choose Payment Method</h4>

                <div
                    className={`payment-option ${paymentMethod === "PhonePe" ? "selected" : ""}`}
                    onClick={() => setPaymentMethod("PhonePe")}
                >
                    <img src={phonepe} alt="PhonePe" />
                    <span>PhonePe</span>
                </div>

                <div
                    className={`payment-option ${paymentMethod === "Google Pay" ? "selected" : ""}`}
                    onClick={() => setPaymentMethod("Google Pay")}
                >
                    <img src={gpay} alt="Google Pay" />
                    <span>Google Pay</span>
                </div>

                <div
                    className={`payment-option ${paymentMethod === "Paytm" ? "selected" : ""}`}
                    onClick={() => setPaymentMethod("Paytm")}
                >
                    <img src={paytm} alt="Paytm" />
                    <span>Paytm</span>
                </div>

                <div
                    className={`payment-option ${paymentMethod === "Card" ? "selected" : ""}`}
                    onClick={() => setPaymentMethod("Card")}
                >
                    💳 Credit / Debit Card
                </div>

                <button
                    className="pay-btn"
                    onClick={async()=>{

    if(!paymentMethod){
        alert("Please select a payment method");
        return;
    }

    try{

        const token = localStorage.getItem("token");

        const res = await axios.post(
            `${process.env.REACT_APP_API_URL}/api/buspass/payment`,
            {
                amount: amount,
                paymentMethod: paymentMethod
            },
            {
                headers:{
                    Authorization:`Bearer ${token}`
                }
            }
        );


        alert("✅ Payment Successful");

        navigate("/payment-history");


    }catch(error){

        console.log(error);

        alert(
          error.response?.data?.message ||
          "Payment Failed"
        );

    }

}}
                >
                    Pay Now
                </button>

            </div>

        </div>

    );

}

export default Payment;