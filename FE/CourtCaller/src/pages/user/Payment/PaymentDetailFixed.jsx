import React, { useState, useEffect } from 'react';
import { Box, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Button, Stepper, Step, StepLabel, Typography, Divider, Grid, TextField } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PaymentIcon from '@mui/icons-material/Payment';
import { generatePaymentToken, processPayment } from 'api/paymentApi';
import { createFixedBooking } from 'api/bookingApi';
import LoadingPage from './LoadingPage';
import { processBalancePayment } from 'api/paymentApi';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import * as signalR from '@microsoft/signalr';


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
  const { email, userName, userId, branchId, bookingRequests, totalPrice, numberOfMonths, daysOfWeek, startDate, slotStartTime, slotEndTime } = location.state || {};
  const [userEmail, setUserEmail] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connection, setConnection] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  console.log('bookdata: ', branchId, bookingRequests, totalPrice, numberOfMonths, daysOfWeek, startDate, bookingRequests[0].slotDate, slotStartTime, slotEndTime);

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

  
  const handleNext = async (paymentMethod) => {
    if (activeStep === 0) {
      setIsLoading(true);
      try {
        const formattedStartDate = formatDate(startDate);

        const response = await createFixedBooking(
          numberOfMonths,
          daysOfWeek,
          formattedStartDate,
          userId,
          branchId,
          bookingRequests[0].slotDate,
          slotStartTime,
          slotEndTime
        );
        console.log('res', response)

        const bookingId = response.bookingId;
        const tokenResponse = await generatePaymentToken(bookingId);
        await sendUnavailableSlotCheck();
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
                {email}
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
                      <strong>Total Price:</strong> {totalPrice}K VND
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
