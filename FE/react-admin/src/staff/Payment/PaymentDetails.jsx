import React, { useState, useEffect ,useRef} from 'react';
import { Box, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Button, TextField, Stepper, Step, StepLabel, Typography, Divider, Grid, MenuItem, Select } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PaymentIcon from '@mui/icons-material/Payment';
import { fetchUserDetailByEmail, fetchUserDetail,fetchUserDetailByEmailVer2 } from '../../api/userApi';
import { generatePaymentToken, processPayment } from '../../api/paymentApi';
import LoadingPage from './LoadingPage';
import { addTimeSlotIfExistBooking } from '../../api/timeSlotApi';
import { reserveSlots, createBookingFlex, deleteBookingInFlex, checkBookingTypeFlex } from '../../api/bookingApi';
import { fetchCourtByBranchId, fetchAvailableCourts } from '../../api/courtApi';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import * as signalR from '@microsoft/signalr';
import './style.css';
import Modal from "react-modal";
Modal.setAppElement("#root");

const theme = createTheme({
  components: {
    MuiRadio: {
      styleOverrides: {
        root: {
          color: 'black',
          '&.Mui-checked': {
            color: 'black',
          },
        },
      },
    },
  },
});

const steps = ['Payment Details', 'Payment Confirmation'];

const PaymentDetail = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const { branchId, bookingRequests, totalPrice, userChecked, userInfo: locationUserInfo, type, availableSlot, bookingId, numberOfSlot } = location.state || {};
  const sortedBookingRequests = bookingRequests ? [...bookingRequests].sort((a, b) => {
    const dateA = new Date(`${a.slotDate}T${a.timeSlot.slotStartTime}`);
    const dateB = new Date(`${b.slotDate}T${b.timeSlot.slotStartTime}`);
    return dateA - dateB;
  }) : [];
  const [activeStep, setActiveStep] = useState(0);

  const [email, setEmail] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [userInfo, setUserInfo] = useState(locationUserInfo || null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [courts, setCourts] = useState([]);
  const [availableCourts, setAvailableCourts] = useState({});
  const [selectedCourts, setSelectedCourts] = useState({});
  const [signalRCourt, setSignalRCourt] = useState(null);
  const [eventCourt, setEventCourt] = useState(0);

  const [showNavigateFlex, setShowNavigateFlex] = useState(false);
  const [availableSlotFlex, setAvailableSlotFlex] = useState(null);
  const [bookingIdFlex, setBookingIdFlex] = useState(null);
  const currentDay = new Date().getDate();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const closeNavigateToFlex = () => {
    setShowNavigateFlex(false);
  };
  //fetch chỉ 1 lần
  const isFetchCourt = useRef(false);

    //đấm nhau với signalR
    useEffect(() => {
      const newConnection = new HubConnectionBuilder()
        .withUrl("https://courtcaller.azurewebsites.net/timeslothub", {
          transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
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

      newConnection.on("RefreshCourt", () => {
        console.log("RefreshCourt event received.");
        
        console.log ("even 1",eventCourt)
        setEventCourt(prev => prev + 1);
    
      });
  
      console.log('Initializing connection...');
      setConnection(newConnection);
    }, []);
  
    useEffect(() => {
      if (connection) {
        const startConnection = async () => {
          try {
            await connection.start();
            console.log('SignalR Connected.');
            setIsConnected(true);
          } catch (error) {
            console.log('Error starting connection:', error);
            setIsConnected(false);
            setTimeout(startConnection, 5000);
          }
        };
        startConnection();
      }
    }, [connection]);

    useEffect(() => {
      if (availableSlotFlex !== null) {
        console.log('availableSlotFlex at point 1:', availableSlotFlex);
        console.log('Type of availableSlotFlex at point 1:', typeof availableSlotFlex);
        if (availableSlotFlex !== 0 && type !== 'flexible') {
          setShowNavigateFlex(true);
        } else {
          setShowNavigateFlex(false);
        }
      }
    }, [availableSlotFlex]);
  
  
    // gửi slot để backend signalr nó check
    

  useEffect(() => {
    if (branchId) {
      const loadCourts = async () => {
        const data = await fetchCourtByBranchId(branchId, 1, 100);
        setCourts(data.items);
      };
      loadCourts();
    }
  }, [branchId]);

  const handleCourtChange = async (index, slotDate, slotStartTime, slotEndTime) => {
    try {
      const availableCourtsData = await fetchAvailableCourts(branchId, slotDate, slotStartTime, slotEndTime);
      setAvailableCourts((prevState) => ({
        ...prevState,
        [index]: availableCourtsData
      }));
    } catch (error) {
      console.error('Error fetching available courts:', error);
    }
  };

  const handleCourtSelection = (index, courtId) => {
    setSelectedCourts((prevState) => ({
      ...prevState,
      [index]: courtId
    }));
  };

  useEffect(() => {
    console.log ("branch", branchId , "sort là ", sortedBookingRequests , "is fetch court là:" , !isFetchCourt.current);
    if (branchId && sortedBookingRequests.length > 0 ) {
      sortedBookingRequests.forEach((request, index) => {
       var fetchavailableCourt = handleCourtChange(index, request.slotDate, request.timeSlot.slotStartTime, request.timeSlot.slotEndTime);
       console.log("nó chính là: ",fetchAvailableCourts)
      });
      isFetchCourt.current = true;
    }
  }, [eventCourt]);

  const sendAvailableSlotCheck = async () => {
    if (connection) {
      const lastRequest = bookingRequests[bookingRequests.length - 1];
     
      const slotCheckModel = {
        
        branchId: branchId,
        slotDate: lastRequest.slotDate,
        timeSlot: {
          slotDate: lastRequest.slotDate,
          slotStartTime: lastRequest.timeSlot.slotStartTime,
          slotEndTime: lastRequest.timeSlot.slotEndTime,
        }
      };
     
      
      try {
        await connection.send('RefreshCourt', slotCheckModel);
        console.log('Data sent to server:', slotCheckModel);
      } catch (e) {
        console.log('Error sending data to server:', e);
      }
    } else {
      alert('No connection to server yet.');
    }
  };

  const sendUnavailableSlotCheck = async () => {
    if (connection) {
      const lastRequest = bookingRequests[bookingRequests.length - 1];
     
      const slotCheckModel = {
        courtId: signalRCourt,
        branchId: branchId,
        slotDate: lastRequest.slotDate,
        timeSlot: {
          slotDate: lastRequest.slotDate,
          slotStartTime: lastRequest.timeSlot.slotStartTime,
          slotEndTime: lastRequest.timeSlot.slotEndTime,
        }
      };
      console.log('SlotCheckModel:', slotCheckModel);
      try {
        await connection.send('DisableSlot', slotCheckModel);
        console.log('Data sent to server:', slotCheckModel);
      } catch (e) {
        console.log('Error sending data to server:', e);
      }
    } else {
      alert('No connection to server yet.');
    }
  };

  const handleNavigate = () => {
    navigate("/flex", {state: {
      email: userInfo.email,
      userId: userInfo.userId,
      branchId
    }});
  };

  useEffect(() => {
    if (userChecked && locationUserInfo) {
      setUserExists(true);
    }
  }, [userChecked, locationUserInfo]);

  console.log('avaislot', availableSlotFlex)

  useEffect(() => {
    const fetchingFlexSlot = async () => {
      if (!userInfo) {
        console.error("User is null");
        return;
      }

      try {
        const availableSlot = await checkBookingTypeFlex(
          userInfo.userId,
          branchId
        );
        console.log("availableSlot:", availableSlot);

        setAvailableSlotFlex(availableSlot.numberOfSlot); // Update the state
        setBookingIdFlex(availableSlot.bookingId);
      } catch (error) {
        console.error("error fetching available Slot", error);
      }
    };

    fetchingFlexSlot();
  }, [userInfo, branchId]);
  console.log('availableSlotFlexSlot', availableSlotFlex)

  // console.log("userId: user.id", userInfo.userId);
  const handleEmailCheck = async () => {
    if (!email) {
      setErrorMessage('Please enter an email.');
      return;
    }
  
    try {
      const userData = await fetchUserDetailByEmail(email);
      if (userData && userData.length > 0) {
        const user = userData[0];
        const detailedUserInfo = await fetchUserDetailByEmailVer2(email);
        if (detailedUserInfo) {
          setUserExists(true);
          setUserInfo({
            userId: user.id,
            userName: user.userName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            fullName: detailedUserInfo.fullName,
            balance: detailedUserInfo.balance,
            address: detailedUserInfo.address,
          });
          setErrorMessage('');
        } else {
          setUserExists(false);
          setUserInfo(null);
          setErrorMessage('User details not found.');
        }
      } else {
        setUserExists(false);
        setUserInfo(null);
        setErrorMessage('User does not exist. Please register.');
      }

     
      if (availableSlotFlex !== 0 && type !== 'flexible') {
        setShowNavigateFlex(true);
        return;
      }else{setShowNavigateFlex(false);}

    } catch (error) {
      console.error('Error checking user existence:', error);
      setErrorMessage('Error checking user existence. Please try again.');
    }
  };
  
  console.log("check", showNavigateFlex)

  const handleNext = async () => {
    if (activeStep === 0 && !userExists) {
      setErrorMessage('Please enter a valid email and check user existence.');
      return;
    }
    try {

      if (availableSlot !== 0 && bookingId) {
        const bookingForm = bookingRequests.map((request, index) => ({
          courtId: selectedCourts[index] || null,
          branchId: branchId,
          slotDate: request.slotDate,
          timeSlot: {
            slotStartTime: request.timeSlot.slotStartTime,
            slotEndTime: request.timeSlot.slotEndTime,
          },
        }));

        const booking = await addTimeSlotIfExistBooking(bookingForm, bookingId);
        navigate("/confirm", {
          state: {
            bookingId: bookingId,
            bookingForm: bookingForm,
            userInfo: userInfo,
          }
        });
        await sendUnavailableSlotCheck();
        return;
      }

      if (type === 'flexible' && availableSlot === 0) {
        let id = null;
        try {
          setIsLoading(true);
          const bookingForm = bookingRequests.map((request, index) => ({
            courtId: selectedCourts[index] || null,
            branchId: branchId,
            slotDate: request.slotDate,
            timeSlot: {
              slotStartTime: request.timeSlot.slotStartTime,
              slotEndTime: request.timeSlot.slotEndTime,
            },
          }));
          console.log('Booking Faorm:', bookingForm);
          console.log('numberOfSlot:', numberOfSlot);
          const createBookingTypeFlex = await createBookingFlex(userInfo.userId, numberOfSlot, branchId);
          console.log("createBookingTypeFlex nè hehehe",createBookingTypeFlex)
          id = createBookingTypeFlex.bookingId;
          const booking = await reserveSlots(userInfo.userId, bookingForm);
          await sendUnavailableSlotCheck();
          // If reservation is successful, continue to the next step or navigate
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
          const tokenResponse = await generatePaymentToken(id);
          const token = tokenResponse.token;
          const paymentResponse = await processPayment("Staff",token);
          const paymentUrl = paymentResponse;

          window.location.href = paymentUrl;
          return;
        } catch (error) {
          console.error('Error processing payment:', error);
          setErrorMessage('Error processing payment. Please try again.');
          if (id) {
            try {
              await deleteBookingInFlex(id);
              console.log('Booking rolled back successfully');
            } catch (deleteError) {
              console.error('Error rolling back booking:', deleteError);
            }
          }
          setIsLoading(false);
        }
      }

      if (activeStep === 0) {
        setIsLoading(true); // Show loading page
        try {
          const bookingForm = bookingRequests.map((request, index) => ({
            courtId: selectedCourts[index] || null,
            branchId: branchId,
            slotDate: request.slotDate,
            timeSlot: {
              slotStartTime: request.timeSlot.slotStartTime,
              slotEndTime: request.timeSlot.slotEndTime,
            },
          }));
          setSignalRCourt(bookingForm.courtId);
          const booking = await reserveSlots(userInfo.userId, bookingForm);
         
          console.log('Booking:', booking);
          await sendAvailableSlotCheck();
          await sendUnavailableSlotCheck();
          const bookingId = booking.bookingId;
          const tokenResponse = await generatePaymentToken(bookingId);
          const token = tokenResponse.token;
          const paymentResponse = await processPayment("Staff",token);
          const paymentUrl = paymentResponse;

          window.location.href = paymentUrl;
        } catch (error) {
          console.error('Error processing payment:', error);
          setErrorMessage('Error processing payment. Please try again.');
          setIsLoading(false); // Hide loading page if there's an error
        }
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    } catch (error) {
      console.error('Error sending time slot to server:', error);
      setErrorMessage('Error sending time slot to server. Please try again.');
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            {!userChecked && (
              <Box sx={{ backgroundColor: "#E0E0E0", padding: '20px', borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom color="black">
                  Customer Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    sx={{ marginBottom: '10px', marginRight: '10px' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button variant="contained" color="primary" onClick={handleEmailCheck}>
                    Check
                  </Button>
                </Box>
                {errorMessage && (
                  <Typography variant="body2" color="error">
                    {errorMessage}
                  </Typography>
                )}
                {userExists && userInfo && (
                  <Box sx={{ backgroundColor: "#E0E0E0", padding: '20px', borderRadius: 2, marginTop: '20px' }}>
                    <Typography variant="h6" color="black">
                      <strong>Username:</strong> {userInfo.userName ? userInfo.userName : 'N/A'}
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Full Name:</strong> {userInfo.fullName ? userInfo.fullName : 'N/A'}
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Phone:</strong> {userInfo.phoneNumber ? userInfo.phoneNumber : 'N/A'}
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Coin:</strong> {userInfo.balance ? userInfo.balance : 'N/A'}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            <Box sx={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ backgroundColor: "#E0E0E0", padding: '20px', borderRadius: 2, maxHeight: '400px', overflowY: 'auto' }}>
                    <Typography variant="h5" gutterBottom color="black" display="flex" alignItems="center">
                      <PaymentIcon sx={{ marginRight: '8px' }} /> Payment Method
                    </Typography>
                    <FormControl component="fieldset">
                      <FormLabel component="legend" sx={{ color: 'black' }}>Payment Method</FormLabel>
                      <RadioGroup aria-label="payment method" name="paymentMethod">
                        {/* <FormControlLabel value="cash" control={<Radio />} label="Cash" sx={{ color: 'black' }} /> */}
                        <FormControlLabel value="creditCard" control={<Radio />} label="Credit Card" sx={{ color: 'black' }} checked />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ backgroundColor: "#E0E0E0", padding: '20px', borderRadius: 2 }}>
                    <Typography variant="h5" gutterBottom color="black">
                      Bill
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Branch ID:</strong> {branchId} {/* Thêm để hiển thị branch ID */}
                    </Typography>
                    <Typography variant="h6" color="black" sx={{ marginTop: '20px' }}>
                      <strong>Time Slot:</strong>
                    </Typography>
                    {bookingRequests && sortedBookingRequests.map((request, index) => (
                      <Box key={index} sx={{ marginBottom: '15px', padding: '10px', backgroundColor: '#FFFFFF', borderRadius: 2, boxShadow: 1 }}>
                        <Typography variant="body1" color="black">
                          <strong>Date:</strong> {request.slotDate}
                        </Typography>
                        <Typography variant="body1" color="black">
                          <strong>Start Time:</strong> {request.timeSlot.slotStartTime}
                        </Typography>
                        <Typography variant="body1" color="black">
                          <strong>End Time:</strong> {request.timeSlot.slotEndTime}
                        </Typography>
                        <Typography variant="body1" color="black">
                          <strong>Price:</strong> {request.price} USD {/* Thêm để hiển thị giá slot */}
                        </Typography>
                        <FormControl fullWidth>
                          <Select
                            value={selectedCourts[index] || ''}
                            displayEmpty
                            onChange={(e) => handleCourtSelection(index, e.target.value)}
                          >
                            <MenuItem value="">
                              <em>Choose Court</em>
                            </MenuItem>
                            {availableCourts[index] && availableCourts[index].map(court => (
                              <MenuItem key={court.courtId} value={court.courtId}>{court.courtName}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    ))}
                    <Divider sx={{ marginY: '10px' }} />
                    <Typography variant="h6" color="black">
                      <strong>Total Price:</strong> {totalPrice} USD {/* Thêm để hiển thị tổng giá */}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </>
        );
      case 1:
        return <LoadingPage />; // Hiển thị trang loading
      default:
        return 'Unknown step';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box m="20px" p="20px" sx={{ backgroundColor: "#F5F5F5", borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom color="black">
          Payment Details
        </Typography>
        <Stepper activeStep={activeStep} sx={{ marginBottom: '20px' }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {isLoading ? <LoadingPage /> : getStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ marginRight: '20px' }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={isLoading} // Disable button while loading
          >
            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Box>
      </Box>
          {/* Navigate to Flex */}
          
          {showNavigateFlex && (
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
            <div className="card">
              <h3 className="card__title">Notification!</h3>
              <p className="card__content">
                You now already have some remaining slots in booking type flex,
                we will navigate you. Please click the arrow button under.
              </p>
              <div className="card__date">
                {currentMonth + " " + currentDay + ", " + currentYear}
              </div>
              <div className="card__arrow">
                <svg
                  onClick={handleNavigate}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  height="15"
                  width="15"
                >
                  <path
                    fill="#fff"
                    d="M13.4697 17.9697C13.1768 18.2626 13.1768 18.7374 13.4697 19.0303C13.7626 19.3232 14.2374 19.3232 14.5303 19.0303L20.3232 13.2374C21.0066 12.554 21.0066 11.446 20.3232 10.7626L14.5303 4.96967C14.2374 4.67678 13.7626 4.67678 13.4697 4.96967C13.1768 5.26256 13.1768 5.73744 13.4697 6.03033L18.6893 11.25H4C3.58579 11.25 3.25 11.5858 3.25 12C3.25 12.4142 3.58579 12.75 4 12.75H18.6893L13.4697 17.9697Z"
                  ></path>
                </svg>
              </div>
            </div>
          
</Box>
        )}
    </ThemeProvider>
  );
};

export default PaymentDetail;
