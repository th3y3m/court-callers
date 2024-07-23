import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./loginTest.css";
import { loginApi } from "../../api/usersApi";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const container = document.getElementById("container");
    const loginBtn = document.getElementById("login");

    const removeActiveClass = () => container.classList.remove("active");

    if (loginBtn) {
      loginBtn.addEventListener("click", removeActiveClass);
    }

    return () => {
      if (loginBtn) {
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
      console.log(res); // Log response from API

      if (res && res.token) {
        localStorage.setItem("token", res.token);

        // Decode token to get role
        const decodedToken = JSON.parse(atob(res.token.split('.')[1]));
        const userRole = decodedToken.role;
        localStorage.setItem("userRole", userRole);

        // Debugging logs
        console.log("Token:", res.token);
        console.log("Role:", userRole);


        // Navigate based on user role
        if (userRole === 'Admin') {
        toast.success("Login successful!");
          navigate("/admin/Users");
        } else if (userRole === 'Staff') {
          toast.success("Login successful!");
          navigate("/Users");
        } else {
          navigate("/login");
          toast.error("Unauthorized role");
        }
      } else if (res && res.status === 401) {
        toast.error(res.error || "Unauthorized");
        setMessage("Login failed!");
        setMessageType("error");
      } else {
        toast.error("Login failed!");
        setMessage("Login failed!");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Login error: ", error); // Log detailed error
      toast.error("Login failed!");
      setMessage("Login failed!");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-pass");
  }

  return (
    <div className="login-component">
      <div className="container" id="container">
        <form onSubmit={handleLogin}>
          <h1 className="login_register">LOG IN</h1>
          <span>or use your account for login</span>
          <input
            type="text"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <a href="/forgot-pass">Forgot Password</a>
          <button type="submit" className="signInBtn" style={{ marginTop: "15px" }}>
            {loading && <ClipLoader width={25} size={25} color="#fff" />}
            {!loading && "Sign In"}
          </button>
          {message && (
            <p className={messageType === "error" ? "error-message" : ""}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
