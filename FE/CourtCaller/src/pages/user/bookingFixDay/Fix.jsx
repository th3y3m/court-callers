import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  Checkbox,
  Grid,
  Paper,
  ThemeProvider,
  createTheme,
  MenuItem  ,
} from "@mui/material";
import { MdOutlineLocalDrink } from "react-icons/md";
import pic1 from "assets/users/images/byday/pic1.webp";
import pic2 from "assets/users/images/byday/pic2.webp";
import pic3 from "assets/users/images/byday/pic3.webp";
import { FaWifi, FaMotorcycle, FaBowlFood } from "react-icons/fa6";
import { FaCar, FaStar } from "react-icons/fa";
import { RiDrinks2Fill } from "react-icons/ri";
import { IoLocationOutline } from "react-icons/io5";
import { CiEdit } from "react-icons/ci";
import CalendarView from "./CalendarView";
import { fetchPriceByBranchIDType } from "api/priceApi";
import { fetchBookingByUserId } from "api/bookingApi";
import api from "api/api";
import {
  fetchPercentRatingByBranch,
  fetchEachPercentRatingByBranch,
} from "api/reviewApi";
import DisplayMap from "map/DisplayMap";
import RequestLogin from "../requestUserLogin";
import RequestBooking from "../requestUserBooking";
import {
  fixMonthValidation,
  fixStartTimeValidation,
  fixEndTimeValidation,
  fixDayOfWeekValidation
} from "../Validations/bookingValidation";
import {
  reviewTextValidation,
  valueValidation,
} from "../Validations/reviewValidation";
import RequestForReviewing from "../requestForReviewing";

Modal.setAppElement("#root");

const theme = createTheme({
  palette: {
    primary: {
      main: "#009B65",
    },
    secondary: {
      main: "#f50057",
    },
  },
  typography: {
    h4: {
      fontFamily: "Roboto, sans-serif",
      fontWeight: 500,
    },
    body1: {
      fontFamily: "Roboto, sans-serif",
    },
  },
});

const calculateDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

const getOccurrencesOfDayInMonth = (year, month, day) => {
  let count = 0;
  const totalDays = calculateDaysInMonth(year, month);
  for (let date = 1; date <= totalDays; date++) {
    const dayOfWeek = new Date(year, month - 1, date).toLocaleDateString(
      "en-US",
      { weekday: "long" }
    );
    if (dayOfWeek === day) {
      count++;
    }
  }
  return count;
};

const getOccurrencesOfDayInPeriod = (startDate, totalDays, day) => {
  let count = 0;
  for (let i = 0; i < totalDays; i++) {
    const currentDay = new Date(startDate);
    currentDay.setDate(startDate.getDate() + i);
    const dayOfWeek = currentDay.toLocaleDateString('en-US', { weekday: 'long' });
    if (dayOfWeek === day) {
      count++;
    }
  }
  return count;
};

const getTotalDaysForWeekdays = (daysOfWeek, numberOfMonths, startDate) => {
  const totalDays = {};
  const daysInPeriod = numberOfMonths * 30;  // Tính tổng số ngày

  //array.forEach(function(currentValue, index, arr), thisValue)
  daysOfWeek.forEach(day => {
    totalDays[day] = getOccurrencesOfDayInPeriod(startDate, daysInPeriod, day);
  });

  return totalDays;
}; 

