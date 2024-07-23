import api from "./api";

const url = 'https://courtcaller.azurewebsites.net/api';

// Fetch available courts
export const fetchAvailableCourts = async (branchId, slotDate, slotStartTime, slotEndTime) => {
  try {
    const requestBody = {
      courtId: null,
      branchId,
      slotDate,
      timeSlot: {
        slotDate,
        slotStartTime,
        slotEndTime,
      },
    };

    const response = await api.post(`${url}/Courts/AvailableCourts`, requestBody);
    return response.data;
  } catch (error) {
    console.error('Error fetching available courts:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchCourtByBranchId = async (branchId, pageNumber = 1, pageSize = 10, searchQuery = '') => {
  try {
    const params = { pageNumber, pageSize, searchQuery, branchId };
    const response = await api.get(`${url}/Courts/GetCourtsByBranchId`, { params });

    if (response.data && Array.isArray(response.data.data)) {
      
      const items = response.data.data;
      const totalCount = response.data.total || 0;
      
      return {
        items,
        totalCount
      };
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('Error fetching branches data:', error.response ? error.response.data : error.message);
    throw error;
  }
};
