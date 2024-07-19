import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./loginTest.scss";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { loginApi } from "api/usersApi";
import {
  validateFullName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "../Validations/formValidation";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleLogin } from "@react-oauth/google";
import ClipLoader from "react-spinners/ClipLoader";
import { ROUTERS } from "utils/router";
import { FacebookAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "firebase.js";
import { useAuth } from "AuthContext.js";
import { jwtDecode } from "jwt-decode";
import { fetchUserById, fetchRoleByUserId } from "api/userApi";

const Login = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const [fullNameValidation, setFullNameValidation] = useState({
    isValid: true,
    message: "",
  });
  const [emailValidation, setEmailValidation] = useState({
    isValid: true,
    message: "",
  });
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: true,
    message: "",
  });
  const [confirmPasswordValidation, setConfirmPasswordValidation] = useState({
    isValid: true,
    message: "",
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const container = document.getElementById("container");
    const registerBtn = document.getElementById("register");
    const loginBtn = document.getElementById("login");

    const addActiveClass = () => container.classList.add("active");
    const removeActiveClass = () => container.classList.remove("active");

    if (registerBtn && loginBtn) {
      registerBtn.addEventListener("click", addActiveClass);
      loginBtn.addEventListener("click", removeActiveClass);
    }

    return () => {
      if (registerBtn && loginBtn) {
        registerBtn.removeEventListener("click", addActiveClass);
        loginBtn.removeEventListener("click", removeActiveClass);
      }
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email/Password is required!");
      return;
    }

    setLoading(true);
    try {
      const res = await loginApi(email, password);
      if (res && res.token) {
        localStorage.setItem("token", res.token);
        console.log('token: ', res.token)
        var decode = jwtDecode(res.token);
        localStorage.setItem("userRole", decode.role);
        const userData = {
          email: decode.email,
          role: decode.role
        };
        login(userData); // Lưu thông tin người dùng vào context
        navigate(ROUTERS.USER.HOME); 
      } else if (res && res.status === 401) {
        //toast.error(res.error);
        setMessage("Login failed!");
        setMessageType("error");
      } else if(res && res.data.status === "Error" && res.data.message == "User is banned!"){
        toast.error('This account is banned!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          });
          return;
      } 
    } catch (error) {
      //toast.error("Login failed!");
      setMessage("Login failed!");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const fullNameValidation = validateFullName(fullName);
    const emailValidation = await validateEmail(email);
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validateConfirmPassword(
      password,
      confirmPassword
    );

    setFullNameValidation(fullNameValidation);
    setEmailValidation(emailValidation);
    setPasswordValidation(passwordValidation);
    setConfirmPasswordValidation(confirmPasswordValidation);

    if (
      !fullNameValidation.isValid ||
      !emailValidation.isValid ||
      !passwordValidation.isValid ||
      !confirmPasswordValidation.isValid
    ) {
      setMessage("Please try again");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://courtcaller.azurewebsites.net/api/authentication/register",
        {
          fullName: fullName,
          email: email,
          password: password,
          confirmPassword: confirmPassword,
        }
      );
      toast.success("Registration successful!");
      setMessage("SIGN UP SUCCESSFULLY - LOG IN NOW");
      setMessageType("success");
      setIsLogin(true);
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || "Registration failed");
      } else if (error.request) {
        toast.error("No response from server");
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginGoogle = async (response) => {
    var token = response.credential; // Token này là một phần của response trả về từ Google sau khi đăng nhập thành công
    console.log("Google Token:", token);

    try {
      const res = await fetch(
        "https://courtcaller.azurewebsites.net/api/authentication/google-login?token=" +
          token,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        // console.log("Login successful:", data);
        localStorage.setItem("token", data.token);
        localStorage.setItem("ggToken", token)
        var decode = jwtDecode(data.token);
        localStorage.setItem("userRole", decode.role);
        const userData = {
          email: decode.email,
          role: decode.role
        };
        login(userData); // Lưu thông tin người dùng vào context
        // toast.success("Login Successfully");
        navigate(ROUTERS.USER.HOME);
      } else {
        console.error("Backend error:", data);
        toast.error("Login Failed");
        throw new Error(data.message || "Google login failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Login Failed");
    }
  };

  const loginFacebook = async (response) => {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const accessToken = result.user.stsTokenManager.accessToken;

      console.log("Login successfully", result.user);
      console.log("Access Token:", accessToken);

      const res = await fetch(
        "https://courtcaller.azurewebsites.net/api/authentication/facebook-login?token=" +
          accessToken,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        console.log("Login successful:", data);
        localStorage.setItem("token", accessToken);
        var decode = jwtDecode(accessToken);

        const userData = {
          email: decode.email,
        };
        login(userData); // Lưu thông tin người dùng vào context
        // toast.success("Login Successfully");
        navigate(ROUTERS.USER.HOME);
      } else {
        console.error("Backend error:", data);
        toast.error("Login Failed");
      }
    } catch (error) {
      console.error("Error:", error.message);
      toast.error("Facebook login failed");
    }
  };

  return (
    <div className="login-component">
      <div className={`container ${!isLogin ? "active" : ""}`} id="container">
        {isLogin ? (
          <div className="form-container sign-in">
            <form onSubmit={handleLogin}>
              <h1>LOG IN</h1>
              <div className="social-icons">
                <GoogleLogin
                  onSuccess={loginGoogle}
                  onError={() => {
                    console.log("Login Failed");
                    toast.error("Google login failed");
                  }}
                />
                <a
                  onClick={loginFacebook}
                  className="icon"
                  style={{ color: "white" }}
                >
                  <FaFacebookF />{" "}
                  <span style={{ marginLeft: 5 }}> With Facebook</span>
                </a>
              </div>
              <span>or use your account for login</span>
              <input
                type="text"
                value={email}
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                required
                className={emailValidation.isValid ? "" : "error-input"}
              />
              {emailValidation.message && (
                <p className="errorVal">{emailValidation.message}</p>
              )}
              <input
                type="password"
                value={password}
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                required
                className={passwordValidation.isValid ? "" : "error-input"}
              />
              {passwordValidation.message && (
                <p className="errorVal">{passwordValidation.message}</p>
              )}
              <a><Link to="/forget-password">Forgot Password</Link></a>
              <button type="submit" className="signInBtn" disabled={loading}>
                {loading ? <ClipLoader size={15} color="#fff" /> : "Sign In"}
              </button>
              {message && (
                <p className={messageType === "error" ? "error-message" : ""}>
                  {message}
                </p>
              )}
            </form>
          </div>
        ) : (
          <div className="form-container sign-up">
            <form onSubmit={handleRegister}>
              <h1>Create Account</h1>
              <span>or use your email for registration</span>
              <input
                type="text"
                value={fullName}
                placeholder="FullName"
                onChange={(e) => setFullName(e.target.value)}
                required
                className={fullNameValidation.isValid ? "" : "error-input"}
              />
              {fullNameValidation.message && (
                <p className="errorVal">{fullNameValidation.message}</p>
              )}
              <input
                type="text"
                value={email}
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                required
                className={emailValidation.isValid ? "" : "error-input"}
              />
              {emailValidation.message && (
                <p className="errorVal">{emailValidation.message}</p>
              )}
              <input
                type="password"
                value={password}
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                required
                className={passwordValidation.isValid ? "" : "error-input"}
              />
              {passwordValidation.message && (
                <p className="errorVal">{passwordValidation.message}</p>
              )}
              <input
                type="password"
                value={confirmPassword}
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={
                  confirmPasswordValidation.isValid ? "" : "error-input"
                }
              />
              {confirmPasswordValidation.message && (
                <p className="errorVal">{confirmPasswordValidation.message}</p>
              )}
              <button type="submit" className="signUpBtn" disabled={loading}>
                {loading ? <ClipLoader size={15} color="#fff" /> : "Sign Up"}
              </button>
              {message && (
                <p className={messageType === "error" ? "error-message" : ""}>
                  {message}
                </p>
              )}
            </form>
          </div>
        )}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>badminton is joy</h1>
              <p>Enter your userFullName password to schedule now!!</p>
              <button
                className="hidden"
                id="login"
                onClick={() => setIsLogin(true)}
              >
                Sign In
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>badminton is life</h1>
              <p>
                Register with your personal details to use all of the site
                features!!
              </p>
              <button
                className="hidden"
                id="register"
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;