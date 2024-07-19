import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchNews = async (pageNumber = 1, pageSize = 10, searchQuery = '') => {
  try {
    const params = { pageNumber, pageSize, searchQuery };
    const response = await axios.get(`${url}/News`, { params });

    if (response.data && Array.isArray(response.data.data)) {
      const items = response.data.data;
      const totalCount = response.data.total || 0;
      return { items, totalCount };
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('Error fetching news data:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchNewsDetail = async (newsId) => {
  try {
    const response = await axios.get(`${url}/News/${newsId}`);
    if (response.data) {
      return response.data;
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('Error fetching news detail:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const createNews = async (newsData) => {
  try {
    const formData = new FormData();
    formData.append('NewsImage', newsData.image);

    const response = await axios.post(`${url}/News`, formData, {
      params: {
        Title: newsData.title,
        Content: newsData.content,
        Status: newsData.status,
        IsHomepageSlideshow: newsData.isHomepageSlideshow,
        Image: newsData.imageUrl
      },
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error creating news:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteNews = async (newsId) => {
  try {
    const response = await axios.delete(`${url}/News/${newsId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting news:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateNews = async (newsId, newsData) => {
  try {
    const formData = new FormData();
    if (newsData.imageFile) {
      formData.append('NewsImage', newsData.imageFile);
    }

    // Add other fields to formData
    formData.append('Title', newsData.title);
    formData.append('Content', newsData.content);
    formData.append('Status', newsData.status);
    formData.append('IsHomepageSlideshow', newsData.isHomepageSlideshow);

    if (newsData.imageUrl) {
      formData.append('Image', newsData.imageUrl);
    }

    // Logging the form data
    console.log("FormData entries:");
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    const response = await axios.put(`${url}/News/EditNews?id=${newsId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // Logging the response
    console.log("API response:", response.data);

    return response.data;
  } catch (error) {
    console.error('Error updating news:', error.response ? error.response.data : error.message);
    throw error;
  }
};