const FixedBooking = () => {
  const [numberOfMonths, setNumberOfMonths] = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [userId, setUserId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [slotStartTime, setSlotStartTime] = useState("");
  const [slotEndTime, setSlotEndTime] = useState("");
  const [fixedPrice, setFixedPrice] = useState(0);
  const [numberOfCourt, setNumberOfCourts] = useState("");
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null);
  const [highlightedStars, setHighlightedStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewFormVisible, setReviewFormVisible] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsVisible, setReviewsVisible] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { branch } = location.state;
  const [showLogin, setShowLogin] = useState(false); // State to manage visibility of RequestLogin component
  const [showRequestBooking, setShowRequestBooking] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(branch.branchId);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [AverageRating, setAverageRating] = useState(null);
  const [listRating, setListRating] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [monthValidation, setMonthValidation] = useState({
    isValid: true,
    message: "",
  });
  const [startTimeValidation, setStartTimeValidation] = useState({
    isValid: true,
    message: "",
  });
  const [endTimeValidation, setEndTimeValidation] = useState({
    isValid: true,
    message: "",
  });
  const [dayOfWeekValidation, setDayOfWeekValidation] = useState({
    isValid: true,
    message: "",
  });

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

  const handleStarClick = (value) => {
    setHighlightedStars(value);
  };

  const handleReviewTextChange = (event) => {
    setReviewText(event.target.value);
  };

  const handleSubmitReview = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLogin(true);
      return;
    }

    if (!userData || !userData.userId) {
      console.error("User data is not available");
      return;
    }

    const checkBooking = await fetchBookingByUserId(userData.userId);

    if (checkBooking.length == 0) {
      setShowRequestBooking(true);
      return;
    }

    const listBranchId = checkBooking.map((booking) => booking.branchId);
    if (!listBranchId.includes(selectedBranch)) {
      setShowRequestBooking(true);
      return;
    }

    const starValidation = valueValidation(highlightedStars);
    const remarkValidation = reviewTextValidation(reviewText);

    if (!starValidation.isValid || !remarkValidation.isValid) {
      setModalIsOpen(true);
      return;
    }

    try {
      if (!token) {
        throw new Error("No token found");
      }

      const reviewData = {
        reviewText,
        rating: highlightedStars,
        userId: userData.userId,
        branchId: branch.branchId, // Đảm bảo rằng branchId đang được cung cấp ở đây nếu cần
      };

      try {
        await api.post(
          "/Reviews",
          reviewData
        );
        setReviewFormVisible(false);
        // Xử lý sau khi gửi đánh giá thành công (ví dụ: thông báo cho người dùng, cập nhật danh sách đánh giá, v.v.)
      } catch (error) {
        console.error("Error submitting review", error);
        // Xử lý lỗi khi gửi đánh giá
      }
    } catch (error) {
      navigate("/login");
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleViewReviews = async () => {
    try {
      const response = await api.get(
        `/Reviews/GetReviewsByBranch/${selectedBranch}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const reviewsWithDetails = await Promise.all(
        response.data.map(async (review) => {
          console.log("review", review.id);
          let userFullName = "Unknown User";
          if (review.id) {
            try {
              const userDetailsResponse = await api.get(
                `/UserDetails/${review.id}`,
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
              userFullName = userDetailsResponse.data.fullName;
            } catch (userDetailsError) {
              console.error("Error fetching user details:", userDetailsError);
            }
          }
          return { ...review, userFullName };
        })
      );

      setReviews(reviewsWithDetails);
      setReviewsVisible(true);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  console.log("user", user);
  console.log("userData", userData);

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewText(review.reviewText);
    setHighlightedStars(review.rating);
  };

  const handleUpdateReview = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const updatedReviewData = {
        reviewText,
        rating: highlightedStars,
        userId: editingReview.id,
        branchId: editingReview.branchId,
      };

      console.log("editingReview", editingReview);

      const response = await api.put(
        `/Reviews/${editingReview.reviewId}`,
        updatedReviewData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const updatedReviews = reviews.map((review) =>
        review.id === editingReview.id ? response.data : review
      );
      setReviews(updatedReviews);
      setEditingReview(null);
      setReviewText("");
      setHighlightedStars(0);
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  useEffect(() => {
    const fetchBranchPrices = async () => {
      if (selectedBranch) {
        try {
          const price = await fetchPriceByBranchIDType(
            selectedBranch,
            "Fix",
            null
          );
          setFixedPrice(price);
        } catch (error) {
          console.error("Error fetching prices:", error);
        }
      }
    };

    fetchBranchPrices();
  }, [selectedBranch]);

  useEffect(() => {
    const fetchNumberOfCourts = async () => {
      try {
        const response = await fetch(
          `https://courtcaller.azurewebsites.net/numberOfCourt/${selectedBranch}`
        );
        const data = await response.json();
        setNumberOfCourts(data);
      } catch (err) {
        console.error(
          `Failed to fetch number of courts for branch ${selectedBranch}`
        );
      }
    };
    fetchNumberOfCourts();
  }, [selectedBranch]);

  const handleDayOfWeekChange = (event) => {
    const { value, checked } = event.target;
    setDaysOfWeek((prevDaysOfWeek) =>
      checked
        ? [...prevDaysOfWeek, value]
        : prevDaysOfWeek.filter((day) => day !== value)
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      setShowLogin(true);
      return;
    }

    const monthValidation = fixMonthValidation(numberOfMonths);
    const startTimeValidation = fixStartTimeValidation(slotStartTime);
    const endTimeValidation = fixEndTimeValidation(slotStartTime, slotEndTime);
    const dayOfWeekValidation = fixDayOfWeekValidation(daysOfWeek);
    setMonthValidation(monthValidation);
    setStartTimeValidation(startTimeValidation);
    setEndTimeValidation(endTimeValidation);
    setDayOfWeekValidation(dayOfWeekValidation);

    if (
      !monthValidation.isValid ||
      !startTimeValidation.isValid ||
      !endTimeValidation.isValid ||
      !dayOfWeekValidation.isValid
    ) {
      setMessage("Please try again");
      setMessageType("error");
      return;
    }

    const formattedStartDate = startDate.toISOString().split("T")[0];

    const totalDays = getTotalDaysForWeekdays(
      daysOfWeek,
      numberOfMonths,
      startDate
    );

    const totalPrice = daysOfWeek.reduce((total, day) => {
      return total + totalDays[day] * fixedPrice;
    }, 0);

    const bookingRequests = daysOfWeek.map((day) => ({
      slotDate: formattedStartDate,
      timeSlot: {
        slotStartTime,
        slotEndTime,
      },
      price: fixedPrice,
    }));

    const state = {
      branchId: selectedBranch,
      bookingRequests,
      totalPrice,
      userId: userData.userId, // Truyền cả userId
      email: user.email, // và email
      userName: user.userName,
      numberOfMonths,
      daysOfWeek,
      startDate: formattedStartDate,
      type: "fix",
      slotStartTime,
      slotEndTime,
    };

    console.log("state:", state);

    navigate("/fixed-payment", {
      state,
    });
  };

  //fetch rating tổng xong rồi đưa vào averageRating
  useEffect(() => {
    const fetchRating = async () => {
      try {
        console.log("selectedBranch của rating:", selectedBranch);
        const data = await fetchPercentRatingByBranch(selectedBranch);
        setAverageRating(data);
      } catch (error) {
        console.error("Error fetching rating", error);
      }
    };

    fetchRating();
  }, [selectedBranch]);

  //fetch rating nhỏ
  useEffect(() => {
    const fetchEachPercentRating = async () => {
      try {
        const data = await fetchEachPercentRatingByBranch(selectedBranch);
        console.log("data:", data);
        setListRating(data);
      } catch (error) {
        console.error("Error fetching rating", error);
      }
    };
    fetchEachPercentRating();
  }, [selectedBranch]);

  const handleStartTimeChange = (e) => {
    const value = e.target.value;
    const [hour] = value.split(':');
    setSlotStartTime(value);
  
    const startHour = parseInt(hour, 10);
    if (isNaN(startHour) || startHour < 0 || startHour > 23) {
      setStartTimeValidation({ message: 'Please select a valid hour (0-23).' });
      setSlotEndTime('');
    } else {
      setStartTimeValidation({ message: '' });
      const endHour = (startHour + 1) % 24;
      setSlotEndTime(`${endHour.toString().padStart(2, '0')}:00:00`);
    }
  };
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

  const pictures = JSON.parse(branch.branchPicture).slice(0, 5);

  return (
    <>
      <div style={{ backgroundColor: "#EAECEE" }}>
        <div className="header-container">
          <div className="brief-info">
            <h1>{branch.branchName}</h1>
            <p>
              <IoLocationOutline style={{ fontSize: 22 }} />{" "}
              {branch.branchAddress}
            </p>
            <p>{branch.description}</p>
          </div>

          <div className="header-info">
            <div className="branch-img">
              <div className="images">
                {pictures.map((picture, index) => (
                  <div key={index} className="inner-image">
                    <img src={picture} alt="img-fluid" />
                  </div>
                ))}
                <div className="inner-image">
                  <img src={pic1} alt="img-fluid" />
                </div>
                <div className="inner-image">
                  <img src={pic2} alt="img-fluid" />
                </div>
                <div className="inner-image">
                  <img src={pic3} alt="img-fluid" />
                </div>
              </div>
            </div>

            <div className="service">
              <div className="title">Branch Information</div>
              <div className="info">
                <div className="item">
                  <span>Open Time:</span>
                  <span style={{ fontWeight: 700 }}>{branch.openTime}</span>
                </div>
                <div className="item">
                  <span>Close Time:</span>
                  <span style={{ fontWeight: 700 }}>{branch.closeTime}</span>
                </div>
                <div className="item">
                  <span>Number of courts:</span>
                  <span style={{ fontWeight: 700 }}>{numberOfCourt}</span>
                </div>
                <div className="item">
                  <span>Price :</span>
                  <span style={{ fontWeight: 700 }}>{fixedPrice} VND</span>
                </div>
                <div className="item">
                  <span>Phone:</span>
                  <span style={{ fontWeight: 700 }}>{branch.branchPhone} </span>
                </div>
              </div>
              <div style={{marginTop: 60}} className="services-info">
                <div className="service-title">Convenient Service</div>
                <div className="service-list">
                  <span className="service-item">
                    <FaWifi className="icon" /> Wifi
                  </span>
                  <span className="service-item">
                    <FaMotorcycle className="icon" /> Motorbike Parking
                  </span>
                  <span className="service-item">
                    <FaCar className="icon" /> Car Parking
                  </span>
                  <span className="service-item">
                    <FaBowlFood className="icon" /> Food
                  </span>
                  <span className="service-item">
                    <RiDrinks2Fill className="icon" /> Drinks
                  </span>
                  <span className="service-item">
                    <MdOutlineLocalDrink className="icon" /> Free Ice Tea
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ThemeProvider theme={theme}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 4,
            }}
          >
            <Box sx={{ flex: 2, marginRight: 4 }}>
              <CalendarView
                selectedBranch={selectedBranch}
                setSelectedBranch={selectedBranch}
              />
            </Box>
            <Box sx={{ flex: 1, maxWidth: "400px", height: "100%" }}>
              <form onSubmit={handleSubmit}>
                <Paper
                  elevation={3}
                  sx={{ p: 3, borderRadius: 2, height: "100%" }}
                >
                  <Typography
                    variant="h4"
                    mb={2}
                    sx={{
                      textAlign: "center",
                      color: "primary.main",
                      fontWeight: "bold",
                    }}
                  >
                    Fixed Booking
                  </Typography>
                  <Grid container spacing={2}>
                    <>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <TextField
                            label="Number of Months"
                            type="number"
                            value={numberOfMonths}
                            onChange={(e) => setNumberOfMonths(e.target.value)}
                            required
                            InputLabelProps={{ style: { color: "black" } }}
                            InputProps={{ style: { color: "black" } }}
                            inputProps={{min: 1}}
                          />
                          {monthValidation.message && (
                            <p className="errorVal">
                              {monthValidation.message}
                            </p>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography sx={{ color: "black" }}>
                          Day of Week:
                        </Typography>
                        {[
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                          "Sunday",
                        ].map((day) => (
                          <FormControlLabel
                            key={day}
                            control={
                              <Checkbox
                                value={day}
                                onChange={handleDayOfWeekChange}
                                checked={daysOfWeek.includes(day)}
                                sx={{ color: "primary.main" }}
                              />
                            }
                            label={day}
                            sx={{ color: "black" }}
                          />
                        ))}
                        {dayOfWeekValidation.message && (
                            <p className="errorVal">
                              {dayOfWeekValidation.message}
                            </p>
                          )}
                      </Grid>
                      <Grid item xs={12}>
                        <Typography sx={{ color: "black" }}>
                          Start Date:
                        </Typography>
                        <DatePicker
                          selected={startDate}
                          onChange={(date) => setStartDate(date)}
                          dateFormat="yyyy-MM-dd"
                          required
                          popperPlacement="right-start"
                          minDate={new Date()}
                          customInput={<TextField sx={{ width: "100%" }} />}
                        />
                      </Grid>
                      <Grid item xs={12}>
                      <FormControl fullWidth>
          <TextField
            select
            label="Slot Start Time"
            value={slotStartTime}
            onChange={handleStartTimeChange}
            required
            InputLabelProps={{ style: { color: 'black' } }}
            InputProps={{ style: { color: 'black' } }}
          >
            {hours.map((hour) => (
              <MenuItem key={hour} value={`${hour}:00:00`}>
                {hour}:00:00
              </MenuItem>
            ))}
          </TextField>
          {startTimeValidation.message && (
            <p className="errorVal">
              {startTimeValidation.message}
            </p>
          )}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <TextField
            label="Slot End Time"
            type="text"
            value={slotEndTime}
            disabled
            InputLabelProps={{ style: { color: 'black' } }}
            InputProps={{ style: { color: 'black' } }}
          />
          {endTimeValidation.message && (
            <p className="errorVal">
              {endTimeValidation.message}
            </p>
          )}
        </FormControl>
      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          color="primary"
                          type="submit"
                          fullWidth
                        >
                          Continue
                        </Button>
                      </Grid>
                    </>
                    {/* )} */}
                  </Grid>
                </Paper>
              </form>
            </Box>
          </Box>
        </ThemeProvider>

        {/* Map */}
        <div className="map-section">
          <div className="map-form">
            <div className="map-header">
              <h2 className="map-title">Branch Location</h2>
              <p className="map-address">{branch.branchAddress}</p>
            </div>
            <div className="map-container">
              <div className="map-wrapper">
                <div className="map-overlay">
                  <div className="map-legend">
                    <div className="map-legend-icon"></div>
                    <span>Branch Location</span>
                  </div>
                </div>
                <DisplayMap address={branch.branchAddress} />
              </div>
            </div>
          </div>
        </div>
        {/* Rating form */}
        <div className="rating-form">
          <div className="rating-container">
            <h2>Rating this Branch</h2>
            <div className="average-rating">
              <div className="average-score">
                <span className="score">
                  {Math.round(AverageRating * 10) / 10}
                </span>
                <span className="star">★</span>
              </div>
              <div>
                <button
                  className="rating-button"
                  style={{ marginRight: 15 }}
                  onClick={() => setReviewFormVisible(true)}
                >
                  Reviews and Comments
                </button>
                <button className="rating-button" onClick={handleViewReviews}>
                  Viewing reviews
                </button>
              </div>
            </div>
            <div className="rating-bars">
              <div className="rating-bar">
                <span className="stars">★★★★★</span>
                <div className="bar">
                  <div
                    className="fill"
                    style={{ width: `${listRating[4]}%` }}
                  ></div>
                </div>
                {/* làm tròn đơn vị math round được chưa nhân*/}
                <span className="percentage">{Math.round(listRating[4])}%</span>
              </div>
              <div className="rating-bar">
                <span className="stars">★★★★☆</span>
                <div className="bar">
                  <div
                    className="fill"
                    style={{ width: `${listRating[3]}%` }}
                  ></div>
                </div>
                <span className="percentage">{Math.round(listRating[3])}%</span>
              </div>
              <div className="rating-bar">
                <span className="stars">★★★☆☆</span>
                <div className="bar">
                  <div
                    className="fill"
                    style={{ width: `${listRating[2]}%` }}
                  ></div>
                </div>
                <span className="percentage">{Math.round(listRating[2])}%</span>
              </div>
              <div className="rating-bar">
                <span className="stars">★★☆☆☆</span>
                <div className="bar">
                  <div
                    className="fill"
                    style={{ width: `${listRating[1]}%` }}
                  ></div>
                </div>
                <span className="percentage">{Math.round(listRating[1])}%</span>
              </div>
              <div className="rating-bar">
                <span className="stars">★☆☆☆☆</span>
                <div className="bar">
                  <div
                    className="fill"
                    style={{ width: `${listRating[0]}%` }}
                  ></div>
                </div>
                <span className="percentage">{Math.round(listRating[0])}%</span>
              </div>
            </div>
            {reviewFormVisible && (
              <div id="review-form">
                <h2>Tell us your experience</h2>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <span
                      key={value}
                      className={`rating-star ${
                        highlightedStars >= value ? "highlight" : ""
                      }`}
                      data-value={value}
                      onClick={() => handleStarClick(value)}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div className="rating-review">
                  <textarea
                    placeholder="Remarking this branch here...."
                    value={reviewText}
                    onChange={handleReviewTextChange}
                  ></textarea>
                </div>
                <button className="submit-rating" onClick={handleSubmitReview}>
                  Send Rating
                </button>
              </div>
            )}
            {reviewsVisible && (
              <>
                <div
                  className="reviews-popup-overlay"
                  onClick={() => setReviewsVisible(false)}
                ></div>
                <div className="reviews-popup">
                  <div className="reviewing-title">
                    <h2>All Reviews</h2>
                  </div>
                  <div className="close-btn">
                    <button
                      className="rating-button"
                      onClick={() => setReviewsVisible(false)}
                    >
                      Close
                    </button>
                  </div>
                  <div
                    className="reviews-container"
                    style={{ maxHeight: "300px", overflowY: "scroll" }}
                  >
                    {reviews.map((review, index) => (
                      <div key={index} className="review">
                        <div className="review-header">
                          <div className="name-rating">
                            <span className="review-author">
                              {review.userFullName}
                            </span>
                            <span className="review-rating">
                              {review.rating}
                            </span>
                            <FaStar style={{ color: "gold" }} />
                          </div>
                          {userData && review.id === userData.userId && (
                            <CiEdit
                              style={{
                                marginRight: "10px",
                                fontSize: "23px",
                                fontWeight: "bold",
                              }}
                              onClick={() => handleEditReview(review)}
                            />
                          )}
                        </div>
                        {editingReview?.id === review.id ? (
                          <div className="review-body">
                            <div className="star-rating">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <span
                                  key={value}
                                  className={`rating-star ${
                                    highlightedStars >= value ? "highlight" : ""
                                  }`}
                                  data-value={value}
                                  onClick={() => handleStarClick(value)}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <textarea
                              value={reviewText}
                              onChange={handleReviewTextChange}
                            />
                            <button
                              style={{ marginRight: "10px" }}
                              className="submit-rating"
                              onClick={handleUpdateReview}
                            >
                              Update
                            </button>
                            <button
                              className="submit-rating"
                              onClick={() => setEditingReview(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="review-body">
                            <p>{review.reviewText}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {showLogin && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <RequestLogin />
          </Box>
        )}

        {/* Booking request */}
        {showRequestBooking && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <RequestBooking />
          </Box>
        )}

        {/* Review request */}
        {modalIsOpen && (
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            className="review-modal"
            overlayClassName="review-modal-overlay"
          >
            <RequestForReviewing />
          </Modal>
        )}
      </div>
    </>
  );
};

export default FixedBooking;
