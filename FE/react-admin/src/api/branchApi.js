
import api from './api';
const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchBranches = async (pageNumber = 1, pageSize = 10, searchQuery = '') => {
  try {
    const params = { pageNumber, pageSize, searchQuery };
    const response = await api.get(`${url}/Branches`, { params });

    if (response.data && Array.isArray(response.data.data)) {
      const items = response.data.data;
      const totalCount = response.data.total || 0;
      return { items, totalCount };
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('Error fetching branches data:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchBranchById = async (branchId) => {
  try {
    const response = await api.get(`${url}/Branches/${branchId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching branch data:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const createBranch = async (branchData) => {
  try {
    const response = await api.post(`${url}/Branches`, branchData);
    return response.data;
  } catch (error) {
    console.error('Error creating branch:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateBranch = async (branchId, branchData) => {
  try {
    const response = await api.put(`${url}/Branches/${branchId}`, branchData,

      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating branch:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const postPrice = async (priceData) => {
  try {
    const response = await api.post(`${url}/Prices/PostPrice`, priceData);
    return response.data;
  } catch (error) {
    console.error('Error posting price:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchPricesByBranchId = async (branchId) => {
  try {
    const response = await api.get(`${url}/Prices/branchId/${branchId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching prices by branchId:', error.response ? error.response.data : error.message);
    throw error;
  }
};