import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

const RequestLogin = () => {
  return (
    <div className="requestCard">
      <p className="requestHeading">Login Request.</p>
      <p className="requestDescription">
        You haven't signed in yet. Please log in to fully experience our application. Thanks a lot.
      </p>
      <Link style={{textDecoration: "none"}} to="/login"><button className="acceptButton">Login</button></Link>
    </div>
  );
};

export default RequestLogin;
