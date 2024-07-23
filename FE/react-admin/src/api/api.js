import axios from 'axios';


const getToken = () => {
  return localStorage.getItem('token');
};


const api = axios.create({
  baseURL: 'https://courtcaller.azurewebsites.net/api',
});


api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
