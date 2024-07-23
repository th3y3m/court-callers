import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { forgetPassword } from "../../api/userApi";

import "./forgetPassCss.css";
import ClipLoader from "react-spinners/ClipLoader";
import { validateEmailForgetPass } from "../formValidation";

const ForgotPass = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const [emailValidation, setEmailValidation] = useState({
    isValid: true,
    message: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

   const emailValidation = await validateEmailForgetPass(email);

    setEmailValidation(emailValidation);

    if (!emailValidation.isValid) {
      setMessage("Please try again");
      setMessageType("error");
    
    }

    setLoading(true);

    try {
      const response = await forgetPassword(email);
      if (response.success) {
        setSuccess(response.message);
        setError("");
      } else {
        setError(response.message);
        setSuccess("");
        console.log("error in forget password", response.message);
      }
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log("Error fetching email:", error.response.data.message);
            setError(error.response.data.message);
            setSuccess("");
          } else {
            console.log("Error fetching email:", error.message);
            setError("An unexpected error occurred");
            setSuccess("");
          }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-box">
      <div className="forgot-container">
        <div style={{ height: "45vh" }}>
          <div className="forgot-title">Forget Password</div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && (
            <p style={{ color: "green", display: "flex", textAlign: "center" }}>
              {success}
            </p>
          )}
          <form className="forgot-form" onSubmit={handleSubmit}>
            <div className="form-group">
              
              <input
                className={
                  emailValidation.isValid ? "forgot-input" : "error-input"
                }
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required="Please enter your email"
              />
             
            </div>
            <button className="forgot-submit-btn" type="submit">
              {loading ? (
                <ClipLoader size={15} color="#fff" />
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          <>
            <p style={{ fontSize: "large" }} className="signup-link">
              Don't have an account?
              <Link style={{ textDecoration: "none" }} to="/login">
                <a href="#" className="link">
                  {" "}
                  Sign up now
                </a>
              </Link>
            </p>
          </>
        </div>
      </div>
    </div>
  );
};

export default ForgotPass;
