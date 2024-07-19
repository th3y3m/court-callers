import React, { useEffect, useState } from "react";
import { Box, Typography, Select, MenuItem, FormControl, IconButton, Grid, Button } from "@mui/material";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { fetchBranches, fetchBranchById } from '../../../api/branchApi';
import { fetchPriceByBranchIDType } from '../../../api/priceApi'; // Updated import

dayjs.extend(isSameOrBefore);

const dayToNumber = {
  "Monday": 1,
  "Tuesday": 2,
  "Wednesday": 3,
  "Thursday": 4,
  "Friday": 5,
  "Saturday": 6,
  "Sunday": 7
};

const parseOpenDay = (openDay) => {
  if (!openDay || typeof openDay !== 'string') {
    console.error('Invalid openDay:', openDay);
    return [0, 0];
  }
  const days = openDay.split(' to ');
  if (days.length !== 2) {
    console.error('Invalid openDay format:', openDay);
    return [0, 0];
  }
  const [startDay, endDay] = days;
  return [dayToNumber[startDay], dayToNumber[endDay]];
};

const getDaysOfWeek = (startOfWeek, openDay) => {
  let days = [];
  const [startDay, endDay] = parseOpenDay(openDay);
  if (startDay === 0 || endDay === 0) {
    console.error('Invalid days parsed:', { startDay, endDay });
    return days;
  }

  for (var i = startDay; i <= endDay; i++) {
    days.push(dayjs(startOfWeek).add(i, 'day'));
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

const CalendarView = ({ selectedBranch, setSelectedBranch, onSlotSelect }) => {
  const [branches, setBranches] = useState([]);
  const [startOfWeek, setStartOfWeek] = useState(dayjs().startOf('week'));
  const [weekDays, setWeekDays] = useState([]);
  const [openTime, setOpentime] = useState('');
  const [closeTime, setClosetime] = useState('');
  const [openDay, setOpenDay] = useState('');
  const [morningTimeSlots, setMorningTimeSlots] = useState([]);
  const [afternoonTimeSlots, setAfternoonTimeSlots] = useState([]);
  const [showAfternoon, setShowAfternoon] = useState(false);
  const [price, setPrice] = useState(0); // Combined price state

  useEffect(() => {
    const fetchBranchesData = async () => {
      try {
        const response = await fetchBranches(1, 10);
        setBranches(response.items);
        setSelectedBranch('');
      } catch (error) {
        console.error('Error fetching branches data:', error);
      }
    };

    fetchBranchesData();
  }, []);

  useEffect(() => {
    const fetchBranchDetails = async () => {
      if (!selectedBranch) return;

      try {
        const response = await fetchBranchById(selectedBranch);
        setOpentime(response.openTime);
        setClosetime(response.closeTime);
        setOpenDay(response.openDay);
      } catch (error) {
        console.error('Error fetching branch details:', error);
      }
    };

    fetchBranchDetails();
  }, [selectedBranch]);

  useEffect(() => {
    if (openDay) {
      const days = getDaysOfWeek(startOfWeek, openDay);
      setWeekDays(days);
    }
  }, [openDay, startOfWeek]);

  useEffect(() => {
    if (openTime && '14:00:00') {
      const decimalOpenTime = timeStringToDecimal(openTime);
      const decimalCloseTime = timeStringToDecimal('14:00:00');
      const timeSlots = generateTimeSlots(decimalOpenTime, decimalCloseTime);
      setMorningTimeSlots(timeSlots);
    }
  }, [openTime]);

  useEffect(() => {
    if (closeTime && '14:00:00') {
      const decimalOpenTime = timeStringToDecimal('14:00:00');
      const decimalCloseTime = timeStringToDecimal(closeTime);
      const timeSlots = generateTimeSlots(decimalOpenTime, decimalCloseTime);
      setAfternoonTimeSlots(timeSlots);
    }
  }, [closeTime]);

  useEffect(() => {
    const fetchPrices = async () => {
      if (!selectedBranch) return;

      try {
        const response = await fetchPriceByBranchIDType(selectedBranch, 'Fix', null); // Update to use fetchPriceByBranchIDType
        setPrice(response); // Assuming response is a single price value
      } catch (error) {
        console.error('Error fetching prices', error);
      }
    };

    fetchPrices();
  }, [selectedBranch]);

  const handlePreviousWeek = async () => {
    const oneWeekBeforeCurrentWeek = dayjs().startOf('week').subtract(1, 'week');
    const oneWeekBeforeStartOfWeek = dayjs(startOfWeek).subtract(1, 'week');
  
    if (!dayjs(startOfWeek).isSame(oneWeekBeforeCurrentWeek, 'week') && oneWeekBeforeStartOfWeek.isAfter(oneWeekBeforeCurrentWeek)) {
      setStartOfWeek(oneWeekBeforeStartOfWeek);
    } else if (dayjs(startOfWeek).isSame(oneWeekBeforeCurrentWeek, 'week')) {
      setStartOfWeek(oneWeekBeforeCurrentWeek);
    }
  }

  const handleNextWeek = () => {
    setStartOfWeek(dayjs(startOfWeek).add(1, 'week'));
  };

  const handleToggleMorning = () => {
    setShowAfternoon(false);
  };

  const handleToggleAfternoon = () => {
    setShowAfternoon(true);
  };

  return (
    <Box m="20px" sx={{ backgroundColor: "#F5F5F5", borderRadius: 2, p: 2, width: '100%' }}>
      <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
        <FormControl sx={{ minWidth: 200, backgroundColor: "#0D1B34", borderRadius: 1 }}>
          <Select
            labelId="branch-select-label"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            displayEmpty
            sx={{ color: "#FFFFFF" }}
          >
            <MenuItem value="">
              <em>--Select Branch--</em>
            </MenuItem>
            {branches.map((branch) => (
              <MenuItem key={branch.branchId} value={branch.branchId}>
                {branch.branchId}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedBranch && (
          <Box display="flex" alignItems="center" sx={{ backgroundColor: "#E0E0E0", p: 1, borderRadius: 2 }}>
            <IconButton onClick={handlePreviousWeek} size="small">
              <ArrowBackIosIcon fontSize="inherit" />
            </IconButton>
            <Typography variant="h6" sx={{ color: "#0D1B34", mx: 1 }}>
              From {dayjs(startOfWeek).add(1, 'day').format('D/M')} To {dayjs(startOfWeek).add(7, 'day').format('D/M')}
            </Typography>
            <IconButton onClick={handleNextWeek} size="small">
              <ArrowForwardIosIcon fontSize="inherit" />
            </IconButton>
          </Box>
        )}

        <Box>
          <Button
            variant="contained"
            sx={{
              backgroundColor: showAfternoon ? "#FFFFFF" : "#0D1B34",
              color: showAfternoon ? "#0D1B34" : "white",
              mr: 1,
              textTransform: "none",
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
            }}
            onClick={handleToggleAfternoon}
          >
            Afternoon
          </Button>
        </Box>
      </Box>

      {weekDays.map((day, dayIndex) => (
        <Grid container spacing={3} key={dayIndex} alignItems="center"> {/* Increase vertical spacing */}
          <Grid item xs={1} padding="8px">
            <Box
              sx={{
                backgroundColor: "#0D61F2",
                color: "white",
                width: "100%",
                textAlign: "center",
                padding: "8px",
                borderRadius: "4px",
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Typography variant="body2" component="div">
                {day.format('ddd')}
              </Typography>
              <Typography variant="body2" component="div">
                {day.format('D/M')}
              </Typography>
            </Box>
          </Grid>

          {(showAfternoon ? afternoonTimeSlots : morningTimeSlots).map((slot, slotIndex) => {
            const [start, end] = slot.split(' - ');
            const slotStartTime = dayjs(`${day.format('YYYY-MM-DD')}T${start}`);
            const isPast = dayjs().isAfter(slotStartTime);

            return (
              <Grid item xs key={slotIndex}>
                <Button
                  sx={{
                    backgroundColor: isPast ? "#E0E0E0" : "#D9E9FF",
                    color: isPast ? "#FFFFFF" : "#0D1B34",
                    p: 2,
                    borderRadius: 2,
                    width: "100%",
                    textTransform: "none",
                    border: '1px solid #90CAF9',
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    mt: 1,  // Add margin-top to increase vertical spacing
                  }}
                  disabled={isPast}
                  m="10px"
                >
                  <Typography
                    sx={{
                      fontWeight: 'bold',
                      color: "#0D1B34"
                    }}
                  >
                    {slot}
                  </Typography>
                  <Typography
                    sx={{
                      color:"#0D1B34" 
                    }}
                  >
                    {price}k
                  </Typography>
                </Button>
              </Grid>
            );
          })}
        </Grid>
      ))}
    </Box>
  );
};

export default CalendarView;
