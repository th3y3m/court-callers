import React from 'react';
import './SuccessPage.css';
import { Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import yesImg from "assets/users/images/byday/green_tick.png"

function PaymentSuccessful() {
  return (
    <div className="payment-container">
      <div className="success-box">
        <img src={yesImg} alt="Payment Successful" />
        <h2>Thank You!</h2>
        <p style={{fontSize: "large", lineHeight: 2}}>Your booking has been successfully submitted. Thanks for choosing our service <FaHeart style={{color: "#ff1744", fontSize: "large", verticalAlign: -3}}  /></p>
        <div style={{display: "flex", justifyContent: "space-around"}}>
        <button style={{marginRight: 20}}><Link to="/" style={{textDecoration: "none", color: "#fff"}}>Back to Home</Link></button>
        <button><Link to="/booked" style={{textDecoration: "none", color: "#fff"}}>View Booking</Link></button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccessful;
