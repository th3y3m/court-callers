import React, { useState, useEffect } from 'react';
import { Box, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Button, Stepper, Step, StepLabel, Typography, Divider, Grid, TextField } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PaymentIcon from '@mui/icons-material/Payment';
import { generatePaymentToken, processPayment } from 'api/paymentApi';
import { createFixedBooking } from 'api/bookingApi';
import LoadingPage from './LoadingPage';
import { processBalancePayment } from 'api/paymentApi';

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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const PaymentDetailFixed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { branchId, bookingRequests, totalPrice, numberOfMonths, daysOfWeek, startDate, slotStartTime, slotEndTime } = location.state || {};
  const [userId, setUserId] = useState('');
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  console.log('bookdata: ', branchId, bookingRequests, totalPrice, numberOfMonths, daysOfWeek, startDate, bookingRequests[0].slotDate, slotStartTime, slotEndTime)

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const decoded = jwtDecode(token);
      setUserEmail(decoded.email)

      const fetchUserData = async (id, isGoogle) => {
        try {
          if (isGoogle) {
            const response = await axios.get(
              `https://courtcaller.azurewebsites.net/api/UserDetails/GetUserDetailByUserEmail/${id}`
            );
            setUserData(response.data);
            setUserName(response.data.fullName)
            const userResponse = await axios.get(
              `https://courtcaller.azurewebsites.net/api/Users/GetUserDetailByUserEmail/${id}?searchValue=${id}`
            );
            setUser(userResponse.data);

          } else {
            const response = await axios.get(
              `https://courtcaller.azurewebsites.net/api/UserDetails/${id}`
            );
            setUserData(response.data);
            setUserName(response.data.fullName)
            const userResponse = await axios.get(
              `https://courtcaller.azurewebsites.net/api/Users/${id}`
            );
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
  
  const handleNext = async (paymentMethod) => {
    if (activeStep === 0) {
      setIsLoading(true);
      try {
        const formattedStartDate = formatDate(startDate);

        const response = await createFixedBooking(
          numberOfMonths,
          daysOfWeek,
          formattedStartDate,
          userData.userId,
          branchId,
          bookingRequests[0].slotDate,
          slotStartTime,
          slotEndTime
        );
        console.log('res', response)

        const bookingId = response.bookingId;
        const tokenResponse = await generatePaymentToken(bookingId);
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
          const paymentResponse = await processPayment(token);
          const paymentUrl = paymentResponse;
          window.location.href = paymentUrl;
          return;
        }

      } catch (error) {
        console.error('Error processing payment:', error);
        setErrorMessage('Error processing payment. Please try again.');
        setIsLoading(false);
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
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
            <Box sx={{ backgroundColor: "#E0E0E0", padding: '20px', borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom color="black">
                Customer Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <strong>{userName}</strong>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {userEmail}
              </Box>
            </Box>

            <Box sx={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ backgroundColor: "#E0E0E0", padding: '20px', borderRadius: 2, maxHeight: '400px', overflowY: 'auto' }}>
                    <Typography variant="h5" gutterBottom color="black" display="flex" alignItems="center">
                      <PaymentIcon sx={{ marginRight: '8px' }} /> Payment Method
                    </Typography>
                    <FormControl component="fieldset">
                      <FormLabel component="legend" sx={{ color: 'black' }}>Choose Payment Method</FormLabel>
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
                <Grid item xs={12} md={6}>
                  <Box sx={{ backgroundColor: "#E0E0E0", padding: '20px', borderRadius: 2 }}>
                    <Typography variant="h5" gutterBottom color="black">
                      Invoice
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Branch ID:</strong> {branchId}
                    </Typography>
                    <Typography variant="h6" color="black" sx={{ marginTop: '20px' }}>
                      <strong>Number of Months:</strong> {numberOfMonths}
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Days of Week:</strong> {daysOfWeek.join(', ')}
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Start Date:</strong> {startDate}
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Slot Start Time:</strong> {slotStartTime}
                    </Typography>
                    <Typography variant="h6" color="black">
                      <strong>Slot End Time:</strong> {slotEndTime}
                    </Typography>
                    <Divider sx={{ marginY: '10px' }} />
                    <Typography variant="h6" color="black">
                      <strong>Total Price:</strong> {totalPrice} VND
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </>
        );
      case 1:
        return <LoadingPage />;
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
            style={{ marginLeft: "1125px" }}
            variant="contained"
            color="primary"
            onClick={() => handleNext("Balance")}
            disabled={isLoading || selectedPaymentMethod !== 'Balance'} // Disable button while loading or if Balance is not selected
          >
            {activeStep === steps.length - 1 ? "Finish" : "By Balance"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleNext("CreditCard")}
            disabled={isLoading || selectedPaymentMethod !== 'creditCard'} // Disable button while loading or if Credit Card is not selected
          >
            {activeStep === steps.length - 1 ? "Finish" : "VNPay"}
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default PaymentDetailFixed;
