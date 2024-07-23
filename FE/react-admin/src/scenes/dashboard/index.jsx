import React, { useState, useEffect } from 'react';
import { Box, Typography, ButtonGroup, Button, useTheme, FormControl, Select, MenuItem } from '@mui/material';
import { tokens } from '../../theme';
import Header from '../../components/Header';
import LineChart from '../../components/LineChart';
import BarChart from '../../components/BarChart';
import StatBox from '../../components/StatBox';
import TrafficIcon from '@mui/icons-material/Traffic';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { fetchBranches } from './../../api/branchApi';
import axios from 'axios';

import api from './../../api/api';
import {
  fetchDailyRevenue,
  fetchWeeklyRevenue,
  fetchMonthlyRevenue,
  fetchRevenueFromStartOfWeek,
  fetchWeeklyRevenueFromStartOfMonth,
  fetchMonthlyRevenueFromStartOfYear
} from '../../api/barApi';


const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [startDailyBookings, setStartDailyBookings] = useState([]);
  const [startWeeklyBookings, setStartWeeklyBookings] = useState([]);
  const [startMonthlyBookings, setStartMonthlyBookings] = useState([]);
  const [dailyBookingsCount, setDailyBookingsCount] = useState(0);
  const [dailyIncrease, setDailyIncrease] = useState(0);
 const [weeklyIncrease, setWeeklyIncrease] = useState(0);
  const [weeklyBookingsCount, setWeeklyBookingsCount] = useState(0);
  const [monthlyBookingsCount, setMonthlyBookingsCount] = useState(0);
  const [monthlyIncrease, setMonthlyIncrease] = useState(0);
  
