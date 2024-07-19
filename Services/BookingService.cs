using BusinessObjects;
using Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DAOs.Models;
using DAOs.Helper;
using Services.Interface;

namespace Services
{
    public class BookingService : IBookingService
    {
        private readonly BookingRepository _bookingRepository = null;
        private readonly TimeSlotRepository _timeSlotRepository = null;

        public BookingService()
        {
            if (_bookingRepository == null)
            {
                _bookingRepository = new BookingRepository();
            }
            if (_timeSlotRepository == null)
            {
                _timeSlotRepository = new TimeSlotRepository();
            }
        }

        public Booking AddBookingTypeFlex(string userId, int numberOfSlot, string branchId) => _bookingRepository.AddBookingTypeFlex(userId, numberOfSlot, branchId);

        public List<Booking> GetBookingsByUserId(string userId) => _bookingRepository.GetBookingsByUserId(userId);
        public void DeleteBooking(string id) => _bookingRepository.DeleteBooking(id);
        public async Task<Booking> GetBooking(string id) => await _bookingRepository.GetBooking(id);

        public async Task<(List<Booking>, int total)> GetBookings(PageResult pageResult, string searchQuery = null) => await _bookingRepository.GetBookings(pageResult, searchQuery);

        public List<Booking> GetBookingsByStatus(string status) => _bookingRepository.GetBookingsByStatus(status);
        public List<Booking> SearchBookingsByTime(DateTime start, DateTime end) => _bookingRepository.SearchBookingsByTime(start, end);
        public async Task<List<Booking>> GetBookingsByUserId(string userId, PageResult pageResult) => await _bookingRepository.GetBookingsByUserId(userId, pageResult);

        public Booking ReserveSlotAsyncV2(SlotModel[] slotModels, string userId)
        {
            try
            {
                var booking = _bookingRepository.ReserveSlotAsyncV2(slotModels, userId);
                return booking;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<Booking> AddBookingTypeFix(int numberOfMonths, string[] dayOfWeek, DateOnly startDate, TimeSlotModel[] timeSlotModel, string userId, string branchId)
        {
            try
            {
                var booking = await _bookingRepository.AddBookingTypeFix(numberOfMonths, dayOfWeek, startDate, timeSlotModel, userId, branchId);

                if (booking is null)
                {
                    return null;
                }

                return booking;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task DeleteBookingAndSetTimeSlotAsync(string bookingId) => await _bookingRepository.DeleteBookingAndSetTimeSlotAsync(bookingId);

        public void CancelBooking(string bookingId) => _bookingRepository.CancelBooking(bookingId);

        public async Task<List<Booking>> SortBookings(string? sortBy, bool isAsc, PageResult pageResult) => await _bookingRepository.SortBookings(sortBy, isAsc, pageResult);

        public (string, int) NumberOfSlotsAvailable(string userId, string branchId) => _bookingRepository.NumberOfSlotsAvailable(userId, branchId);

        public async Task<(IEnumerable<BookingResponse>, int count)> GetDailyBookings() => await _bookingRepository.GetDailyBookings();

        public async Task<(IEnumerable<WeeklyBookingResponse>, decimal)> GetWeeklyBookingsAsync() => await _bookingRepository.GetWeeklyBookingsAsync();
    }
}
