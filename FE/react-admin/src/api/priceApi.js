
  import api from './api';
  const url = 'https://courtcaller.azurewebsites.net/api';

  export const fetchPrice = async (branchId) => {
    try {
      const response = await api.post(`${url}/Prices/showprice`, null, {
        params: {
          branchId
        }
      });

      return {
        weekdayPrice: response.data.weekdayPrice,
        weekendPrice: response.data.weekendPrice,
      };
    } catch (error) {
      console.error('Error fetching prices', error);
      throw error;
    }
  };

  export const fetchPriceByBranchID = async (branchId) => {
    try {
      const response = await api.get(`${url}/Prices/branchId/${branchId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching prices:', error);
      throw error;
    }
  };

  // New method to fetch price by branchId, type, and isWeekend
  export const fetchPriceByBranchIDType = async (branchId, type, isWeekend) => {
    try {
      const response = await api.get(`${url}/Prices/branchId/${branchId}/type/${type}`, {
        params: {
          isWeekend
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching prices by branchId, type, and isWeekend:', error);
      throw error;
    }
  };

// Function to update price
export const updatePrice = async (branchId, type, isWeekend, slotPrice) => {
  try {
    const response = await api.put(`${url}/Prices/UpdatePrice`, {
      branchId,
      type,
      isWeekend,
      slotPrice
    });
    return response.data;
  } catch (error) {
    console.error('Error updating price:', error);
    throw error;
  }
};