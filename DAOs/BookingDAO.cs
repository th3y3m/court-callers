using BusinessObjects;
using DAOs;
using DAOs.Helper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.RazorPages;
using PageResult = DAOs.Helper.PageResult;
using System.ComponentModel.DataAnnotations;
using DAOs.Models;

namespace DAOs
{
    public class BookingDAO
    {

        private readonly CourtCallerDbContext _courtCallerDbContext = null;

        public BookingDAO()
        {
            if (_courtCallerDbContext == null)
            {
                _courtCallerDbContext = new CourtCallerDbContext();
            }
        }
        public BookingDAO(CourtCallerDbContext context)
        {
            _courtCallerDbContext = context;
        }

        public async Task<(List<Booking>, int total)> GetBookings(PageResult pageResult, string searchQuery = null)
        {
            var query = _courtCallerDbContext.Bookings
                .Include(b => b.User)
                .AsQueryable();

            if (!string.IsNullOrEmpty(searchQuery))
            {
                query = query.Where(b =>
                    b.BookingId.ToString().Contains(searchQuery) ||
                    b.User.Id.ToString().Contains(searchQuery) ||
                    b.BookingDate.ToString().Contains(searchQuery) ||
                    b.Status.Contains(searchQuery) ||
                    b.TotalPrice.ToString().Contains(searchQuery) ||
                    b.BookingType.Contains(searchQuery) ||
                    b.NumberOfSlot.ToString().Contains(searchQuery)
                );
            }

           
            var total = await query.CountAsync();

            var pagedQuery = query
                .Skip((pageResult.PageNumber - 1) * pageResult.PageSize)
                .Take(pageResult.PageSize)
                .Select(b => new Booking
                {
                    BookingId = b.BookingId,
                    Id = b.User.Id,
                    BookingDate = b.BookingDate,
                    BranchId = b.BranchId,
                    Status = b.Status,
                    TotalPrice = b.TotalPrice,
                    BookingType = b.BookingType,
                    NumberOfSlot = b.NumberOfSlot
                });

            var bookings = await pagedQuery.ToListAsync();

            return (bookings, total);
        }




        public async Task<Booking> GetBooking(string id)
        {
            var booking = await _courtCallerDbContext.Bookings.FirstOrDefaultAsync(m => m.BookingId.Equals(id));
            
            return booking;
        }

        public async Task<TimeSlot> AddBookingTransaction(string slotId)
        {
            var test = await _courtCallerDbContext.TimeSlots
                 .FromSqlRaw($"SELECT * FROM TimeSlots WITH (UPDLOCK) WHERE SlotId = '{slotId}' AND IsAvailable = 1")
                 .FirstOrDefaultAsync();

            return test;
        }


        public void AddBooking(Booking booking)
        {
            _courtCallerDbContext.Bookings.Add(booking);
            _courtCallerDbContext.SaveChanges();
        }
        public async Task SaveChangesAsync()
        {
            await _courtCallerDbContext.SaveChangesAsync();
        }

        public async Task CommitTransactionAsync()
        {
            try
            {
                await _courtCallerDbContext.Database.CommitTransactionAsync();
            }
            catch (Exception ex)
            {

                throw;
            }
        }


        public async Task RollbackTransactionAsync()
        {
            try
            {
                await _courtCallerDbContext.Database.RollbackTransactionAsync();
            }
            catch (Exception ex)
            {

                throw;
            }
        }

        public async Task UpdateBooking(Booking booking)
        {
            _courtCallerDbContext.Bookings.Update(booking);
           await _courtCallerDbContext.SaveChangesAsync();
        }

        public async Task<Booking> UpdateBooking(string id, decimal price)
        {
            Booking oBooking = await GetBooking(id);
            if (oBooking != null)
            {
                oBooking.TotalPrice = price;
                _courtCallerDbContext.Update(oBooking);
                _courtCallerDbContext.SaveChanges();
            }
            return oBooking;
        }

        public async void DeleteBooking(string id)
        {
            Booking oBooking = await GetBooking(id);
            if (oBooking != null)
            {
                oBooking.Status = "Canceled";
                _courtCallerDbContext.Update(oBooking);
                _courtCallerDbContext.SaveChanges();
            }
        }

        public List<Booking> GetBookingsByStatus(string status)
        {
            return _courtCallerDbContext.Bookings.Where(m => m.Status.Equals(status)).ToList();
        }

        public List<Booking> SearchBookingsByTime(DateTime start, DateTime end)
        {
            return _courtCallerDbContext.Bookings.Where(m => m.BookingDate >= start && m.BookingDate <= end).ToList();
        }

