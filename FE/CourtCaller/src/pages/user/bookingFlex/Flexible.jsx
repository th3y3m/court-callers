import React, { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, FormControl } from "@mui/material";
import {
  validateRequired,
  validateNumber,
} from "../Validations/formValidation";
import { fetchBranches, fetchBranchById } from "api/branchApi";
import { checkBookingTypeFlex } from "api/bookingApi";
import api from "api/api";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useLocation, Link } from "react-router-dom";
import RequestLogin from "../requestUserLogin";
import { flexValidation } from "../Validations/bookingValidation";
import { animateScroll as scroll } from "react-scroll";

const Flexible = () => {
  const [email, setEmail] = useState("");
  const [branches, setBranches] = useState([]);
  const [numberOfSlot, setNumberOfSlot] = useState("");
  const [availableSlot, setAvailableSlot] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [errors, setErrors] = useState({
    email: "",
    numberOfSlot: "",
  });
  const [showLogin, setShowLogin] = useState(false); // State to manage visibility of RequestLogin component

  const navigate = useNavigate();
  const location = useLocation();
  const { branch, selectedBranchByDay } = location.state;
  const [userId, setUserId] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(
    branch.branchId || selectedBranchByDay
  );
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null);
  const [branchDetail, setBranchDetail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [flexValidate, setFlexValidate] = useState({
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
            const response = await api.get(
              `/UserDetails/GetUserDetailByUserEmail/${id}`
            );
            setUserData(response.data);
            const userResponse = await api.get(
              `/Users/GetUserDetailByUserEmail/${id}?searchValue=${id}`
            );
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
    const fetchingFlexSlot = async () => {
      if (!user) {
        console.error("User is null");
        return;
      }

      try {
        const availableSlot = await checkBookingTypeFlex(
          userData.userId,
          selectedBranch
        );
        console.log("availableSlot:", availableSlot);

        setAvailableSlot(availableSlot.numberOfSlot); // Update the state
        setBookingId(availableSlot.bookingId);
      } catch (error) {
        console.error("error fetching available Slot", error);
      }
    };

    fetchingFlexSlot();
  }, [user, selectedBranch]);

  console.log("user", user);

  useEffect(() => {
    const fetchBranchesData = async () => {
      try {
        const response = await fetchBranches(1, 10);
        setBranches(response.items);
      } catch (error) {
        console.error("Error fetching branches data:", error);
      }
    };

    fetchBranchesData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      setShowLogin(true); // Show the RequestLogin component if no token is found
      return;
    }

    const flexValidate = flexValidation(numberOfSlot);

    setFlexValidate(flexValidate);

    if (!flexValidate.isValid) {
      setMessage("Please try again");
      setMessageType("error");
      return;
    }

    try {
      const branchResponse = await fetchBranchById(selectedBranch);
      if (userData && branchResponse) {
        navigate("/flexschedule", {
          state: {
            userId: userData.userId,
            email: user.email,
            userName: user.userName,
            numberOfSlot,
            branchId: selectedBranch,
            availableSlot,
            bookingId,
            branchResponse,
          },
        });
        scroll.scrollToTop({
          duration: 1000,
          smooth: "easeInOutQuart",
        });
      } else {
        setErrors({
          email: user ? "" : "Invalid email",
          numberOfSlot: "",
        });
      }
    } catch (error) {
      console.error("Error during validation:", error);
      setErrors({
        email: "Error validating email",
        numberOfSlot: "",
      });
    }
  };


  return (
    <Box sx={{ backgroundColor: "rgb(234, 236, 238)" }}>
      <Typography
        fontWeight="bold"
        mb="30px"
        variant="h2"
        color="black"
        textAlign="center"
      >
        Flexible Court Booking
      </Typography>
      <Box
        // m="70px auto"
        sx={{
          display: "flex",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Box
          m="20px"
          className="max-width-box"
          sx={{
            backgroundColor: "#F5F5F5",
            borderRadius: 2,
            p: 2,
            width: "400px",
            marginBottom: "30px",
            boxShadow: "2px 2px 20px rgba(0, 0, 0, 0.182)",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            mb={2}
            alignItems="center"
            sx={{ width: "10px" }}
          >
            <FormControl
              sx={{
                minWidth: 120,
                backgroundColor: "#0D1B34",
                borderRadius: 1,
              }}
            >
              <Typography
                labelid="branch-select-label"
                value={selectedBranch}
                sx={{ color: "#FFFFFF", p: 2 }}
              >
                {selectedBranch}
              </Typography>
            </FormControl>
          </Box>

          <Box>
            <Box sx={{ padding: "20px", borderRadius: 2 }}>
              {availableSlot !== 0 && availableSlot !== null && (
                <Box
                  sx={{
                    backgroundColor: "#e0f7fa",
                    padding: "10px",
                    borderRadius: 1,
                    marginTop: "10px",
                  }}
                >
                  <Typography variant="h6" color="black">
                    Currently, the customer's account has{" "}
                    <strong>{availableSlot}</strong> remaining booking slots.
                  </Typography>
                </Box>
              )}
            </Box>

            {availableSlot === 0 && (
              <>
                <Typography
                  mb="10px"
                  mt="10px"
                  variant="h5"
                  color="black"
                  fontWeight="bold"
                >
                  Number of Slots
                </Typography>
                <TextField
                  className={flexValidate.isValid ? "" : "error-input"}
                  placeholder="Enter Number of Slots"
                  fullWidth
                  value={numberOfSlot}
                  onChange={(e) => setNumberOfSlot(e.target.value)}
                  error={Boolean(errors.numberOfSlot)}
                  helperText={errors.numberOfSlot}
                  InputProps={{
                    style: {
                      color: "#000000",
                    },
                  }}
                  sx={{
                    mb: "20px",
                    backgroundColor: "#ffffff",
                    borderRadius: 1,
                    border: "1px solid #e0e0e0",
                  }}
                />
                {flexValidate.message && (
                  <p className="errorVal">{flexValidate.message}</p>
                )}
              </>
            )}

            <Box display="flex" justifyContent="flex-end" mt="30px">
              <Link to="/">
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{
                    padding: "10px 30px",
                    fontSize: "16px",
                    backgroundColor: "#2ecc71",
                    marginRight: 3,
                  }}
                >
                  Back
                </Button>
              </Link>

              <Button
                variant="contained"
                color="secondary"
                sx={{
                  padding: "10px 30px",
                  fontSize: "16px",
                  backgroundColor: "#2ecc71",
                }}
                onClick={handleSubmit}
              >
                Book
              </Button>
            </Box>
          </Box>
        </Box>

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
      </Box>
    </Box>
  );
};

export default Flexible;
