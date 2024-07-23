import { memo, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { FaRegCalendarCheck } from "react-icons/fa";
import { GiShuttlecock } from "react-icons/gi";
import { fetchQrcode } from "api/bookingApi";
import BeatLoader from "react-spinners/BeatLoader";
import "./style.scss";
import api from "api/api";

const BookedPage = () => {
  const [bookings, setBookings] = useState([]);
  const [overdueBookings, setOverdueBookings] = useState([]);
  const [canceledBookings, setCanceledBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [slotInfo, setSlotInfo] = useState([]);
  const [branchInfo, setBranchInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingIdToCancel, setBookingIdToCancel] = useState(null);
  const [qrcode, setQrcode] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const decoded = jwtDecode(token);

      const fetchUserData = async (id, isGoogle) => {
        try {
          if (isGoogle) {
            const response = await api.get(`/UserDetails/GetUserDetailByUserEmail/${id}`);
            setUserData(response.data);
            const userResponse = await api.get(`/Users/GetUserDetailByUserEmail/${id}?searchValue=${id}`);
            setUser(userResponse.data);
          } else {
            const response = await api.get(`/UserDetails/${id}`);
            setUserData(response.data);
            const userResponse = await api.get(`/Users/${id}`);
            setUser(userResponse.data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      if (decoded.iss !== "https://accounts.google.com") {
        const userId = decoded.Id;
        setUserId(userId);
        fetchUserData(userId, false);
      } else {
        const userId = decoded.email;
        setUserId(userId);
        fetchUserData(userId, true);
      }
    }
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!userData || !userData.userId) return;

      try {
        const bookingsResponse = await api.get(
          `/Bookings/userId/${userData.userId}`
        );
        const allBookings = bookingsResponse.data;

        const filteredBookings = await Promise.all(
          allBookings.map(async (booking) => {
            try {
              const paymentResponse = await api.get(
                `/Payments/bookingid/${booking.bookingId}`
              );
              if (paymentResponse.data.paymentMessage === "Complete")
                return booking;
            } catch (paymentError) {
              console.error(
                `Error fetching payment data for booking ID ${booking.bookingId}:`,
                paymentError
              );
            }
            return null;
          })
        );

        const validBookings = filteredBookings.filter(
          (booking) => booking !== null
        );

        const currentDate = new Date().getDate();
        const scheduledBookings = [];
        const overdueBookingsList = [];
        const canceledBookingsList = [];

        await Promise.all(
          validBookings.map(async (booking) => {
            const slotResponse = await api.get(
              `/TimeSlots/bookingId/${booking.bookingId}`
            );
            const slots = slotResponse.data;

            const isOverdue = slots.every(
              (slot) => new Date(slot.slotDate) < currentDate
            );

            if (booking.status === "Canceled") {
              canceledBookingsList.push(booking);
            } else if (isOverdue) {
              overdueBookingsList.push(booking);
            } else {
              scheduledBookings.push(booking);
            }
          })
        );

        setBookings(scheduledBookings);
        setOverdueBookings(overdueBookingsList);
        setCanceledBookings(canceledBookingsList);
      } catch (error) {
        console.error("Error fetching bookings data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userData]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day < 10 ? `0${day}` : day}/${
      month < 10 ? `0${month}` : month
    }/${year}`;
  };

  const handleCancelBooking = async () => {
    try {
      await api.delete(
        `/Bookings/cancel/${bookingIdToCancel}`
      );
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.bookingId === bookingIdToCancel
            ? { ...booking, status: "Canceled" }
            : booking
        )
      );
      setShowCancelModal(false);
    } catch (error) {
      console.error(`Error canceling booking ID ${bookingIdToCancel}:`, error);
    }
  };

  const handleViewBooking = async (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);

    try {
      setQrcode(await fetchQrcode(booking.bookingId));
      const slotResponse = await api.get(
        `/TimeSlots/bookingId/${booking.bookingId}`
      );
      console.log("Slot Response:", slotResponse.data);
      setSlotInfo(
        slotResponse.data.sort((a, b) => {
          const dateA = new Date(a.slotDate);
          const dateB = new Date(b.slotDate);
          if (dateA < dateB) return -1;
          if (dateA > dateB) return 1;
          const timeA = new Date(`1970-01-01T${a.slotStartTime}`);
          const timeB = new Date(`1970-01-01T${b.slotStartTime}`);
          return timeA - timeB;
        })
      );

      const branchResponse = await api.get(
        `/Branches/${booking.branchId}`
      );
      console.log("Branch Response:", branchResponse.data);
      setBranchInfo(branchResponse.data);
    } catch (error) {
      console.error("Error fetching slot or branch data:", error);
    }
  };

  console.log("slotinfo", slotInfo);

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
    setSlotInfo([]);
    setBranchInfo(null);
  };

  const handleCancelClick = (bookingId) => {
    setBookingIdToCancel(bookingId);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setBookingIdToCancel(null);
  };

  return (
    <div style={{ backgroundColor: "#EAECEE" }}>
      <div className="container">
        <div className="hero_banner_container">
          <div className="hero_banner">
            <div className="hero_text">
              <span>WELCOME TO</span>
              <h2>
                COURT CALLER
                <br />
                HAVE FUN
              </h2>
            </div>
          </div>
        </div>
      </div>
      <div className="booked-title">
        <h1 className="btn-shine">BOOKED PAGE</h1>
      </div>
      {loading ? (
        <BeatLoader
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          size={40}
          color="#36D7B7"
        />
      ) : (
        <div style={{ height: "100%" }}>
          <main>
            <h2 style={{ color: "#2ecc71", fontStyle: "italic" }}>
              Upcoming Schedule
            </h2>
            <div
              style={{
                overflowY: "scroll",
                maxHeight: "200px",
                border: "solid #2ecc71",
                marginBottom: 40,
              }}
            >
              <table className="upcoming-booking">
                <thead>
                  <tr>
                    <th>BookingID</th>
                    <th>Date</th>
                    <th>Number of slots</th>
                    <th>Booking Type</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Details</th>
                    <th>Cancel</th>
                  </tr>
                </thead>
                {bookings.length > 0 ? (
                  bookings.map((booked, index) => (
                    <tbody key={index}>
                      <tr>
                        <td>{booked.bookingId}</td>
                        <td>{formatDate(booked.bookingDate)}</td>
                        <td>{booked.numberOfSlot}</td>
                        <td>{booked.bookingType}</td>
                        <td>{booked.totalPrice}K VND</td>
                        <td>{booked.status}</td>
                        <td>
                          {booked.status !== "Canceled" && (
                            <button
                              className="view-button"
                              onClick={() => handleViewBooking(booked)}
                            >
                              View
                            </button>
                          )}
                        </td>
                        <td>
                          {booked.status !== "Canceled" && (
                            <button
                              className="cancel-button"
                              onClick={() =>
                                handleCancelClick(booked.bookingId)
                              }
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  ))
                ) : (
                  <tbody>
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center" }}>
                        No upcoming bookings found
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
            <h2 style={{ color: "#2ecc71", fontStyle: "italic", color: "red" }}>
              Overdue Bookings
            </h2>
            <div
              style={{
                overflowY: "scroll",
                maxHeight: "200px",
                border: "solid red",
                marginBottom: 40,
              }}
            >
              <table className="overdue-booking">
                <thead>
                  <tr>
                    <th>BookingID</th>
                    <th>Date</th>
                    <th>Number of slots</th>
                    <th>Booking Type</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                {overdueBookings.length > 0 ? (
                  overdueBookings.map((booked, index) => (
                    <tbody key={index}>
                      <tr>
                        <td>{booked.bookingId}</td>
                        <td>{formatDate(booked.bookingDate)}</td>
                        <td>{booked.numberOfSlot}</td>
                        <td>{booked.bookingType}</td>
                        <td>{booked.totalPrice} VND</td>
                        <td>{booked.status}</td>
                        <td>
                          {booked.status !== "Canceled" && (
                            <button
                              className="view-button"
                              onClick={() => handleViewBooking(booked)}
                            >
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  ))
                ) : (
                  <tbody>
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center" }}>
                        No overdue bookings found
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
            <h2 style={{ color: "#DC7633", fontStyle: "italic" }}>
              Canceled Bookings
            </h2>
            <div
              style={{
                overflowY: "scroll",
                maxHeight: "200px",
                border: "solid #DC7633",
                marginBottom: 40,
              }}
            >
              <table className="canceled-booking">
                <thead>
                  <tr>
                    <th>BookingID</th>
                    <th>Date</th>
                    <th>Number of slots</th>
                    <th>Booking Type</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                {canceledBookings.length > 0 ? (
                  canceledBookings.map((booked, index) => (
                    <tbody key={index}>
                      <tr>
                        <td>{booked.bookingId}</td>
                        <td>{formatDate(booked.bookingDate)}</td>
                        <td>{booked.numberOfSlot}</td>
                        <td>{booked.bookingType}</td>
                        <td>{booked.totalPrice} VND</td>
                        <td>{booked.status}</td>
                      </tr>
                    </tbody>
                  ))
                ) : (
                  <tbody>
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center" }}>
                        No canceled bookings found
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
          </main>
        </div>
      )}

      {showModal && selectedBooking && (
        <div className="modal-container">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <div style={{ marginRight: 30 }}>
              <div className="slot-view">
                <h2>
                  Slot Information{" "}
                  <FaRegCalendarCheck
                    style={{ color: "blue", verticalAlign: -3 }}
                  />
                </h2>
                <div style={{ maxHeight: "200px", overflowY: "scroll" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>CourtID</th>
                        <th>Slot Date</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                      </tr>
                    </thead>
                    {slotInfo.length > 0 ? (
                      slotInfo.map((slot, index) => (
                        <tbody key={index}>
                          <tr>
                            <td>{slot.courtId}</td>
                            <td>{formatDate(slot.slotDate)}</td>
                            <td>{slot.slotStartTime}</td>
                            <td>{slot.slotEndTime}</td>
                          </tr>
                        </tbody>
                      ))
                    ) : (
                      <tbody>
                        <tr>
                          <td colSpan="4" style={{ textAlign: "center" }}>
                            No slot information available
                          </td>
                        </tr>
                      </tbody>
                    )}
                  </table>
                </div>
              </div>
              <div className="branch-view">
                <h2>
                  Branch Information{" "}
                  <GiShuttlecock
                    style={{ fontSize: 25, color: "green", verticalAlign: -3 }}
                  />
                </h2>
                {branchInfo ? (
                  <>
                    <div className="branch-detail">
                      <p className="branch-field">Name: </p>
                      <p className="branch-info">{branchInfo.branchName}</p>
                    </div>
                    <div className="branch-detail">
                      <p className="branch-field">Address: </p>
                      <p className="branch-info">{branchInfo.branchAddress}</p>
                    </div>
                    <div className="branch-detail">
                      <p className="branch-field">Phone: </p>
                      <p className="branch-info">{branchInfo.branchPhone}</p>
                    </div>
                    <div className="branch-detail">
                      <p className="branch-field">Status: </p>
                      <p className="branch-info">{branchInfo.status}</p>
                    </div>
                  </>
                ) : (
                  <p>No branch information available</p>
                )}
              </div>
            </div>

            <div className="user-qr-checking">
              <div className="user-qr">
                <div
                  className="qr-placeholder"
                  style={{
                    margin: "5px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={`data:image/png;base64,${qrcode}`}
                    alt="QR Code"
                    style={{ width: "300px", height: "310px" }}
                  />
                </div>
                <p style={{ marginTop: "6px" }}>QR Code for Checking In</p>
                <p style={{ margin: "10px 0", color: "#00c853" }}>Checked in</p>
              </div>
              <div className="reschedule-prompt">
                <p>
                  *If you want to reschedule, please contact to our staffs via <strong> courtcaller@gmail.com</strong> or via hotline <strong> 0332748325</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="cancel-confirm-container">
          <div className="card">
            <div className="cancel-header">
              <div className="cancel-image">
                <svg
                  aria-hidden="true"
                  stroke="currentColor"
                  stroke-width="1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    stroke-linejoin="round"
                    stroke-linecap="round"
                  ></path>
                </svg>
              </div>
              <div className="cancel-content">
                <span className="cancel-title">Cancel Booking</span>
                <p className="cancel-message">
                  Are you sure you want to cancel your booking? Your balance
                  will only be refunded half. However, your membership points
                  remain the same. This action cannot be undone.
                </p>
              </div>
              <div className="cancel-actions">
                <button
                  className="cancel-desactivate"
                  type="button"
                  style={{ cursor: "pointer" }}
                  onClick={handleCancelBooking}
                >
                  YES
                </button>
                <button
                  className="cancel-button2"
                  type="button"
                  style={{ cursor: "pointer" }}
                  onClick={closeCancelModal}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(BookedPage);
