import React, { useState, useEffect } from 'react';
import { Box, Typography, ButtonGroup, Button, useTheme } from '@mui/material';
import { tokens } from '../../theme';
import Header from '../../components/Header';
import LineChart from '../../components/LineChart';
import BarChart from '../../components/BarChart';
import PieChart from '../../components/PieChart';
import StatBox from '../../components/StatBox';
import TrafficIcon from '@mui/icons-material/Traffic';
import axios from 'axios';

const mockWeeklyBookings = [
  {
    id: 'Bookings',
    color: 'hsl(210, 70%, 50%)',
    data: [
      { x: 'Monday', y: 20 },
      { x: 'Tuesday', y: 10 },
      { x: 'Wednesday', y: 7 },
      { x: 'Thursday', y: 20 },
      { x: 'Friday', y: 10 },
      { x: 'Saturday', y: 11 },
      { x: 'Sunday', y: 20 },
    ],
  },
];

const mockMonthlyBookings = [
  {
    id: 'Bookings',
    color: 'hsl(348, 70%, 50%)',
    data: [
      { x: 'January', y: 20 },
      { x: 'February', y: 40 },
      { x: 'March', y: 10 },
      { x: 'April', y: 20 },
      { x: 'May', y: 20 },
      { x: 'June', y: 25 },
      { x: 'July', y: 10 },
      { x: 'August', y: 25 },
      { x: 'September', y: 24 },
      { x: 'October', y: 17 },
      { x: 'November', y: 24 },
      { x: 'December', y: 14 },
    ],
  },
];

const mockRecentTransactions = [
  { bookingId: 'TXN001', user: 'User1', bookingDate: '2024-07-01', totalPrice: 100 },
  { bookingId: 'TXN002', user: 'User2', bookingDate: '2024-07-02', totalPrice: 150 },
  { bookingId: 'TXN003', user: 'User3', bookingDate: '2024-07-03', totalPrice: 200 },
];

const mockUserStats = {
  totalUsers: 10,
  activeUsers: 20,
  newUsers: 3,
};

const mockRevenueStats = {
  daily: 1000,
  weekly: 7000,
  monthly: 30000,
  yearly: 360000,
};

const mockCourtPopularity = [
  { court: 'Court 1', count: 150 },
  { court: 'Court 2', count: 200 },
  { court: 'Court 3', count: 100 },
];

