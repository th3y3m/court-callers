const API_URL = 'https://courtcaller.azurewebsites.net/api/Users?pageNumber=1&pageSize=100';

export const validateFullName = (fullName) => {
  if (fullName.length >= 6) return { isValid: true, message: '' };
  return { isValid: false, message: 'More than 6 characters!' };
};

export const validateEmail = async (email) => {
  const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}/igm;

  if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Wrong Email format! (abc@gmail.com)' };
  }

  // Fetch registered emails from the API
  try {
      const response = await fetch(API_URL);
      if (!response.ok) {
          throw new Error('Failed to fetch registered emails');
      }

      const users = await response.json();
      console.log(users)
      const registeredEmails = users.data.map(user => user.email.toLowerCase());

      if (registeredEmails.includes(email.toLowerCase())) {
          return { isValid: false, message: 'Email is already existed' };
      }

      return { isValid: true, message: '' };
  } catch (error) {
      console.error('Error fetching emails:', error);
      return { isValid: false, message: 'Error validating email. Please try again later.' };
  }
};


export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{6,}$/;
  if (!passwordRegex.test(password)) {
      return { isValid: false, message: 'At least 6 characters, include "A, a, @,.."' };
  }
  return { isValid: true, message: '' };
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (password === confirmPassword) return { isValid: true, message: '' };
  return { isValid: false, message: 'Does not match with Password!' };
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10,15}$/;
  if (phoneRegex.test(phone)) return { isValid: true, message: '' };
  return { isValid: false, message: 'Invalid phone number! (must be 10-15 digits)' };
};

export const validateTime = (time) => {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  if (timeRegex.test(time)) return { isValid: true, message: '' };
  return { isValid: false, message: 'Invalid time format! (hh:mm:ss)' };
};

export const validateRequired = (value) => {
  if (value.trim() !== '') return { isValid: true, message: '' };
  return { isValid: false, message: 'This field is required' };
};

export const validateNumber = (value) => {
  if (!isNaN(value) && value.trim() !== '') return { isValid: true, message: '' };
  return { isValid: false, message: 'Must be a number' };
};
