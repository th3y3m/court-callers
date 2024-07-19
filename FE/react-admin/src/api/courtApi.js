import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchCourts = async (pageNumber = 1, pageSize = 10, searchQuery = '') => {
  try {
    const response = await axios.get(`${url}/Courts`, {
      params: {
        pageNumber,
        pageSize,
        searchQuery
      }
    });

    if (Array.isArray(response.data)) {
      const items = response.data;
      const totalCount = parseInt(response.headers['x-total-count'], 10) || 100;

      return {
        items,
        totalCount
      };
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('Error fetching courts data:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateCourtById = async (id, updatedData) => {
  try {
    const response = await axios.put(`${url}/Courts/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error('Error updating court:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const createCourt = async (courtData) => {
  try {
    const response = await axios.post(`${url}/Courts`, courtData);
    return response.data;
  } catch (error) {
    console.error('Error creating court:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteCourtById = async (id) => {
  try {
    const response = await axios.delete(`${url}/Courts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting court:', error.response ? error.response.data : error.message);
    throw error;
  }
};

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

    const response = await axios.post(`${url}/Courts/AvailableCourts`, requestBody);
    return response.data;
  } catch (error) {
    console.error('Error fetching available courts:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchCourtByBranchId = async (branchId, pageNumber = 1, pageSize = 10, searchQuery = '') => {
  try {
    const params = { pageNumber, pageSize, searchQuery, branchId };
    const response = await axios.get(`${url}/Courts/GetCourtsByBranchId`, { params });

    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('Error fetching branches data:', error.response ? error.response.data : error.message);
    throw error;
  }
};
