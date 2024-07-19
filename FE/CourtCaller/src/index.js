import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import RouterCustom from "./router";
import "./style/style.scss";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./AuthContext";
import { ToastContainer } from "react-toastify";
// import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
    {/* Same as */}
    <ToastContainer />

    <BrowserRouter>
      <GoogleOAuthProvider clientId="1067794504090-5uaclt9g715islhrped711o814um4e7b.apps.googleusercontent.com">
        <AuthProvider>
          <RouterCustom />
        </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </>
);
