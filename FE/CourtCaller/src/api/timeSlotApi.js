import api from "./api";

const url = 'https://localhost:7104/api';

export const fetchTimeSlots = async () => {
  try {
    const response = await api.get(`${url}/TimeSlots`);
    return response.data;
  } catch (error) {
    console.error('Error fetching time slots data:', error);
    throw error;
  }
};

export const createTimeSlot = async (newSlot) => {
  try {
    const response = await api.post(`${url}/TimeSlots`, newSlot);
    return response.data;
  } catch (error) {
    console.error('Error creating time slot:', error);
    throw error;
  }
};

export const updateTimeSlotById = async (id, updatedSlot) => {
  try {
    const response = await api.put(`${url}/TimeSlots/${id}`, updatedSlot);
    return response.data;
  } catch (error) {
    console.error('Error updating time slot:', error);
    throw error;
  }
};
export const fetchTimeSlotByBookingId = async (bookingId) => {
  try {
    const response = await api.get(`${url}/TimeSlots/bookingId/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching time slot by booking ID:', error);
    throw error
  }
};
export const addTimeSlotIfExistBooking = async (slotModel, bookingId) => {
  try {
    const response = await api.post(`${url}/TimeSlots/add_timeslot_if_exist_booking?bookingId=${bookingId}`, slotModel);
    return response.data;
  } catch (error) {
    console.error('Error adding time slot to existing booking:', error);
    throw error;
  }
};

export const fetchUnavailableSlots = async (date, branchId) => {
  try {
    const response = await api.get(`${url}/TimeSlots/unavailable_slot`, {
      params: {
        date: date,
        branchId: branchId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching unavailable slots data:', error);
    throw error;
  }
};
