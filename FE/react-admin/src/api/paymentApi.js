import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchPayments = async () => {
  try {
    const response = await axios.get(`${url}/Payments`);
    if (response.data && Array.isArray(response.data)) {
      return {
        items: response.data
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
    const response = await axios.delete(`${url}/Payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting payment:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const generatePaymentToken = async (bookingId) => {
  try {
    const response = await axios.get(`${url}/Payments/GeneratePaymentToken/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error generating payment token:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const processPayment = async (token) => {
  try {
    const response = await axios.post(`${url}/Payments/ProcessPayment?token=${token}`);
    return response.data;
  } catch (error) {
    console.error('Error processing payment:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchPaymentById = async (paymentId) => {
  try {
    const response = await axios.get(`${url}/Payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment by ID:', error.response ? error.response.data : error.message);
    throw error;
  }
};
