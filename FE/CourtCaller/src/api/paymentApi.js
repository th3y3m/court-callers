import api from "./api";

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchPayments = async (pageNumber = 1, pageSize = 10) => {
  try {
    const response = await api.get(`${url}/Payments`, {
      params: {
        pageNumber,
        pageSize
      }
    });
    if (response.data && Array.isArray(response.data)) {
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
    console.error('Error fetching payment data:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deletePayment = async (paymentId) => {
  try {
    const response = await api.delete(`${url}/Payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting payment:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const generatePaymentToken = async (bookingId) => {
  try {
    const response = await api.get(`${url}/Payments/GeneratePaymentToken/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error generating payment token:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const processPayment = async (role, token) => {
  try {
    const response = await api.post(`${url}/Payments/ProcessPayment?role=${role}&token=${token}`);
    return response.data;
  } catch (error) {
    console.error('Error processing payment:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const processBalancePayment = async (token) => {
  try {
    const response = await api.post(`${url}/Payments/ProcessPaymentByBalance?token=${token}`);
    return response.data;
  } catch (error) {
    console.error('Error processing payment:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchPaymentById = async (paymentId) => {
  try {
    const response = await api.get(`${url}/Payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment by ID:', error.response ? error.response.data : error.message);
    throw error;
  }
};
