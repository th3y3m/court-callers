import axios from './customizeAxios';
export const registerApi = (fullName, email, password, confirmPassword) => {
    return axios.post("/authentication/register", {
        fullName,
        email,
        password,
        confirmPassword
    })
};
export default {registerApi}