const mockFeedback = [
  { user: 'User1', rating: 4, comment: 'Great court!' },
  { user: 'User2', rating: 5, comment: 'Excellent service!' },
  { user: 'User3', rating: 3, comment: 'Average experience.' },
];

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [dailyBookings, setDailyBookings] = useState([]);
  const [dailyBookingsCount, setDailyBookingsCount] = useState(0);
  const [dailyIncrease, setDailyIncrease] = useState(0);
  const [weeklyBookings, setWeeklyBookings] = useState(mockWeeklyBookings);
  const [monthlyBookings, setMonthlyBookings] = useState(mockMonthlyBookings);
  const [recentTransactions, setRecentTransactions] = useState(mockRecentTransactions);
  const [predictedBookings, setPredictedBookings] = useState(null);
  const [userStats, setUserStats] = useState(mockUserStats);
  const [revenueStats, setRevenueStats] = useState(mockRevenueStats);
  const [courtPopularity, setCourtPopularity] = useState(mockCourtPopularity);
  const [feedback, setFeedback] = useState(mockFeedback);
  const [chartType, setChartType] = useState('monthly'); // Trạng thái biểu đồ hiện tại
  const [growthRate, setGrowthRate] = useState(0);

  useEffect(() => {
    const fetchDailyBookings = async () => {
      try {
        const response = await axios.get('https://courtcaller.azurewebsites.net/api/Bookings/daily-bookings');
        setDailyBookings(response.data.data);
        setDailyBookingsCount(response.data.total);

        const weeklyResponse = await axios.get('https://courtcaller.azurewebsites.net/api/Bookings/weekly-bookings');
        const weeklyAverage = weeklyResponse.data.total / 7;
        setDailyIncrease(((response.data.total - weeklyAverage) / weeklyAverage) * 100);
      } catch (error) {
        console.error('Error fetching daily bookings:', error);
      }
    };

    fetchDailyBookings();
  }, []);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const response = await axios.get('https://localhost:7104/api/Training/weekly-growth');
        setPredictedBookings(response.data.predictedCount);
        setGrowthRate(response.data.growthRate);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching prediction:', error);
      }
    };

    fetchPrediction();
  }, []);

  const getChartData = () => {
    switch (chartType) {
      case 'daily':
        return [{
          id: 'Daily Bookings',
          color: 'hsl(210, 70%, 50%)',
          data: dailyBookings.map((booking) => ({
            x: new Date(booking.bookingDate).toLocaleDateString(),
            y: booking.totalPrice,
          })),
        }];
      case 'weekly':
        return weeklyBookings;
      case 'monthly':
      default:
        return monthlyBookings;
    }
  };
  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Manage your badminton court bookings with advanced analytics" />
      </Box>

      {/* GRID & CHARTS */}
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gridAutoRows="minmax(140px, auto)" gap="20px">
        {/* ROW 1 */}
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={dailyBookingsCount.toString()}
            subtitle="Daily Bookings"
            progress="0.75"
            increase={isNaN(dailyIncrease) ? "N/A" : `${dailyIncrease.toFixed(2)}%`}
            icon={<TrafficIcon sx={{ color: colors.greenAccent[600], fontSize: '26px' }} />}
          />
        </Box>
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={weeklyBookings.reduce((sum, booking) => sum + booking.data.reduce((subSum, d) => subSum + d.y, 0), 0).toString()}
            subtitle="Weekly Bookings"
            progress="0.50"
            increase="+5%"
            icon={<TrafficIcon sx={{ color: colors.greenAccent[600], fontSize: '26px' }} />}
          />
        </Box>
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={monthlyBookings.reduce((sum, booking) => sum + booking.data.reduce((subSum, d) => subSum + d.y, 0), 0).toString()}
            subtitle="Monthly Bookings"
            progress="0.30"
            increase="+5%"
            icon={<TrafficIcon sx={{ color: colors.greenAccent[600], fontSize: '26px' }} />}
          />
        </Box>
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={predictedBookings ? predictedBookings.toString() : "Loading..."}
            subtitle="Predicted Bookings"
            progress="0.80"
            increase= {growthRate ? `${growthRate.toFixed(2)}%` : "Loading..." }
            icon={<TrafficIcon sx={{ color: colors.greenAccent[600], fontSize: '26px' }} />}
          />
        </Box>

        {/* ROW 2 */}
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={userStats.totalUsers.toString()}
            subtitle="Total Users"
            progress="0.90"
            increase="+15%"
            icon={<TrafficIcon sx={{ color: colors.greenAccent[600], fontSize: '26px' }} />}
          />
        </Box>
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={userStats.activeUsers.toString()}
            subtitle="Active Users"
            progress="0.85"
            increase="+10%"
            icon={<TrafficIcon sx={{ color: colors.greenAccent[600], fontSize: '26px' }} />}
          />
        </Box>
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={userStats.newUsers.toString()}
            subtitle="New Users"
            progress="0.70"
            increase="+20%"
            icon={<TrafficIcon sx={{ color: colors.greenAccent[600], fontSize: '26px' }} />}
          />
        </Box>
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={`$${revenueStats.daily}`}
            subtitle="Daily Revenue"
            progress="0.80"
            increase="+12%"
            icon={<TrafficIcon sx={{ color: colors.greenAccent[600], fontSize: '26px' }} />}
          />
        </Box>

        {/* ROW 3 */}
        <Box gridColumn="span 12" backgroundColor={colors.primary[400]} p="20px">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
              {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Bookings
            </Typography>
            <ButtonGroup variant="contained" color="primary">
              <Button onClick={() => setChartType('daily')}>Daily</Button>
              <Button onClick={() => setChartType('weekly')}>Weekly</Button>
              <Button onClick={() => setChartType('monthly')}>Monthly</Button>
            </ButtonGroup>
          </Box>
          <Box height="250px" mt="20px">
            <LineChart data={getChartData()} />
          </Box>
        </Box>


      {/* ROW 4 */}
      <Box gridColumn="span 6" backgroundColor={colors.primary[400]}>
        <Box mt="20px" p="0 30px" display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
              Revenue Breakdown
            </Typography>
          </Box>
        </Box>
        <Box height="250px" m="-20px 0 0 0">
          <PieChart data={monthlyBookings} />
        </Box>
      </Box>

      <Box gridColumn="span 6" backgroundColor={colors.primary[400]} overflow="auto">
        <Box display="flex" justifyContent="space-between" alignItems="center" borderBottom={`4px solid ${colors.primary[500]}`} p="15px">
          <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
            Recent Transactions
          </Typography>
        </Box>
        {recentTransactions.map((transaction, i) => (
          <Box key={`${transaction.bookingId}-${i}`} display="flex" justifyContent="space-between" alignItems="center" borderBottom={`4px solid ${colors.primary[500]}`} p="15px">
            <Box>
              <Typography color={colors.greenAccent[500]} variant="h5" fontWeight="600">
                {transaction.bookingId}
              </Typography>
              <Typography color={colors.grey[100]}>{transaction.user}</Typography>
            </Box>
            <Box color={colors.grey[100]}>{new Date(transaction.bookingDate).toLocaleDateString()}</Box>
            <Box backgroundColor={colors.greenAccent[500]} p="5px 10px" borderRadius="4px">
              ${transaction.totalPrice}
            </Box>
          </Box>
        ))}
      </Box>

        {/* ROW 5 */}
        <Box gridColumn="span 6" backgroundColor={colors.primary[400]}>
          <Box mt="20px" p="0 30px" display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
                Court Popularity
              </Typography>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <BarChart data={courtPopularity} />
          </Box>
        </Box>

        <Box gridColumn="span 6" backgroundColor={colors.primary[400]} overflow="auto">
          <Box display="flex" justifyContent="space-between" alignItems="center" borderBottom={`4px solid ${colors.primary[500]}`} p="15px">
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              User Feedback
            </Typography>
          </Box>
          <Box mt="20px">
            <Typography variant="h6" fontWeight="600" color={colors.grey[100]}>
              Feedback Count: {feedback.length}
            </Typography>
            {feedback.map((feedback, i) => (
              <Box key={`${feedback.user}-${i}`} p="10px" m="10px" border={`1px solid ${colors.grey[400]}`}>
                <Typography color={colors.grey[100]}>User: {feedback.user}</Typography>
                <Typography color={colors.grey[100]}>Rating: {feedback.rating}</Typography>
                <Typography color={colors.grey[100]}>Comment: {feedback.comment}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
