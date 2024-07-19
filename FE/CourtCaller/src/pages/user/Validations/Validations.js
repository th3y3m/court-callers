const API_URL =
  "https://courtcaller.azurewebsites.net/api/Users?pageNumber=1&pageSize=100";

export const validateEmail = async (email) => {
  const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}/gim;

  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Wrong Email format! (abc@gmail.com)" };
  }
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch user detail");
    }

    const users = await response.json();
    const resetEmail = users.data.map((user) => user.email.toLowerCase());

    if (!resetEmail.includes(email.toLowerCase())) {
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
