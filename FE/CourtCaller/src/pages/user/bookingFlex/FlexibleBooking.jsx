import React, { useState, useEffect ,useRef } from "react";
import Modal from "react-modal";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import pic1 from "assets/users/images/byday/pic1.webp";
import pic2 from "assets/users/images/byday/pic2.webp";
import pic3 from "assets/users/images/byday/pic3.webp";
import { MdOutlineLocalDrink } from "react-icons/md";
import { FaWifi, FaMotorcycle, FaBowlFood } from "react-icons/fa6";
import { FaCar, FaStar } from "react-icons/fa";
import { RiDrinks2Fill } from "react-icons/ri";
import { IoLocationOutline } from "react-icons/io5";
import { CiEdit } from "react-icons/ci";
import { Box, Button, Grid, Typography, IconButton } from "@mui/material";
import { fetchBranchById } from "api/branchApi";
import { fetchBookingByUserId } from "api/bookingApi";
import api from "api/api";
import dayjs from "dayjs";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import DisplayMap from "map/DisplayMap";
import RequestBooking from "../requestUserBooking";
import { HubConnectionBuilder, HttpTransportType, LogLevel } from '@microsoft/signalr';
import * as signalR from '@microsoft/signalr';
import { fetchUnavailableSlots } from '../../../api/timeSlotApi';
import {
  fetchEachPercentRatingByBranch,
  fetchPercentRatingByBranch,
} from "api/reviewApi";

import {
  reviewTextValidation,
  valueValidation,
} from "../Validations/reviewValidation";
import RequestForReviewing from "../requestForReviewing";

Modal.setAppElement("#root");

dayjs.extend(isSameOrBefore);

const dayToNumber = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

const parseOpenDay = (openDay) => {
  if (!openDay || typeof openDay !== "string") {
    console.error("Invalid openDay:", openDay);
    return [0, 0];
  }
  const days = openDay.split(" to ");
  if (days.length !== 2) {
    console.error("Invalid openDay format:", openDay);
    return [0, 0];
  }
  const [startDay, endDay] = days;
  return [dayToNumber[startDay], dayToNumber[endDay]];
};

const getDaysOfWeek = (startOfWeek, openDay) => {
  let days = [];
  const [startDay, endDay] = parseOpenDay(openDay);
  if (startDay === 0 || endDay === 0) {
    console.error("Invalid days parsed:", { startDay, endDay });
    return days;
  }

  for (var i = startDay; i <= endDay; i++) {
    days.push(dayjs(startOfWeek).add(i, "day"));
  }

  return days;
};

const generateTimeSlots = (openTime, closeTime) => {
  let slots = [];
  for (let hour = openTime; hour < closeTime; hour++) {
    const start = formatTime(hour);
    const end = formatTime(hour + 1);
    slots.push(`${start} - ${end}`);
  }
  return slots;
};

