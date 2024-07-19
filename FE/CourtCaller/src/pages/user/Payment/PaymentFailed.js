import React from 'react';
import './FailurePage.css';
import { Link } from "react-router-dom";
import noImg from "assets/users/images/byday/red_cross.png"

function PaymentFailed() {
  return (
    <div className="failed-container">
      <div className="failed-box">
        <img src={noImg} alt="Payment Failed" />
        <h2>OOPS !!!</h2>
        <p style={{fontSize: "large", lineHeight: 2}}>Something went wrong! Please try again on booking or contact with Us: <a href="mailto:courtcallers@gmail.com" className="email-contact">courtcallers@gmail.com</a></p>
        <button style={{marginTop: 10}}><Link style={{textDecoration: "none", color: "#fff"}} to="/">Back to Home</Link></button>
      </div>
    </div>
  );
}

export default PaymentFailed;
