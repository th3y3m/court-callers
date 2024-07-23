// bookingApi.js
import axios from 'axios';
import api from './api';
const url = 'https://courtcaller.azurewebsites.net/api';


export const checkBookingTypeFlex = async (userId, branchId) => {
  try {
    const params = { userId, branchId };
    const response = await api.get(`${url}/Bookings/checkbookingtypeflex`, { params });
    return response.data;
  } catch (error) {
    console.error('Error checking booking type flex:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Fetch bookings with pagination and optional search query
export const fetchBookings = async (pageNumber = 1, pageSize = 10, searchQuery = '') => {
  try {
    const params = { pageNumber, pageSize, searchQuery };
    const response = await api.get(`${url}/Bookings`, { params });

    if (response.data && Array.isArray(response.data.data)) {
      const items = response.data.data;
      const totalCount = response.data.total || 0;
      return { items, totalCount };
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('Error fetching bookings data:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Delete a booking by ID
export const deleteBooking = async (id) => {
  try {
    const response = await api.delete(`${url}/Bookings/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting booking:', error.response ? error.response.data : error.message);
    throw error;
  }
};

//cancel a booking by ID
export const cancelBooking = async (id) => {
  try {
    const response = await api.delete(`${url}/Bookings/cancel/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting booking:', error.response ? error.response.data : error.message);
    throw error;
  }
};


// Reserve slots for a user
export const reserveSlots = async (userId, bookings) => {
  try {
    const response = await api.post(`${url}/Bookings/reserve-slot?userId=${userId}`, bookings);
    return response.data;
  } catch (error) {
    console.error('Error reserving slots', error);
    throw error;
  }
};

// Fetch booking by ID
export const fetchBookingById = async (bookingId) => {
  try {
    const response = await api.get(`${url}/Bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking by ID:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Create a flexible booking
export const createBookingFlex = async (userId, numberOfSlot, branchId) => {
  try {
    const response = await api.post(`${url}/Bookings/flex`, null, {
      params: {
        userId,
        numberOfSlot,
        branchId
      }
    });
    console.log('Response:', response);
    return response.data;
  } catch (error) {
    console.error('Error creating flexible booking:', error.response ? error.response.data : error.message);
    throw error;
  }
};


const isValidTime = (time) => {
  const timePattern = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  return timePattern.test(time);
};

export const createFixedBooking = async (numberOfMonths, daysOfWeek, formattedStartDate, userId, branchId, slotDate, slotStartTime, slotEndTime) => {
  try {
    // Check if slotStartTime and slotEndTime are valid
    if (!isValidTime(slotStartTime) || !isValidTime(slotEndTime)) {
      throw new Error('Invalid time format. Time should be in HH:MM:SS format.');
    }

    const params = new URLSearchParams();
    params.append('numberOfMonths', numberOfMonths);
    daysOfWeek.forEach(day => {
      params.append('dayOfWeek', day);
    });
    params.append('startDate', formattedStartDate);
    params.append('userId', userId);
    params.append('branchId', branchId);

    const urlWithParams = `${url}/Bookings/fix-slot?${params.toString()}`;

    console.log('URL with params:', urlWithParams);
    console.log('Request body:', {
      slotDate,
      slotStartTime,
      slotEndTime,
    });

    const response = await api.post(
      urlWithParams,
      [{
        slotDate,
        slotStartTime,
        slotEndTime,
      }],
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('General Error:', error.message);
    }
    throw new Error('Error creating fixed booking. Please check the logs for more details.');
  }
};

export const deleteBookingInFlex = async (id) => {
  try {
    const response = await api.delete(`${url}/Bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting booking:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Hàm lấy thông tin người dùng bằng user ID
export const fetchUserEmailById = async (userId) => {
  try {
    const response = await api.get(`${url}/Users/${userId}`);
    return response.data.email;
  } catch (error) {
    console.error('Error fetching user email:', error.response ? error.response.data : error.message);
    throw error;
  }
};