const formatTime = (time) => {
  const hours = Math.floor(time);
  const minutes = Math.round((time - hours) * 60);
  const formattedHours = hours < 10 ? `0${hours}` : hours;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes}`;
};

const timeStringToDecimal = (timeString) => {
  const date = new Date(`1970-01-01T${timeString}Z`);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  return hours + minutes / 60 + seconds / 3600;
};

const FlexibleBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    email,
    numberOfSlot,
    branchId,
    userName,
    userId,
    availableSlot,
    bookingId,
    branchResponse,
  } = location.state;

  const [branch, setBranch] = useState(null);
  const [startOfWeek, setStartOfWeek] = useState(dayjs().startOf("week"));
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [weekDays, setWeekDays] = useState([]);
  const [morningTimeSlots, setMorningTimeSlots] = useState([]);
  const [afternoonTimeSlots, setAfternoonTimeSlots] = useState([]);

  const [showAfternoon, setShowAfternoon] = useState(false);
  const currentDate = dayjs();
  const [weekdayPrice, setWeekdayPrice] = useState(0);
  const [weekendPrice, setWeekendPrice] = useState(0);
  const [numberOfCourt, setNumberOfCourts] = useState("");
  const [unavailableSlots, setUnavailableSlot] = useState([]);
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [highlightedStars, setHighlightedStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewFormVisible, setReviewFormVisible] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsVisible, setReviewsVisible] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [showRequestBooking, setShowRequestBooking] = useState(false);
  const [AverageRating, setAverageRating] = useState(null);
  const [listRating, setListRating] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newWeekStart, setNewWeekStart] =  useState(dayjs().startOf('week'));
  const [selectedBranch, setSelectedBranch] = useState('');
  const [loading, setLoading] = useState(false);
  //khai signalR
  
  const [isConnected, setIsConnected] = useState(false);
  const [connection, setConnection] = useState(null);
  const newWeekStartRef = useRef(newWeekStart);
  
  const selectBranchRef = useRef(selectedBranch);
  useEffect(() => {
    selectBranchRef.current = selectedBranch;
  }, [selectedBranch]);


  //phần signalR
  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
        .withUrl("https://courtcaller.azurewebsites.net/timeslothub", {
          transport: signalR.HttpTransportType.ServerSentEvents 
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information) 
        .build();
  
    newConnection.onreconnecting((error) => {
        console.log(`Connection lost due to error "${error}". Reconnecting.`);
        setIsConnected(false);
    });
  
    newConnection.onreconnected((connectionId) => {
        console.log(`Connection reestablished. Connected with connectionId "${connectionId}".`);
        setIsConnected(true);
    });
  
    newConnection.onclose((error) => {
        console.log(`Connection closed due to error "${error}". Try refreshing this page to restart the connection.`);
        setIsConnected(false);
    });
  
    newConnection.on("DisableSlot", (slotCheckModel) => {
        console.log('Received DisableSlot:', slotCheckModel);
  
        //check nếu mà slot trả về có branch và date trùng với branch và date mà mình đang chọn thì set lại unavailable slot
        const startOfWeekDayjs = dayjs(newWeekStartRef.current); //lấy ra đúng cái ngày đầu tiên của tuần user chọn
        console.log('startOfWeekDayjs:', startOfWeekDayjs.format('YYYY-MM-DD'));
        
        const fromDate = startOfWeekDayjs.add(1, 'day').startOf('day');
        const toDate = startOfWeekDayjs.add(7, 'day').endOf('day');
        const slotDate = dayjs(slotCheckModel.slotDate, 'YYYY-MM-DD');
        
        console.log('fromDate :', fromDate.format('YYYY-MM-DD'), 'toDate ', toDate.format('YYYY-MM-DD'), 'slotDate:', slotDate.format('YYYY-MM-DD'));
        
        //check lẻ dkien 
        const isBranchMatch = slotCheckModel.branchId === selectBranchRef.current;
        console.log('branch của signalR:', slotCheckModel.branchId, 'branch mình chọn:', selectBranchRef.current, 'check thử cái này ', selectBranchRef)
        const isDateMatch = slotDate.isBetween(fromDate, toDate, 'day', '[]');
        console.log('isBranchMatch:', isBranchMatch, 'isDateMatch:', isDateMatch);
        if(isBranchMatch && isDateMatch) {
          console.log('điều kiện là true' );
          const { slotDate, timeSlot: { slotStartTime, slotEndTime } } = slotCheckModel;
        const newSlot = { slotDate, slotStartTime, slotEndTime };
  
        setUnavailableSlot((prev) => [...prev, newSlot]);
       }
    });
  
    setConnection(newConnection);
  }, []);
  //check unavailable slot
  useEffect(() => {
    console.log('UnavailableSlot:', unavailableSlots);
  }, [unavailableSlots]);

  useEffect(() => {
    const fetchBranchResponses = async () => {
      try {
        const branchResponses = await fetchBranchById(branchId);
        if (branchResponses) {
          setBranch(branchResponses);
          setSelectedBranch(branchResponses.branchId);
        } else {
          console.error("Invalid branch details");
        }
      } catch (error) {
        console.error("Error fetching branch details:", error);
      }
    };

    fetchBranchResponses();
  }, [branchId]);

  useEffect(() => {
    const fetchNumberOfCourts = async () => {
      try {
        const response = await fetch(
          `https://courtcaller.azurewebsites.net/numberOfCourt/${branchId}`
        );
        const data = await response.json();
        setNumberOfCourts(data);
      } catch (err) {
        console.error(
          `Failed to fetch number of courts for branch ${branchId}`
        );
      }
    };
    fetchNumberOfCourts();
  }, [branchId]);

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
        setCurrentUserId(userId);
        fetchUserData(userId, false);
      } else {
        const userId = decoded.email;
        setCurrentUserId(userId);
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
    if (!listBranchId.includes(branchId)) {
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
        `/Reviews/GetReviewsByBranch/${branchResponse.branchId}`,
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

  //fetch rating tổng xong rồi đưa vào averageRating
  useEffect(() => {
    const fetchRating = async () => {
      try {
        console.log("selectedBranch của rating:", branchId);
        const data = await fetchPercentRatingByBranch(branchId);
        setAverageRating(data);
      } catch (error) {
        console.error("Error fetching rating", error);
      }
    };

    fetchRating();
  }, [branchId]);

  //fetch rating nhỏ
  useEffect(() => {
    const fetchEachPercentRating = async () => {
      try {
        const data = await fetchEachPercentRatingByBranch(branchId);
        console.log("data:", data);
        setListRating(data);
      } catch (error) {
        console.error("Error fetching rating", error);
      }
    };
    fetchEachPercentRating();
  }, [branchId]);

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
    if (branch) {
      const days = getDaysOfWeek(startOfWeek, branch.openDay);
      setWeekDays(days);

      const morningSlots = generateTimeSlots(
        timeStringToDecimal(branch.openTime),
        timeStringToDecimal("14:00:00")
      );
      setMorningTimeSlots(morningSlots);

      const afternoonSlots = generateTimeSlots(
        timeStringToDecimal("14:00:00"),
        timeStringToDecimal(branch.closeTime)
      );
      setAfternoonTimeSlots(afternoonSlots);
    }
  }, [branch, startOfWeek]);

  const handleSlotClick = (slot, day) => {
    const slotId = `${day.format("YYYY-MM-DD")}_${slot}`;
    const slotCount = selectedSlots.filter(
      (selectedSlot) => selectedSlot.slotId === slotId
    ).length;
    const totalSelectedSlots = selectedSlots.length;
    const slotToUse = availableSlot > 0 ? availableSlot : numberOfSlot;
    console.log("numberofslot:", numberOfSlot);

    if (slotCount < slotToUse && totalSelectedSlots < slotToUse) {
      setSelectedSlots([...selectedSlots, { slotId, slot, day }]);
    } else {
      alert(`You can select up to ${slotToUse} slots only`);
    }
  };

  const handleRemoveSlot = (slotId) => {
    const newSelectedSlots = selectedSlots.filter(
      (selectedSlot) => selectedSlot.slotId !== slotId
    );
    setSelectedSlots(newSelectedSlots);
  };

  const handlePreviousWeek = async () => {
    setLoading(true);
    const currentWeekStart = dayjs().startOf('week');
    const oneWeekBeforeCurrentWeek = dayjs().startOf('week').subtract(1, 'week');
    const oneWeekBeforeStartOfWeek = dayjs(startOfWeek).subtract(1, 'week');
    // Không cho phép quay về tuần trước tuần hiện tại
    if (oneWeekBeforeStartOfWeek.isBefore(currentWeekStart, 'week')) {
      setLoading(false);
      return; 
    }
    if (!dayjs(startOfWeek).isSame(oneWeekBeforeCurrentWeek, 'week') && oneWeekBeforeStartOfWeek.isAfter(oneWeekBeforeCurrentWeek)) {
      setStartOfWeek(oneWeekBeforeStartOfWeek);
    } else if (dayjs(startOfWeek).isSame(oneWeekBeforeCurrentWeek, 'week')) {
      setStartOfWeek(oneWeekBeforeCurrentWeek);
    }

    const newWeekStart = oneWeekBeforeStartOfWeek.format('YYYY-MM-DD');
    setNewWeekStart(newWeekStart);
    const newWeekStartPlus = oneWeekBeforeStartOfWeek.add(1, 'day').format('YYYY-MM-DD');
    const unavailableSlot = await fetchUnavailableSlots(newWeekStartPlus, selectedBranch);
    const slots = Array.isArray(unavailableSlot) ? unavailableSlot : [];
    setUnavailableSlot(slots);

    setLoading(false);
  };

  const handleNextWeek = async () => {
    setLoading(true);
    const newWeekStart = dayjs(startOfWeek).add(1, 'week').format('YYYY-MM-DD');
    console.log ('newWeekStart:', newWeekStart);
    setNewWeekStart(newWeekStart);
    setStartOfWeek(dayjs(startOfWeek).add(1, 'week'));
   
    const unavailableSlot = await fetchUnavailableSlots(newWeekStart, selectedBranch);
    const slots = Array.isArray(unavailableSlot) ? unavailableSlot : [];
    setUnavailableSlot(slots);

    setLoading(false);
  };

  //fetch unavailable slot lần đầu
  useEffect(() => {
    const fetchInitialUnavailableSlots = async () => {
      setLoading(true);
      const currentWeekStart = dayjs(startOfWeek).format('YYYY-MM-DD');
      const unavailableSlot = await fetchUnavailableSlots(currentWeekStart, selectedBranch);
      const slots = Array.isArray(unavailableSlot) ? unavailableSlot : [];
      setUnavailableSlot(slots);
      setLoading(false);
    };

    if (selectedBranch) {
      fetchInitialUnavailableSlots();
    }
  }, [selectedBranch, startOfWeek]);

  const handleContinue = () => {
    if(selectedSlots == 0){
      alert('You need to choose slot(s) first');
      return;
    } 

    const bookingRequests = selectedSlots.map((slot) => {
      const { day, slot: timeSlot } = slot;
      return {
        slotDate: day.format("YYYY-MM-DD"),
        timeSlot: {
          slotStartTime: `${timeSlot.split(" - ")[0]}:00`,
          slotEndTime: `${timeSlot.split(" - ")[1]}:00`,
        },
      };
    });
    console.log("bookingRequests", bookingRequests);

    navigate("/payment-detail", {
      state: {
        email,
        userName,
        branchId,
        bookingRequests,
        userId,
        availableSlot,
        bookingId,
        type: "flexible",
        numberOfSlot,
      },
    });
  };

  const isSlotUnavailable = (day, slot) => {
    const formattedDay = day.format("YYYY-MM-DD");
    const slotStartTime = slot.split(" - ")[0];
    return unavailableSlots.some((unavailableSlot) => {
      return (
        unavailableSlot.slotDate === formattedDay &&
        unavailableSlot.slotStartTime === `${slotStartTime}:00`
      );
    });
  };

  const handleToggleMorning = () => {
    setShowAfternoon(false);
  };

  const handleToggleAfternoon = () => {
    setShowAfternoon(true);
  };

  const pictures = JSON.parse(branchResponse.branchPicture).slice(0, 5);

  return (
    <>
      <div style={{ backgroundColor: "#EAECEE" }}>
        <div className="header-container">
          <div className="brief-info">
            <h1>{branchResponse.branchName}</h1>
            <p>
              <IoLocationOutline style={{ fontSize: 22 }} />{" "}
              {branchResponse.branchAddress}
            </p>
            <p>{branchResponse.description}</p>
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
                  <span style={{ fontWeight: 700 }}>
                    {branchResponse.openTime}
                  </span>
                </div>
                <div className="item">
                  <span>Close Time:</span>
                  <span style={{ fontWeight: 700 }}>
                    {branchResponse.closeTime}
                  </span>
                </div>
                <div className="item">
                  <span>Number of courts:</span>
                  <span style={{ fontWeight: 700 }}>{numberOfCourt}</span>
                </div>
                <div className="item">
                  <span>Phone:</span>
                  <span style={{ fontWeight: 700 }}>
                    {branchResponse.branchPhone}{" "}
                  </span>
                </div>
              </div>
              <div style={{marginTop: 100}} className="services-info">
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

        <Box
          m="20px"
          className="max-width-box"
          sx={{ backgroundColor: "#F5F5F5", borderRadius: 2, p: 2 }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            mb={2}
            alignItems="center"
          >
            <Typography variant="h6" sx={{ color: "#0D1B34", mx: 1 }}>
              <strong>Booking for User: {userName}</strong>
            </Typography>
            <Box
              display="flex"
              alignItems="center"
              sx={{ backgroundColor: "#E0E0E0", p: 1, borderRadius: 2 }}
            >
              <IconButton onClick={handlePreviousWeek} size="small">
                <ArrowBackIosIcon fontSize="inherit" />
              </IconButton>
              <Typography variant="h6" sx={{ color: "#0D1B34", mx: 1 }}>
                From {dayjs(startOfWeek).add(1, "day").format("D/M")} To{" "}
                {dayjs(startOfWeek).add(7, "day").format("D/M")}
              </Typography>
              <IconButton onClick={handleNextWeek} size="small">
                <ArrowForwardIosIcon fontSize="inherit" />
              </IconButton>
            </Box>
            <Box>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: showAfternoon ? "#FFFFFF" : "#0D1B34",
                  color: showAfternoon ? "#0D1B34" : "white",
                  mr: 1,
                  textTransform: "none",
                  marginBottom: "0",
                }}
                onClick={handleToggleMorning}
              >
                Morning
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: showAfternoon ? "#0D1B34" : "#FFFFFF",
                  color: showAfternoon ? "white" : "#0D1B34",
                  textTransform: "none",
                  marginBottom: "0",
                }}
                onClick={handleToggleAfternoon}
              >
                Afternoon
              </Button>
            </Box>
          </Box>

          {weekDays.map((day, dayIndex) => (
            <Grid container spacing={2} key={dayIndex} alignItems="center">
              <Grid item xs={1} padding="8px">
                <Box
                  sx={{
                    backgroundColor: "#0D61F2",
                    color: "white",
                    width: "100%",
                    textAlign: "center",
                    padding: "8px",
                    borderRadius: "4px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  <Typography variant="body2" component="div">
                    {day.format("ddd")}
                  </Typography>
                  <Typography variant="body2" component="div">
                    {day.format("D/M")}
                  </Typography>
                </Box>
              </Grid>

              {(showAfternoon ? afternoonTimeSlots : morningTimeSlots).map(
                (slot, slotIndex) => {
                  const slotId = `${day.format("YYYY-MM-DD")}_${slot}`;
                  const slotCount = selectedSlots.filter(
                    (selectedSlot) => selectedSlot.slotId === slotId
                  ).length;
                  const isSelected = selectedSlots.some(selectedSlot => selectedSlot.slotId === slotId);
                  const isPast =
                    day.isBefore(currentDate, "day") ||
                    (day.isSame(currentDate, "day") &&
                      timeStringToDecimal(currentDate.format("HH:mm:ss")) >
                        timeStringToDecimal(slot.split(" - ")[0]) + 0.25) ||
                    isSlotUnavailable(day, slot);

                  return (
                    <Grid item xs key={slotIndex}>
                      <Button
                        onClick={() => handleSlotClick(slot, day)}
                        sx={{
                          backgroundColor: isPast
                            ? "#E0E0E0"
                            : isSelected
                            ? "#1976d2"
                            : "#D9E9FF",
                          color: isPast ? "#E0E0E0" : isSelected ? "#1976d2" : "#D9E9FF",
                          p: 2,
                          borderRadius: 2,
                          width: "100%",
                          textTransform: "none",
                          border: isSelected
                            ? "2px solid #0D61F2"
                            : "1px solid #90CAF9",
                          textAlign: "center",
                          marginBottom: "16px",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          position: "relative",
                        }}
                        m="10px"
                        disabled={isPast}
                      >
                        <Box>
                          <Typography
                            sx={{
                              fontWeight: "bold",
                              color: isSelected ? "#FFFFFF" : "#0D1B34",
                            }}
                          >
                            {slot}
                          </Typography>
                          {isSelected && (
                            <Typography
                              sx={{
                                position: "absolute",
                                top: 5,
                                right: 5,
                                backgroundColor: "#FFFFFF",
                                color: "#1976d2",
                                borderRadius: "50%",
                                width: 20,
                                height: 20,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                                fontWeight: "bold",
                              }}
                            >
                              {slotCount}
                            </Typography>
                          )}
                          {isSelected && (
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSlot(slotId);
                              }}
                              sx={{
                                position: "absolute",
                                top: 5,
                                left: 5,
                                backgroundColor: "#FFFFFF",
                                color: "#1976d2",
                                borderRadius: "50%",
                                width: 20,
                                height: 20,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                                fontWeight: "bold",
                              }}
                            >
                              -
                            </IconButton>
                          )}
                        </Box>
                      </Button>
                    </Grid>
                  );
                }
              )}
            </Grid>
          ))}

          <Box display="flex" justifyContent="end" mt={1} marginRight={"12px"}>
            <Button
              variant="contained"
              sx={{
                color: "#FFFFFF",
                backgroundColor: "#1976d2",
                ":hover": {
                  backgroundColor: "#1565c0",
                },
                ":active": {
                  backgroundColor: "#1976d2",
                },
              }}
              onClick={handleContinue}
            >
              Continue
            </Button>
          </Box>
        </Box>

        {/* Map */}
        <div className="map-section">
          <div className="map-form">
            <div className="map-header">
              <h2 className="map-title">Branch Location</h2>
              <p className="map-address">{branchResponse.branchAddress}</p>
            </div>
            <div className="map-container">
              <div className="map-wrapper">
                <div className="map-overlay">
                  <div className="map-legend">
                    <div className="map-legend-icon"></div>
                    <span>Branch Location</span>
                  </div>
                </div>
                <DisplayMap address={branchResponse.branchAddress} />
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

export default FlexibleBooking;
