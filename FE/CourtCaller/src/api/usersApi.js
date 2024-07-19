import axios from './customizeAxios';

export const loginApi = (email, password) => {
    return axios.post("/authentication/login", { email, password });
    // return axios.post("/api/login", { email, password });
};

export default {
    loginApi,
};
