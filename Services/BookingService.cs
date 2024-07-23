using BusinessObjects;
using Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DAOs.Models;
using DAOs.Helper;
using Services.Interface;
using DAOs;

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

        public async Task CancelBooking(string bookingId)
        {
            await _bookingRepository.CancelBooking(bookingId);
        }

        public async Task<List<Booking>> SortBookings(string? sortBy, bool isAsc, PageResult pageResult) => await _bookingRepository.SortBookings(sortBy, isAsc, pageResult);

        public (string, int) NumberOfSlotsAvailable(string userId, string branchId) => _bookingRepository.NumberOfSlotsAvailable(userId, branchId);

        public async Task<(int todayCount, double changePercentage)> GetDailyBookings(string? branchId) => await _bookingRepository.GetDailyBookings(branchId);

        public async Task<(int weeklyCount, double changePercentage)> GetWeeklyBookingsAsync(string? branchId) => await _bookingRepository.GetWeeklyBookingsAsync(branchId);
        public async Task<(int weeklyCount, double changePercentage)> GetMonthlyBookingsAsync(string? branchId) => await _bookingRepository.GetMonthlyBookingsAsync(branchId);
        public async Task<int[]> GetBookingsFromStartOfWeek(string? branchId) => await _bookingRepository.GetBookingsFromStartOfWeek(branchId);
        public async Task<int[]> GetWeeklyBookingsFromStartOfMonth(string? branchId) => await _bookingRepository.GetWeeklyBookingsFromStartOfMonth(branchId);
        public async Task<int[]> GetMonthlyBookingsFromStartOfYear(string? branchId) => await _bookingRepository.GetMonthlyBookingsFromStartOfYear(branchId);

        public async Task<(decimal todayRevenue, decimal changePercentage)> GetDailyRevenue(string? branchId) => await _bookingRepository.GetDailyRevenue(branchId);
        public async Task<(decimal todayRevenue, decimal changePercentage)> GetWeeklyRevenueAsync(string? branchId) => await _bookingRepository.GetWeeklyRevenueAsync(branchId);
        public async Task<(decimal todayRevenue, decimal changePercentage)> GetMonthlyRevenueAsync(string? branchId) => await _bookingRepository.GetMonthlyRevenueAsync(branchId);
        public async Task<decimal[]> GetRevenueFromStartOfWeek(string? branchId) => await _bookingRepository.GetRevenueFromStartOfWeek(branchId);
        public async Task<decimal[]> GetWeeklyRevenueFromStartOfMonth(string? branchId) => await _bookingRepository.GetWeeklyRevenueFromStartOfMonth(branchId);
        public async Task<decimal[]> GetMonthlyRevenueFromStartOfYear(string? branchId) => await _bookingRepository.GetMonthlyRevenueFromStartOfYear(branchId);



    }
}
