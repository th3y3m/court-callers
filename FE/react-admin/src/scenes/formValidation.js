const API_URL = 'https://courtcaller.azurewebsites.net/api/Users?pageNumber=1&pageSize=100';
const API_URL_Email =
  "https://courtcaller.azurewebsites.net/api/UserDetails/GetUserDetailByUserEmail";

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

export const validateRating = (rating) => {
  if (rating === null || rating === undefined || rating === "") {
    return { isValid: false, message: "Rating is required" };
  }
  if (isNaN(rating)) {
    return { isValid: false, message: "Rating must be a number" };
  }
  if (rating < 1 || rating > 5) {
    return { isValid: false, message: "Rating must be between 1 and 5" };
  }
  return { isValid: true, message: "" };
};

export const validateEmailForgetPass = async (email) => {
  const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}/gim;

  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Wrong Email format! (abc@gmail.com)" };
  }
  try {
    const response = await fetch(`${API_URL_Email}/${email}`);

    if (response.status === 404) {
      return {
        isValid: false,
        message: "THERE IS NO ACCOUNT WITH THIS EMAIL!",
      };
    }

    return { isValid: true, message: "" };
  } catch (error) {
    console.error("Error fetching email:", error);
    return { isValid: false, message: "Error validating email" };
  }
};

export const validateYob = (yob) => {
  const currentYear = new Date().getFullYear();
  const yobRegex = /^\d{4}$/;
  if (!yobRegex.test(yob)) {
    return { isValid: false, message: "Yob must be a number with 4 digits" };
  }

  if (yob > currentYear - 1) {
    return {
      isValid: false,
      message: "Year of birth must be less than current year!",
    };
  }

  if (yob < currentYear - 100) {
    return { isValid: false, message: "Invalid year of birth!" };
  }

  return { isValid: true, message: "" };
};


//flex
export const flexValidation = (slots) => {

  const slotNumber = Number(slots);

  if (!Number.isInteger(slotNumber)) {
    return { isValid: false, message: 'You must input an integer number' };
  }

  if (isNaN(slotNumber)) {
      return { isValid: false, message: 'You must input a number' };
  }

  if (slotNumber > 10) {
      return { isValid: false, message: 'You can only book a maximum of 10 slots each time' };
  }

  return { isValid: true, message: '' };
};


//fix
export const fixDayOfWeekValidation = (day) => {
  if (day.length == 0) {
      return {isValid: false, message: 'You need to choose day of week'};
  }
  return  {isValid: true, message: '' };
}

export const fixMonthValidation = (months) => {
  if (months > 3) {
      return { isValid: false, message: 'You can only book a maximum of 3 months each time' };
  }

  if (months < 0) {
    return { isValid: false, message: 'Months cannot be negative' };
  }

  return { isValid: true, message: '' };
};

export const fixStartTimeValidation = (startTime) => {
  const timeFormat = /^\d{2}:00:00$/;
console.log(startTime)
  if (!timeFormat.test(startTime)) {
      return { isValid: false, message: 'Following the format hh:00:00' };
  }

  return { isValid: true, message: '' };
};

export const fixEndTimeValidation = (startTime, endTime) => {
  const timeFormat = /^\d{2}:00:00$/;

  if (!timeFormat.test(endTime)) {
      return { isValid: false, message: 'Following the format hh:mm:ss | example: 10:00:00' };
  }

  const startHour = parseInt(startTime.split(':')[0], 10);
  const endHour = parseInt(endTime.split(':')[0], 10);

  if (endHour - startHour !== 1) {
      return { isValid: false, message: 'End Time is 1 hour later than Start Time' };
  }

  return { isValid: true, message: '' };
};