        public async Task<List<Booking>> GetBookingsByUserId(string userId, PageResult pageResult)
        {
            var query = _courtCallerDbContext.Bookings.AsQueryable();

            Pagination pagination = new Pagination(_courtCallerDbContext);
            List<Booking> bookings = await pagination.GetListAsync<Booking>(query, pageResult);
            return bookings;
        }


        public async Task BeginTransactionAsync()
        {
            try
            {
                await _courtCallerDbContext.Database.BeginTransactionAsync();
            }
            catch (Exception ex)
            {

                throw;
            }
        }

        public List<Booking> GetBookingTypeFlex(string userId)
        {
            return _courtCallerDbContext.Bookings.Where(m => m.BookingType.Equals("Flex") && m.Id.Equals(userId)).ToList();
        }

        public List<Booking> GetBookingsByUserId(string userId)
        {
            return _courtCallerDbContext.Bookings.Where(m => m.Id.Equals(userId)).ToList();
        }

        public async Task<List<Booking>> SortBookings(string? sortBy, bool isAsc, PageResult pageResult)
        {
            IQueryable<Booking> query = _courtCallerDbContext.Bookings;

            switch (sortBy?.ToLower())
            {
                case "bookingid":
                    query = isAsc ? query.OrderBy(b => b.BookingId) : query.OrderByDescending(b => b.BookingId);
                    break;
                case "id":
                    query = isAsc ? query.OrderBy(b => b.Id) : query.OrderByDescending(b => b.Id);
                    break;
                case "bookingdate":
                    query = isAsc ? query.OrderBy(b => b.BookingDate) : query.OrderByDescending(b => b.BookingDate);
                    break;
                case "bookingtype":
                    query = isAsc ? query.OrderBy(b => b.BookingType) : query.OrderByDescending(b => b.BookingType);
                    break;
                case "numberofslot":
                    query = isAsc ? query.OrderBy(b => b.NumberOfSlot) : query.OrderByDescending(b => b.NumberOfSlot);
                    break;
                case "status":
                    query = isAsc ? query.OrderBy(b => b.Status) : query.OrderByDescending(b => b.Status);
                    break;
                case "totalprice":
                    query = isAsc ? query.OrderBy(b => b.TotalPrice) : query.OrderByDescending(b => b.TotalPrice);
                    break;
                default:
                    break;
            }
            Pagination pagination = new Pagination(_courtCallerDbContext);
            List<Booking> bookings = await pagination.GetListAsync<Booking>(query, pageResult);
            return bookings;
        }

        public async Task<(IEnumerable<BookingResponse>,int count)> GetDailyBookings()
        {
            var today = DateTime.Today;
            var endDate = today.AddDays(1);

            var dailyBooking = await _courtCallerDbContext.Bookings
                .Where(m => m.BookingDate >= today && m.BookingDate < endDate) // Chỉ so sánh phần ngày của BookingDate
                .GroupBy(b => new { b.BookingDate.Year, b.BookingDate.Month, b.BookingDate.Day })
                .Select(g => new BookingResponse
                {
                    BookingDate = new DateTime(g.Key.Year, g.Key.Month, g.Key.Day),
                    TotalPrice = g.Sum(b => b.TotalPrice)
                })
                .ToListAsync();
            int count = dailyBooking.Count();
            return (dailyBooking,count);
        }


        public async Task<(IEnumerable<WeeklyBookingResponse>, decimal)> GetWeeklyBookingsAsync()
        {
            var today = DateTime.Today;
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
            var endOfWeek = startOfWeek.AddDays(7);

            var bookings = await _courtCallerDbContext.Bookings
                .Where(m => m.BookingDate >= startOfWeek && m.BookingDate < endOfWeek)
                .ToListAsync();

            var weeklyBooking = bookings
                .GroupBy(b => b.BookingDate.DayOfWeek)
                .Select(g => new WeeklyBookingResponse
                {
                    DayOfWeek = g.Key.ToString(),
                    TotalPrice = g.Sum(b => b.TotalPrice)
                })
                .ToList();

            decimal total = weeklyBooking.Sum(w => w.TotalPrice);
            return (weeklyBooking, total);
        }


        public async Task<List<Booking>> GetBookingsForLastWeekAsync()
        {
            var lastWeek = DateTime.Today.AddDays(-7);
            return await _courtCallerDbContext.Bookings
                .Where(b => b.BookingDate >= lastWeek)
                .Include(b => b.TimeSlots)
                .ToListAsync();
        }

    }
}
