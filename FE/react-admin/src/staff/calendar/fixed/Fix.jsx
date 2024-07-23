import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField, FormControl, FormControlLabel, Checkbox, Grid, Paper, ThemeProvider, createTheme ,MenuItem  } from "@mui/material";
import CalendarView from './CalendarView';
import { fetchPriceByBranchIDType } from '../../../api/priceApi';
import { fetchUserDetailByEmail, fetchUserDetail, fetchUserDetailByEmailVer2 } from "../../../api/userApi"; // Import thêm các hàm API để kiểm tra email
import { fixDayOfWeekValidation, fixEndTimeValidation, fixMonthValidation, fixStartTimeValidation } from '../../../scenes/formValidation';
import '../../../scenes/validate.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#009B65',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    h4: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 500,
    },
    body1: {
      fontFamily: 'Roboto, sans-serif',
    },
  },
});

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
  const [numberOfMonths, setNumberOfMonths] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [userId, setUserId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [slotStartTime, setSlotStartTime] = useState('');
  const [slotEndTime, setSlotEndTime] = useState('');
  const [fixedPrice, setFixedPrice] = useState(0);
  const [email, setEmail] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [userInfo, setUserInfo] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranchPrices = async () => {
      if (branchId) {
        try {
          const price = await fetchPriceByBranchIDType(branchId, 'Fix', null);
          setFixedPrice(price);
        } catch (error) {
          console.error('Error fetching prices:', error);
        }
      }
    };

    fetchBranchPrices();
  }, [branchId]);

  const handleDayOfWeekChange = (event) => {
    const { value, checked } = event.target;
    setDaysOfWeek((prevDaysOfWeek) =>
      checked ? [...prevDaysOfWeek, value] : prevDaysOfWeek.filter((day) => day !== value)
    );
  };

  const handleCheck = async () => {
    if (!email) {
      setErrorMessage('Please enter an email address.');
      return;
    }
    try {
      const userData = await fetchUserDetailByEmail(email);
      if (userData && userData.length > 0) {
        const user = userData[0];
        const detailedUserInfo = await fetchUserDetailByEmailVer2(email);
        if (detailedUserInfo) {
          setUserExists(true);
          setUserId(user.id); // Cập nhật userId
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
          setErrorMessage('User information not found. Please try again.');
        }
      } else {
        setUserExists(false);
        setUserInfo(null);
        setErrorMessage('User not found. Please try again.');
      }
    } catch (error) {
      console.error('Error when checking user existence:', error);
      setErrorMessage('Error checking user existence. Please try again.');
    }
  };

  const result = getTotalDaysForWeekdays(daysOfWeek, numberOfMonths, startDate);
console.log(result);

  const handleSubmit = (event) => {
    event.preventDefault();

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

    const formattedStartDate = startDate.toISOString().split('T')[0];

    const totalDays = getTotalDaysForWeekdays(daysOfWeek, numberOfMonths, startDate);

    //array.reduce(callback(accumulator, currentValue, currentIndex, array), initialValue)
    
    const totalPrice = daysOfWeek.reduce((total, day) => {
      return total + (totalDays[day] * fixedPrice);
    }, 0);

    const bookingRequests = daysOfWeek.map(day => ({
      slotDate: formattedStartDate,
      timeSlot: {
        slotStartTime,
        slotEndTime,
      },
      price: fixedPrice,
    }));

    const state = {
      branchId,
      bookingRequests,
      totalPrice,
      userId, // Truyền cả userId
      email,  // và email
      numberOfMonths,
      daysOfWeek,
      startDate: formattedStartDate,
      type: 'fix',
      slotStartTime,
      slotEndTime,
    };

    console.log('state:', state);

    navigate("/fixed-payment", {
      state
    });
  };

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
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <Box sx={{ flex: 2, marginRight: 4 }}>
          <CalendarView selectedBranch={branchId} setSelectedBranch={setBranchId} />
        </Box>
        <Box sx={{ flex: 1, maxWidth: '400px', height: '100%' }}>
          <form onSubmit={handleSubmit}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant="h4" mb={2} sx={{ textAlign: 'center', color: 'primary.main', fontWeight: 'bold' }}>Fixed Booking</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ marginBottom: '10px', marginRight: '10px' }}
                  />
                  <Button variant="contained" color="primary" onClick={handleCheck}>
                    Check
                  </Button>
                  {errorMessage && (
                    <Typography variant="body2" color="error">
                      {errorMessage}
                    </Typography>
                  )}
                </Grid>
                {userExists && userInfo && (
                  <>
                    <Grid item xs={12}>
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
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <TextField
                          label="Number of Months"
                          type="number"
                          value={numberOfMonths}
                          onChange={(e) => setNumberOfMonths(e.target.value)}
                          required
                          InputLabelProps={{ style: { color: 'black' } }}
                          InputProps={{ style: { color: 'black' } }}
                        />
                        {monthValidation.message && (
                            <p className="errorVal">
                              {monthValidation.message}
                            </p>
                          )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography sx={{ color: 'black' }}>Day of Week:</Typography>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <FormControlLabel
                          key={day}
                          control={
                            <Checkbox
                              value={day}
                              onChange={handleDayOfWeekChange}
                              checked={daysOfWeek.includes(day)}
                              sx={{ color: 'primary.main' }}
                            />
                          }
                          label={day}
                          sx={{ color: 'black' }}
                        />
                      ))}
                      {dayOfWeekValidation.message && (
                          <p className="errorVal">
                            {dayOfWeekValidation.message}
                          </p>
                        )}
                    </Grid>
                    <Grid item xs={12}>
                      <Typography sx={{ color: 'black' }}>Start Date:</Typography>
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        dateFormat="yyyy-MM-dd"
                        required
                        popperPlacement="right-start"
                        minDate={new Date()}
                        customInput={<TextField sx={{ width: '100%' }} />}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <TextField
                          label="Branch ID"
                          type="text"
                          value={branchId}
                          onChange={(e) => setBranchId(e.target.value)}
                          required
                          disabled
                        />
                      </FormControl>
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
                      <Button variant="contained" color="primary" type="submit" fullWidth>Continue</Button>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </form>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default FixedBooking;
