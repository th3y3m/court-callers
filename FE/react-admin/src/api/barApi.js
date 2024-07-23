import api from './api';
const url = 'https://courtcaller.azurewebsites.net/api';

const fetchRevenue = async (endpoint, branchId) => {
  try {
    const response = await api.get(`${url}/Bookings/${endpoint}`, {
      params: { branchId }
    });
    console.log(`Revenue for branch ${branchId}:`, response.data.revenue);
    return response.data;
  } catch (error) {
    console.error("An error occurred while calling the API", error);
    throw error;
  }
};

export const fetchDailyRevenue = (branchId) => fetchRevenue('daily-revenue', branchId);
export const fetchWeeklyRevenue = (branchId) => fetchRevenue('weekly-revenue', branchId);
export const fetchMonthlyRevenue = (branchId) => fetchRevenue('monthly-revenue', branchId);
export const fetchRevenueFromStartOfWeek = (branchId) => fetchRevenue('revenue-from-start-of-week', branchId);
export const fetchWeeklyRevenueFromStartOfMonth = (branchId) => fetchRevenue('weekly-revenue-from-start-of-month', branchId);
export const fetchMonthlyRevenueFromStartOfYear = (branchId) => fetchRevenue('monthly-revenue-from-start-of-year', branchId);
