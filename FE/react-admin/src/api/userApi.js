import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchTeamData = async (pageNumber = 1, pageSize = 10, searchQuery = '') => {
  try {
    const params = { pageNumber, pageSize, searchQuery };
    const response = await axios.get(`${url}/Users`, { params });

    if (response.data && Array.isArray(response.data.data)) {
      const items = response.data.data;
      const totalCount = response.data.total || 0;
      return { items, totalCount };
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('Error fetching team data:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchUserDetailByEmail = async (userEmail) => {
  try {
    const response = await axios.get(`${url}/Users/GetUserDetailByUserEmail/${userEmail}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user data by email:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateUserBanStatus = async (userId, banned) => {
  try {
    const response = await axios.put(`${url}/Users/${userId}/${banned ? 'ban' : 'unban'}`);
    return response.data;
  } catch (error) {
    console.error('Error updating user ban status:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${url}/Users`, userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateUserDetail = async (userDetailId, userDetails) => {
  try {
    console.log('Sending update request:', { userDetailId, userDetails });
    const response = await axios.put(`${url}/UserDetails/${userDetailId}`, userDetails);
    console.log('API response status:', response.status);
    console.log('API response data:', response.data);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      console.error('Validation errors:', error.response.data.errors);
    } else {
      console.error('Error updating user detail:', error.response ? error.response.data : error.message);
    }
    throw error;
  }
};

export const fetchUserDetail = async (userId) => {
  try {
    const response = await axios.get(`${url}/UserDetails/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch user details: ${error.message}`);
  }
};

export const fetchRoleByUserId = async (userId) => {
  try {
    const response = await axios.get(`${url}/Roles/userId/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch user roles: ${error.message}`);
  }
};


export const updateUserRole = async (userId, role) => {
  try {
    console.log('Sending update request:', { userId, role }); 
    const response = await axios.put(`${url}/Roles/${userId}`,`"${role}"`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
     );
    console.log('API response status:', response.status);
    console.log('API response data:', response.data);
  } catch (error) {
    throw new Error(`Failed to update user roles: ${error.message}`);
  }};


// Hàm lấy thông tin người dùng bằng user ID
export const fetchUserEmailById = async (userId) => {
  try {
    const response = await axios.get(`${url}/Users/${userId}`);
    return response.data.email;
  } catch (error) {
    console.error('Error fetching user email:', error.response ? error.response.data : error.message);
    throw error;
  }
};