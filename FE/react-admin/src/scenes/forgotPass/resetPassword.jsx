import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { resetPassword } from "../../api/userApi";
import { validatePassword,
    validateConfirmPassword, } from "../formValidation";
import "./resetPassStyle.css";
const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const email = queryParams.get("email");

  const [passwordValidation, setPasswordValidation] = useState({
    isValid: true,
    message: "",
  });
  const [confirmPasswordValidation, setConfirmPasswordValidation] = useState({
    isValid: true,
    message: "",
  });

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const passwordValidation = validatePassword(password);

    const confirmPasswordValidation = validateConfirmPassword(password,confirmPassword);


    setPasswordValidation(passwordValidation);
    setConfirmPasswordValidation(confirmPasswordValidation);

    if (!passwordValidation.isValid || !confirmPasswordValidation.isValid) {
      setMessage("Please try again");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(
        email,
        token,
        password,
        confirmPassword
      );
      if (!response.success) {
        throw new Error(response.message || "Something went wrong");
      }

      toast.success(response.message || "Password reset successfully!");
      navigate("/login"); // Chuyển hướng người dùng đến trang đăng nhập sau khi reset password thành công
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-box">
      <div className="forgot-container" id="container">
        <div>
          <form className="forgot-form" onSubmit={handleResetPassword}>
            <div className="forgot-title">RESET PASSWORD</div>
            <div className="form-group">
              <p style={{ marginBottom: 10, fontSize: "larger" }}>
                Enter your new password
              </p>
              <input
                className={
                  passwordValidation.isValid ? "forgot-input" : "error-input"
                }
                type="password"
                value={password}
                placeholder="New Password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {passwordValidation.message && (
                <p className="errorVal">{passwordValidation.message}</p>
              )}
              <input
                className={
                  confirmPasswordValidation.isValid
                    ? "forgot-input"
                    : "error-input"
                }
                type="password"
                value={confirmPassword}
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPasswordValidation.message && (
                <p className="errorVal">{confirmPasswordValidation.message}</p>
              )}
            </div>
            <button type="submit" className="forgot-submit-btn">
              {loading ? (
                <ClipLoader size={15} color="#fff" />
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
