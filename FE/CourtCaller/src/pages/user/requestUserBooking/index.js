import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

const RequestBooking = () => {
  return(
    <div className="notifications-container">
        <div className="success">
          <div className="flex">
            <div className="flex-shrink-0">
                <svg className="succes-svg" aria-hidden="true" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" stroke-linejoin="round" stroke-linecap="round"></path>
                </svg>
            </div>
            <div className="success-prompt-wrap">
              <p className="success-prompt-heading">Request Booking!
              </p><div className="success-prompt-prompt">
                <p style={{margin: 0}}>You need to book first or already have booking(s) in this branch in order to make a review.</p>
              </div>
                <div className="success-button-container">
                  <Link to="/booked"><button type="button" className="success-button-main">View history</button></Link>
                </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default RequestBooking;