const [countUser, setCountUser] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState('');
 const [branches, setBranches] = useState([]);
 const [chartType, setChartType] = useState('monthly');
  const [barType, setBarType] = useState('monthly');
  const [growthRate, setGrowthRate] = useState(0);
  const [barChartData, setBarChartData] = useState([]);
  const [selectedBranchBarChart, setSelectedBranchBarChart] = useState('');
  const [newBarChartData, setNewBarChartData] = useState([]);

  const fetchDailyBookings = async (branchId) => {
    try {
      const response = await api.get(`/Bookings/daily-bookings?branchId=${branchId || ''}`);
    setDailyBookingsCount(response.data.todayCount);
    setDailyIncrease(response.data.changePercentage);

    const lineDaily = await api.get(`/Bookings/bookings-from-start-of-week?branchId=${branchId || ''}`);
    setStartDailyBookings(lineDaily.data);

    const weeklyResponse = await api.get(`/Bookings/weekly-bookings?branchId=${branchId || ''}`);
    
    setWeeklyIncrease(weeklyResponse.data.changePercentage);
    setWeeklyBookingsCount(weeklyResponse.data.todayCount);

    const lineWeekly = await api.get(`/Bookings/weekly-bookings-from-start-of-month?branchId=${branchId || ''}`);
    setStartWeeklyBookings(lineWeekly.data);

    const monthlyResponse = await api.get(`/Bookings/monthly-bookings?branchId=${branchId || ''}`);
    setMonthlyBookingsCount(monthlyResponse.data.todayCount);
    setMonthlyIncrease(monthlyResponse.data.changePercentage);

    const lineMonthly = await api.get(`/Bookings/monthly-bookings-from-start-of-year?branchId=${branchId || ''}`);
    setStartMonthlyBookings(lineMonthly.data);


    const userCounting = await api.get(`/UserDetails/CountUser`);
    setCountUser(userCounting.data);
    } catch (error) {
      console.error('Error fetching daily bookings:', error);
    }
  };
  useEffect(() => {
    fetchDailyBookings(null);
    fetchBarChartData(barType, null);
  }, [barType]);

  const fetchBarChartData = async (type, branchId) => {
    try {
      const branchesData = await fetchBranches();
      const branchRevenues = await Promise.all(
        branchesData.items.map(async (branch) => {
          let revenueData;
          switch (type) {
            case 'weekly':
              revenueData = await fetchWeeklyRevenue(branch.branchId, branchId || '');
              break;
            case 'monthly':
              revenueData = await fetchMonthlyRevenue(branch.branchId, branchId || '');
              break;
            case 'daily':
            default:
              revenueData = await fetchDailyRevenue(branch.branchId, branchId || '');
              break;
          }
          return { id: branch.branchId, value: revenueData.revenue };
        })
      );
      setBarChartData(branchRevenues);
    } catch (error) {
      console.error("Error occurred while fetching branch data", error);
    }
  };
  
  useEffect(() => {
    if (selectedBranch) {
      fetchDailyBookings(selectedBranch);
      fetchBarChartData(barType, selectedBranch);
    }
  }, [barType, selectedBranch]);

  useEffect(() => {
    const fetchBranchesData = async () => {
      try {
        const response = await fetchBranches(1, 10);
        setBranches(response.items);
        setSelectedBranch('');
        console.log('Branches:', response.items);
      } catch (error) {
        console.error('Error fetching branches data:', error);
      }
    };

    fetchBranchesData();
  }, []);

  useEffect(() => {
    const fetchNewBarChartData = async () => {
      if (!selectedBranchBarChart) return;

      const fetchFunction = {
        daily: fetchRevenueFromStartOfWeek,
        weekly: fetchWeeklyRevenueFromStartOfMonth,
        monthly: fetchMonthlyRevenueFromStartOfYear
      }[barType];

      try {
        const result = await fetchFunction(selectedBranchBarChart);
        let labels;
        switch (barType) {
          case 'daily':
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            break;
          case 'weekly':
            labels = ['W1', 'W2', 'W3', 'W4'];
            break;
          case 'monthly':
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            break;
          default:
            labels = result.map((_, index) => `Data ${index + 1}`);
        }
        const processedData = result.map((value, index) => ({
          id: labels[index] || `Data ${index + 1}`,
          value: value !== undefined && value !== null ? value : 0
        }));
        setNewBarChartData(processedData);
      } catch (error) {
        console.error("Error occurred while fetching revenue data", error);
      }
    };

    fetchNewBarChartData();
  }, [barType, selectedBranchBarChart]);

  const getChartData = () => {
    switch (chartType) {
      case 'daily':
        return [{
          id: 'Daily Bookings',
          color: 'hsl(210, 70%, 50%)',
          data: startDailyBookings.map((count, index) => ({
            x: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index],
            y: count,
          })),
        }];
      case 'weekly':
        return [{
          id: 'Weekly Bookings',
          color: 'hsl(348, 70%, 50%)',
          data: startWeeklyBookings.map((count, index) => ({
            x: `Week ${index + 1}`,
            y: count,
          })),
        }];
      case 'monthly':
        return [{
          id: 'Monthly Bookings',
          color: 'hsl(348, 70%, 50%)',
          data: startMonthlyBookings.map((count, index) => ({
            x: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][index],
            y: count,
          })),
        }]

      default:
        return weeklyIncrease;
    }
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Manage your badminton court bookings with advanced analytics" />
      </Box>
      <FormControl sx={{ minWidth: 200, backgroundColor: "#0D1B34", borderRadius: 1, marginBottom: "20px" }}>
        <Select
          labelId="branch-select-label"
          value={selectedBranch}
          onChange={(e) => {
            setSelectedBranch(e.target.value);
            fetchDailyBookings(e.target.value);
          }}
          displayEmpty
          sx={{ color: "#FFFFFF" }}
        >
          <MenuItem value="">
            <em>--Select Branch--</em>
          </MenuItem>
          {branches.map((branch) => (
            <MenuItem key={branch.branchId} value={branch.branchId}>
              {branch.branchName} {/* Display branchName instead of branchId */}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* GRID & CHARTS */}
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gridAutoRows="minmax(140px, auto)" gap="20px">
        {/* ROW 1 */}
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={dailyBookingsCount || "N/A"}
            subtitle="Today's Bookings"
            progress={dailyIncrease / 100}
            increase={isNaN(dailyIncrease) ? "N/A" : `${dailyIncrease.toFixed(2)}%`}
            icon={<TrafficIcon sx={{ color: colors.greenAccent[600], fontSize: '26px' }} />}
          />
        </Box>
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={weeklyBookingsCount || "N/A"}
            subtitle="This Week's Bookings"
            progress={weeklyIncrease / 100}
            increase={isNaN(weeklyIncrease) ? "N/A" : `${weeklyIncrease.toFixed(2)}%`}
            icon={<TrafficIcon sx={{ color: colors.greenAccent[600], fontSize: '26px' }} />}
          />
        </Box>
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={monthlyBookingsCount || "N/A"}
            subtitle="This Month's Bookings"
            progress={monthlyIncrease / 100}
            increase={isNaN(monthlyIncrease) ? "N/A" : `${monthlyIncrease.toFixed(2)}%`}
            icon={<TrafficIcon sx={{ color: colors.greenAccent[600], fontSize: '26px' }} />}
          />
        </Box>
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={countUser || "N/A"}
            subtitle="Total User"
            // progress="0.80"
           // increase={growthRate ? `${growthRate.toFixed(2)}%` : "Loading..."}
            icon={<AccountCircleIcon sx={{ color: colors.greenAccent[600], fontSize: '26px' }} />}
          />
        </Box>

        {/* ROW 2 */}
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

        {/* ROW 3 */}
        <Box gridColumn="span 12" backgroundColor={colors.primary[400]} p="20px">
          <ButtonGroup variant="contained" color="primary">
            <Button onClick={() => setBarType('daily')}>Daily</Button>
            <Button onClick={() => setBarType('weekly')}>Weekly</Button>
            <Button onClick={() => setBarType('monthly')}>Monthly</Button>
          </ButtonGroup>
          <Box height="250px" mt="20px">
            <BarChart data={barChartData} />
          </Box>
        </Box>

        {/* ROW 4 */}
        <Box gridColumn="span 12" backgroundColor={colors.primary[400]} p="20px">
          <FormControl sx={{ minWidth: 200, backgroundColor: "#0D1B34", borderRadius: 1, marginBottom: "20px" }}>
            <Select
              labelId="branch-select-bar-label"
              value={selectedBranchBarChart}
              onChange={(e) => setSelectedBranchBarChart(e.target.value)}
              displayEmpty
              sx={{ color: "#FFFFFF" }}
            >
              <MenuItem value="">
                <em>--Select Branch--</em>
              </MenuItem>
              {branches.map((branch) => (
                <MenuItem key={branch.branchId} value={branch.branchId}>
                  {branch.branchName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* <ButtonGroup variant="contained" color="primary" >
            <Button onClick={() => setBarType('daily')}>Daily</Button>
            <Button onClick={() => setBarType('weekly')}>Weekly</Button>
            <Button onClick={() => setBarType('monthly')}>Monthly</Button>
          </ButtonGroup> */}
          <Box height="250px" mt="20px">
            <BarChart data={newBarChartData} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
