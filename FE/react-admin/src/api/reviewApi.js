import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

const handleError = (error, action) => {
  console.error(`Error ${action}:`, error.response ? error.response.data : error.message);
  throw error;
};

export const fetchReviews = async (pageNumber = 1, pageSize = 10, searchQuery = '') => {
  try {
    const params = { pageNumber, pageSize, searchQuery };
    const response = await axios.get(`${url}/Reviews`, { params });

    if (response.data && Array.isArray(response.data.data)) {
      return {
        items: response.data.data,
        totalCount: response.data.total || 0
      };
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    handleError(error, 'fetching reviews data');
  }
};

export const createReview = async (reviewData) => {
  try {
    const response = await axios.post(`${url}/Reviews`, reviewData);
    return response.data;
  } catch (error) {
    handleError(error, 'creating review');
  }
};

export const updateReview = async (id, reviewData) => {
  try {
    const response = await axios.put(`${url}/Reviews/${id}`, reviewData);
    return response.data;
  } catch (error) {
    handleError(error, 'updating review');
  }
};

export const deleteReview = async (id) => {
  try {
    const response = await axios.delete(`${url}/Reviews/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, 'deleting review');
  }
};

// New function to fetch user email by ID
export const fetchUserEmailById = async (userId) => {
  try {
    const response = await axios.get(`${url}/Users/${userId}`);
    return response.data.email;
  } catch (error) {
    handleError(error, 'fetching user email');
  }
};