import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchEachPercentRatingByBranch = async (branchId) => {
    try {
       
      const response = await axios.get(`${url}/Reviews/GetRatingPercentageOfABranch/${branchId}` );
  
      return response.data;
    } catch (error) {
      console.error('Error fetching review', error);
      throw error;
    }
  };

  export const fetchPercentRatingByBranch = async (branchId) => {
    try {
       
      const response = await axios.get(`${url}/Reviews/AverageRating/${branchId}` );
  
      return response.data;
    } catch (error) {
      console.error('Error fetching review(branch)', error);
      throw error;
    }
  }