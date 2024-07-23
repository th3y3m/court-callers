import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Select,
  MenuItem,
  Divider,
  Grid,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import PaymentIcon from "@mui/icons-material/Payment";
import {
  generatePaymentToken,
  processPayment,
  processBalancePayment,
} from "api/paymentApi";
import LoadingPage from "./LoadingPage";
import {
  reserveSlots,
  createBookingFlex,
  deleteBookingInFlex,
} from "api/bookingApi";
import { addTimeSlotIfExistBooking } from "api/timeSlotApi";
import { fetchAvailableCourts, fetchCourtByBranchId } from "api/courtApi";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import * as signalR from "@microsoft/signalr";


const theme = createTheme({
  components: {
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "black",
          "&.Mui-checked": {
            color: "black",
          },
        },
      },
    },
  },
});

const steps = ["Payment Details", "Payment Confirmation"];

const PaymentDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    email,
    userName,
    userId,
    branchId,
    bookingRequests,
    totalPrice,
    type,
    availableSlot,
    bookingId,
    numberOfSlot,
  } = location.state || {};
  const sortedBookingRequests = bookingRequests
    ? [...bookingRequests].sort((a, b) => {
        const dateA = new Date(`${a.slotDate}T${a.timeSlot.slotStartTime}`);
        const dateB = new Date(`${b.slotDate}T${b.timeSlot.slotStartTime}`);
        return dateA - dateB;
      })
    : [];
  const [activeStep, setActiveStep] = useState(0);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [showFlexPayment, setShowFlexPayment] = useState(false);
  const [courts, setCourts] = useState([]);
  const [availableCourts, setAvailableCourts] = useState({});
  const [selectedCourts, setSelectedCourts] = useState({});
  const [eventCourt, setEventCourt] = useState(0);
  //fetch chỉ 1 lần
  const isFetchCourt = useRef(false);

  //đấm nhau với signalR
  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://courtcaller.azurewebsites.net/timeslothub", {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    newConnection.onreconnecting((error) => {
      console.log(`Connection lost due to error "${error}". Reconnecting.`);
      setIsConnected(false);
    });

    newConnection.onreconnected((connectionId) => {
      console.log(
        `Connection reestablished. Connected with connectionId "${connectionId}".`
      );
      setIsConnected(true);
    });

    newConnection.onclose((error) => {
      console.log(
        `Connection closed due to error "${error}". Try refreshing this page to restart the connection.`
      );
      setIsConnected(false);
    });

    console.log("Initializing connection...");
    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      const startConnection = async () => {
        try {
          await connection.start();
          console.log("SignalR Connected.");
          setIsConnected(true);
        } catch (error) {
          console.log("Error starting connection:", error);
          setIsConnected(false);
          setTimeout(startConnection, 5000);
        }
      };
      startConnection();
    }
  }, [connection]);

  useEffect(() => {
    if (type === "flexible" && availableSlot !== 0) {
      setShowFlexPayment(true);
    } else {
      setShowFlexPayment(false);
    }
  }, []);

  // gửi slot để backend signalr nó check
  const sendUnavailableSlotCheck = async () => {
    if (connection) {
      const lastRequest = bookingRequests[bookingRequests.length - 1];
      const slotCheckModel = {
        branchId: branchId,
        slotDate: lastRequest.slotDate,
        timeSlot: {
          slotDate: lastRequest.slotDate,
          slotStartTime: lastRequest.timeSlot.slotStartTime,
          slotEndTime: lastRequest.timeSlot.slotEndTime,
        },
      };
      console.log("SlotCheckModel:", slotCheckModel);
      try {
        await connection.send("DisableSlot", slotCheckModel);
        console.log("Data sent to server:", slotCheckModel);
      } catch (e) {
        console.log("Error sending data to server:", e);
      }
    } else {
      alert("No connection to server yet.");
    }
  };
  useEffect(() => {
    if (branchId) {
      const loadCourts = async () => {
        const data = await fetchCourtByBranchId(branchId, 1, 100);
        setCourts(data.items);
      };
      loadCourts();
    }
  }, [branchId]);

  const handleCourtChange = async (
    index,
    slotDate,
    slotStartTime,
    slotEndTime
  ) => {
    try {
      const availableCourtsData = await fetchAvailableCourts(
        branchId,
        slotDate,
        slotStartTime,
        slotEndTime
      );
      setAvailableCourts((prevState) => ({
        ...prevState,
        [index]: availableCourtsData,
      }));
    } catch (error) {
      console.error("Error fetching available courts:", error);
    }
  };

  const handleCourtSelection = (index, courtId) => {
    const currentSlot = sortedBookingRequests[index];
    const isDuplicate = sortedBookingRequests.some((request, idx) => {
      return (
        idx !== index &&
        request.slotDate === currentSlot.slotDate &&
        request.timeSlot.slotStartTime === currentSlot.timeSlot.slotStartTime &&
        request.timeSlot.slotEndTime === currentSlot.timeSlot.slotEndTime &&
        selectedCourts[idx] === courtId
      );
    });

    if (isDuplicate) {
      alert("You now have some same booking slot, please choose another court");
      return;
    }

    setSelectedCourts((prevState) => ({
      ...prevState,
      [index]: courtId,
    }));
  };

  useEffect(() => {
    if (branchId && sortedBookingRequests.length > 0 && !isFetchCourt.current) {
      sortedBookingRequests.forEach((request, index) => {
        handleCourtChange(
          index,
          request.slotDate,
          request.timeSlot.slotStartTime,
          request.timeSlot.slotEndTime
        );
        console.log("branch", branchId, "sort là ", sortedBookingRequests);
      });
      isFetchCourt.current = true;
    }
  }, [eventCourt]);

  const handleNext = async (paymentMethod) => {
    try {
      await sendUnavailableSlotCheck();

      if (type === "flexible" && availableSlot !== 0 && bookingId) {
        const bookingForm = bookingRequests.map((request, index) => ({
          courtId: selectedCourts[index] || null,
          branchId: branchId,
          slotDate: request.slotDate,
          timeSlot: {
            slotDate: request.slotDate,
            slotStartTime: request.timeSlot.slotStartTime,
            slotEndTime: request.timeSlot.slotEndTime,
          },
        }));
        const booking = await addTimeSlotIfExistBooking(bookingForm, bookingId);
        navigate("/confirm", {
          state: {
            bookingId: bookingId,
            bookingForm: bookingForm,
          },
        });
        return;
      } else if (type === "flexible" && availableSlot === 0) {
        let id = null;
        try {
          setIsLoading(true);
          const bookingForm = bookingRequests.map((request, index) => ({
            courtId: selectedCourts[index] || null,
            branchId: branchId,
            slotDate: request.slotDate,
            timeSlot: {
              slotDate: request.slotDate,
              slotStartTime: request.timeSlot.slotStartTime,
              slotEndTime: request.timeSlot.slotEndTime,
            },
          }));

          const createBookingTypeFlex = await createBookingFlex(
            userId,
            numberOfSlot,
            branchId
          );

          id = createBookingTypeFlex.bookingId;
          const booking = await reserveSlots(userId, bookingForm);
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
          const tokenResponse = await generatePaymentToken(id);
          const token = tokenResponse.token;
          
          if (paymentMethod === "Balance") {
            try {
              await processBalancePayment(token);
              navigate("/confirm");
            } catch (error) {
              console.error("Balance payment failed:", error);
             navigate("/reject");
             

            }
          } else {
            const paymentResponse = await processPayment("Customer", token);
            const paymentUrl = paymentResponse;
            window.location.href = paymentUrl;
            return;
          }
        } catch (error) {
          console.error("Error processing payment:", error);
          setErrorMessage("Error processing payment. Please try again.");
          if (id) {
            try {
              await deleteBookingInFlex(id);
              console.log("Booking rolled back successfully");
              return;
            } catch (deleteError) {
              console.error("Error rolling back booking:", deleteError);
            }
          }
          setIsLoading(false);
        }
      }

      if (activeStep === 0) {
        setIsLoading(true);
        try {
          const bookingForm = bookingRequests.map((request, index) => {
            return {
              courtId: selectedCourts[index] || null,
              branchId: branchId,
              slotDate: request.slotDate,
              timeSlot: {
                slotDate: request.slotDate,
                slotStartTime: request.timeSlot.slotStartTime,
                slotEndTime: request.timeSlot.slotEndTime,
              },
            };
          });

          console.log("bookingForm", bookingForm);

          const booking = await reserveSlots(userId, bookingForm);
          setActiveStep((prevActiveStep) => prevActiveStep + 1);

          const tokenResponse = await generatePaymentToken(booking.bookingId);
          const token = tokenResponse.token;
    
          if (paymentMethod === "Balance") {
            try {
              await processBalancePayment(token);
              navigate("/confirm");
            } catch (error) {
              console.error("Balance payment failed:", error);
              navigate("/reject");
              
            }
          } else {
            const paymentResponse = await processPayment("Customer", token);
            const paymentUrl = paymentResponse;
            window.location.href = paymentUrl;
            return;
          }
        } catch (error) {
          console.error("Error processing payment:", error);
          setErrorMessage("Error processing payment. Please try again.");
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error sending unavailable slot check:", error);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePaymentMethodChange = (event) => {
    setSelectedPaymentMethod(event.target.value);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <Box
              sx={{
                backgroundColor: "#E0E0E0",
                padding: "20px",
                borderRadius: 2,
              }}
            >
              <Typography variant="h5" gutterBottom color="black">
                Customer Information
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <strong>{userName}</strong>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>{email}</Box>
            </Box>

            {/* box này là thông tin payment method */}
            <Box
              sx={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Grid container spacing={2}>
                {showFlexPayment ? (
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        backgroundColor: "#E0E0E0",
                        padding: "20px",
                        borderRadius: 2,
                        maxHeight: "400px",
                        overflowY: "auto",
                      }}
                    >
                      <Typography
                        variant="h5"
                        gutterBottom
                        color="black"
                        display="flex"
                        alignItems="center"
                      >
                        <PaymentIcon sx={{ marginRight: "8px" }} /> Payment
                        Method
                      </Typography>
                      <FormControl component="fieldset">
                        <FormLabel component="legend" sx={{ color: "black" }}>
                          <strong>
                            You don't need to select payment method because you
                            have {availableSlot} remaining slot(s) now
                          </strong>
                        </FormLabel>
                      </FormControl>
                    </Box>
                  </Grid>
                ) : (
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        backgroundColor: "#E0E0E0",
                        padding: "20px",
                        borderRadius: 2,
                        maxHeight: "400px",
                        overflowY: "auto",
                      }}
                    >
                      <Typography
                        variant="h5"
                        gutterBottom
                        color="black"
                        display="flex"
                        alignItems="center"
                      >
                        <PaymentIcon sx={{ marginRight: "8px" }} /> Payment
                        Method
                      </Typography>
                      <FormControl component="fieldset">
                        <FormLabel component="legend" sx={{ color: "black" }}>
                          Select Payment Method
                        </FormLabel>
                        <RadioGroup
                          aria-label="payment method"
                          name="paymentMethod"
                          value={selectedPaymentMethod}
                          onChange={handlePaymentMethodChange}
                        >
                          <FormControlLabel
                            value="creditCard"
                            control={<Radio />}
                            label="Credit Card"
                            sx={{ color: "black" }}
                          />
                          <FormControlLabel
                            value="Balance"
                            control={<Radio />}
                            label="Balance"
                            sx={{ color: "black" }}
                          />
                        </RadioGroup>
                      </FormControl>
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      backgroundColor: "#E0E0E0",
                      padding: "20px",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h5" gutterBottom color="black">
                      Bill
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Branch ID:</strong> {branchId}
                    </Typography>
                    <Typography
                      variant="h6"
                      color="black"
                      sx={{ marginTop: "20px" }}
                    >
                      <strong>Time Slot:</strong>
                    </Typography>
                    {bookingRequests &&
                      sortedBookingRequests.map((request, index) => (
                        <Box
                          key={index}
                          sx={{
                            marginBottom: "15px",
                            padding: "10px",
                            backgroundColor: "#FFFFFF",
                            borderRadius: 2,
                            boxShadow: 1,
                          }}
                        >
                          <Typography variant="body1" color="black">
                            <strong>Date:</strong> {request.slotDate}
                          </Typography>
                          <Typography variant="body1" color="black">
                            <strong>Start Time:</strong>{" "}
                            {request.timeSlot.slotStartTime}
                          </Typography>
                          <Typography variant="body1" color="black">
                            <strong>End Time:</strong>{" "}
                            {request.timeSlot.slotEndTime}
                          </Typography>
                          <Typography variant="body1" color="black">
                            <strong>Price:</strong> {request.price}K VND
                          </Typography>
                          <FormControl fullWidth>
                            <Select
                              value={selectedCourts[index] || ""}
                              onChange={(event) =>
                                handleCourtSelection(index, event.target.value)
                              }
                            >
                              {availableCourts[index] &&
                              availableCourts[index].length > 0 ? (
                                availableCourts[index].map((court) => (
                                  <MenuItem
                                    key={court.courtId}
                                    value={court.courtId}
                                  >
                                    {court.courtName}
                                  </MenuItem>
                                ))
                              ) : (
                                <MenuItem disabled>
                                  No courts available
                                </MenuItem>
                              )}
                            </Select>
                          </FormControl>
                        </Box>
                      ))}
                    <Divider sx={{ marginY: "10px" }} />
                    <Typography variant="h6" color="black">
                      <strong>Total Price:</strong> {totalPrice}K VND
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </>
        );
      case 1:
        return <LoadingPage />; // Show loading page

        // -----------------------------------------------------------------------------------
        {
          /* xử lý vnPay xong thì đưa ra cái này !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
         // đổi case 1 thành paymentconfimationstep hoặc paymentrejectedstep dựa trên kết quả trả về từ vnpay
      case 1:
        //thành công
        // return <PaymentConfirmationStep userInfo={userInfo} branchId={branchId} timeSlot={timeSlot} totalPrice={totalPrice} />;

        //thất bại
        return <PaymentRejectedStep />;
        */
        }
      // -----------------------------------------------------------------------------------

      default:
        return "Unknown step";
    }
  };

  return (
    <>
      {showFlexPayment ? (
        <ThemeProvider theme={theme}>
          <Box
            m="20px"
            p="20px"
            sx={{ backgroundColor: "#F5F5F5", borderRadius: 2 }}
          >
            <Typography variant="h4" gutterBottom color="black">
              Payment Details
            </Typography>
            <Stepper activeStep={activeStep} sx={{ marginBottom: "20px" }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            {isLoading ? <LoadingPage /> : getStepContent(activeStep)}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ marginRight: "20px" }}
              >
                Back
              </Button>
              {/* <Button
            style={{ marginLeft: "1125px" }}
            variant="contained"
            color="primary"
            onClick={() => handleNext("Balance")}
            disabled={isLoading || selectedPaymentMethod !== 'Balance'} // Disable button while loading or if Credit Card is selected
          >
            {activeStep === steps.length - 1 ? "Finish" : "By Balance"}
          </Button> */}
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleNext("CreditCard")}
              >
                {activeStep === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            </Box>
          </Box>
        </ThemeProvider>
      ) : (
        <ThemeProvider theme={theme}>
          <Box
            m="20px"
            p="20px"
            sx={{ backgroundColor: "#F5F5F5", borderRadius: 2 }}
          >
            <Typography variant="h4" gutterBottom color="black">
              Payment Details
            </Typography>
            <Stepper activeStep={activeStep} sx={{ marginBottom: "20px" }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            {isLoading ? <LoadingPage /> : getStepContent(activeStep)}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ marginRight: "20px" }}
              >
                Back
              </Button>
              <Button
                style={{ marginLeft: "1125px" }}
                variant="contained"
                color="primary"
                onClick={() => handleNext("Balance")}
                disabled={isLoading || selectedPaymentMethod !== "Balance"} // Disable button while loading or if Credit Card is selected
              >
                {activeStep === steps.length - 1 ? "Finish" : "By Balance"}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleNext("CreditCard")}
                disabled={isLoading || selectedPaymentMethod !== "creditCard"} // Disable button while loading or if Balance is selected
              >
                {activeStep === steps.length - 1 ? "Finish" : "VNPay"}
              </Button>
            </Box>
          </Box>
        </ThemeProvider>
      )}
    </>
  );
};

export default PaymentDetail;
