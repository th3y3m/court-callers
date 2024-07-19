import axios from './customizeAxios';

export const registerAdminApi = (fullName, email, password, confirmPassword) => {
  return axios.post("/authentication/register-admin", {
    fullName,
    email,
    password,
    confirmPassword
  });
};

export const registerStaffApi = (fullName, email, password, confirmPassword) => {
  return axios.post("/authentication/register-staff", {
    fullName,
    email,
    password,
    confirmPassword
  });
};

export default { registerAdminApi, registerStaffApi };
