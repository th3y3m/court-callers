const API_URL =
  "https://courtcaller.azurewebsites.net/api/UserDetails/GetUserDetailByUserEmail/";

export const validateFullName = (fullName) => {
  if (fullName.length >= 6) return { isValid: true, message: "" };
  return { isValid: false, message: "More than 6 characters!" };
};

export const validateUserName = async (userName) => {
  if (userName.length < 6)
    return { isValid: false, message: "More than 6 character!" };

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch registered emails");
    }

    const users = await response.json();
    const duplicateUserName = users.data.map((user) =>
      user.userName.toLowerCase()
    );

    if (duplicateUserName.includes(userName.toLowerCase())) {
      return {
        isValid: false,
        message: "User Name is already exist!",
      };
    }
    return { isValid: true, message: "" };
  } catch (error) {
    console.error("Error fetching userName:", error);
    return { isValid: false, message: "Error validating userName" };
  }
};

export const validateAddress = (address) => {
  if (address.length >= 15) return { isValid: true, message: "" };
  return { isValid: false, message: "More than 15 characters!" };
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

export const validateEmail = async (email) => {
  const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}/gim;

  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Wrong Email format! (abc@gmail.com)" };
  }

  // Fetch registered emails from the API
  try {
    const response = await fetch(`${API_URL}/${email}`);

    if (response.status === 200) {
      return {
        isValid: false,
        message: "Email is already existed",
      };
    }

    return { isValid: true, message: "" };
  } catch (error) {
    console.error("Error fetching emails:", error);
    return {
      isValid: false,
      message: "Error validating email. Please try again later.",
    };
  }
};

export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{6,}$/;

  if (!passwordRegex.test(password)) {
    return {
      isValid: false,
      message: 'At least 6 characters, include "A, a, @,.."',
    };
  }

  return { isValid: true, message: "" };
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (password === confirmPassword) return { isValid: true, message: "" };
  return { isValid: false, message: "Does not match with Password!" };
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\d{10,11}$/;
  if (phoneRegex.test(phone)) {
    return { isValid: true, message: "" };
  }
  return {
    isValid: false,
    message: "Phone must be a number with 10 to 11 digits",
  };
};

export const validateTime = (time) => {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  if (timeRegex.test(time)) return { isValid: true, message: "" };
  return { isValid: false, message: "Invalid time format! (hh:mm:ss)" };
};
