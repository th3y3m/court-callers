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

        public async Task<(int todayCount, double changePercentage)> GetDailyBookings(string? branchId)
        {
            var timeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var nowUtc = DateTime.UtcNow;
            var today = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, timeZone).Date;
            var tomorrow = today.AddDays(1);
            var yesterday = today.AddDays(-1);

            int todayBookingCount = 0;
            int yesterdayBookingCount = 0;

            if (branchId != null)
            {
                todayBookingCount = await _courtCallerDbContext.Bookings
                .Where(m => m.BranchId == branchId && m.BookingDate >= today && m.BookingDate < tomorrow)
                .CountAsync();

                yesterdayBookingCount = await _courtCallerDbContext.Bookings
                    .Where(m => m.BranchId == branchId && m.BookingDate >= yesterday && m.BookingDate < today)
                    .CountAsync();
            }
            else
            {
                todayBookingCount = await _courtCallerDbContext.Bookings
                .Where(m => m.BookingDate >= today && m.BookingDate < tomorrow)
                .CountAsync();

                yesterdayBookingCount = await _courtCallerDbContext.Bookings
                    .Where(m => m.BookingDate >= yesterday && m.BookingDate < today)
                    .CountAsync();
            }

            double changePercentage = 0;
            if (yesterdayBookingCount > 0)
            {
                changePercentage = ((double)(todayBookingCount - yesterdayBookingCount) / yesterdayBookingCount) * 100;
            }
            else if (todayBookingCount > 0)
            {
                changePercentage = 100;
            }
            return (todayBookingCount, changePercentage);
        }


        public async Task<(int weeklyCount, double changePercentage)> GetWeeklyBookingsAsync(string? branchId)
        {
            var timeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var nowUtc = DateTime.UtcNow;
            var today = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, timeZone).Date;
            //var today = DateTime.UtcNow.Date.AddDays(1);
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek).AddDays(1);
            var endOfWeek = startOfWeek.AddDays(7);
            var startOfLastWeek = startOfWeek.AddDays(-7);
            var endOfLastWeek = startOfWeek;

            int currentWeekCount = 0;
            int lastWeekCount = 0;

            if (branchId != null)
            {
                var currentWeekBookings = await _courtCallerDbContext.Bookings
                .Where(m => m.BranchId == branchId && m.BookingDate >= startOfWeek && m.BookingDate < endOfWeek)
                .ToListAsync();


                var lastWeekBookings = await _courtCallerDbContext.Bookings
                    .Where(m => m.BranchId == branchId && m.BookingDate >= startOfLastWeek && m.BookingDate < endOfLastWeek)
                    .ToListAsync();

                currentWeekCount = currentWeekBookings.Count();
                lastWeekCount = lastWeekBookings.Count();
            }
            else
            {
                var currentWeekBookings = await _courtCallerDbContext.Bookings
                    .Where(m => m.BookingDate >= startOfWeek && m.BookingDate < endOfWeek)
                    .ToListAsync();

                var lastWeekBookings = await _courtCallerDbContext.Bookings
                    .Where(m => m.BookingDate >= startOfLastWeek && m.BookingDate < endOfLastWeek)
                    .ToListAsync();

                currentWeekCount = currentWeekBookings.Count();
                lastWeekCount = lastWeekBookings.Count();
            }

            double changePercentage = 0;
            if (lastWeekCount > 0)
            {
                changePercentage = ((double)(currentWeekCount - lastWeekCount) / lastWeekCount) * 100;
            }
            else if (currentWeekCount > 0)
            {
                changePercentage = 100;
            }

            return (currentWeekCount, changePercentage);
        }
        public async Task<(int monthlyCount, double changePercentage)> GetMonthlyBookingsAsync(string? branchId)
        {
            var timeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var nowUtc = DateTime.UtcNow;
            var today = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, timeZone).Date;
            var startOfMonth = new DateTime(today.Year, today.Month, 1);
            var startOfNextMonth = startOfMonth.AddMonths(1);
            var startOfLastMonth = startOfMonth.AddMonths(-1);

            int currentMonthCount = 0;
            int lastMonthCount = 0;

            if (branchId != null)
            {
                var currentMonthBookings = await _courtCallerDbContext.Bookings
                .Where(m => m.BranchId == branchId && m.BookingDate >= startOfMonth && m.BookingDate < startOfNextMonth)
                .ToListAsync();

                var lastMonthBookings = await _courtCallerDbContext.Bookings
                    .Where(m => m.BranchId == branchId && m.BookingDate >= startOfLastMonth && m.BookingDate < startOfMonth)
                    .ToListAsync();

                currentMonthCount = currentMonthBookings.Count;
                lastMonthCount = lastMonthBookings.Count;
            }
            else
            {
                var currentMonthBookings = await _courtCallerDbContext.Bookings
                .Where(m => m.BookingDate >= startOfMonth && m.BookingDate < startOfNextMonth)
                .ToListAsync();

                var lastMonthBookings = await _courtCallerDbContext.Bookings
                    .Where(m => m.BookingDate >= startOfLastMonth && m.BookingDate < startOfMonth)
                    .ToListAsync();

                currentMonthCount = currentMonthBookings.Count;
                lastMonthCount = lastMonthBookings.Count;
            }

            double changePercentage = 0;
            if (lastMonthCount > 0)
            {
                changePercentage = ((double)(currentMonthCount - lastMonthCount) / lastMonthCount) * 100;
            }
            else if (currentMonthCount > 0)
            {
                changePercentage = 100;
            }

            return (currentMonthCount, changePercentage);
        }
        public async Task<(decimal todayRevenue, decimal changePercentage)> GetDailyRevenue(string? branchId)
        {
            var timeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var nowUtc = DateTime.UtcNow;
            var today = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, timeZone).Date;
            var tomorrow = today.AddDays(1);
            var yesterday = today.AddDays(-1);

            decimal todayRevenue = 0;
            decimal yesterdayRevenue = 0;

            if (branchId != null)
            {
                todayRevenue = await _courtCallerDbContext.Bookings
                .Where(m => m.BranchId == branchId && m.BookingDate >= today && m.BookingDate < tomorrow && m.Status == "Complete")
                .SumAsync(m => m.TotalPrice);

                yesterdayRevenue = await _courtCallerDbContext.Bookings
                    .Where(m => m.BranchId == branchId && m.BookingDate >= yesterday && m.BookingDate < today && m.Status == "Complete")
                    .SumAsync(m => m.TotalPrice);
            }
            else
            {
                todayRevenue = await _courtCallerDbContext.Bookings
                .Where(m => m.BookingDate >= today && m.BookingDate < tomorrow && m.Status == "Complete")
                .SumAsync(m => m.TotalPrice);

                yesterdayRevenue = await _courtCallerDbContext.Bookings
                    .Where(m => m.BookingDate >= yesterday && m.BookingDate < today && m.Status == "Complete")
                    .SumAsync(m => m.TotalPrice);
            }



            decimal changePercentage = 0;
            if (yesterdayRevenue > 0)
            {
                changePercentage = ((decimal)(todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
            }
            else if (todayRevenue > 0)
            {
                changePercentage = 100;
            }
            return (todayRevenue, changePercentage);
        }



        public async Task<(decimal weeklyCount, decimal changePercentage)> GetWeeklyRevenueAsync(string? branchId)
        {
            var timeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var nowUtc = DateTime.UtcNow;
            var today = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, timeZone).Date;
            //var today = DateTime.UtcNow.Date.AddDays(1);
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek).AddDays(1);
            var endOfWeek = startOfWeek.AddDays(7);
            var startOfLastWeek = startOfWeek.AddDays(-7);
            var endOfLastWeek = startOfWeek;

            decimal currentWeekRevenue = 0;
            decimal lastWeekRevenue = 0;

            if (branchId != null)
            {
                currentWeekRevenue = await _courtCallerDbContext.Bookings
                .Where(m => m.BranchId == branchId && m.BookingDate >= startOfWeek && m.BookingDate < endOfWeek && m.Status == "Complete")
                .SumAsync(m => m.TotalPrice);

                lastWeekRevenue = await _courtCallerDbContext.Bookings
                    .Where(m => m.BranchId == branchId && m.BookingDate >= startOfLastWeek && m.BookingDate < endOfLastWeek && m.Status == "Complete")
                    .SumAsync(m => m.TotalPrice);
            }
            else
            {
                currentWeekRevenue = await _courtCallerDbContext.Bookings
                .Where(m => m.BookingDate >= startOfWeek && m.BookingDate < endOfWeek && m.Status == "Complete")
                .SumAsync(m => m.TotalPrice);

                lastWeekRevenue = await _courtCallerDbContext.Bookings
                    .Where(m => m.BookingDate >= startOfLastWeek && m.BookingDate < endOfLastWeek && m.Status == "Complete")
                    .SumAsync(m => m.TotalPrice);
            }



            decimal changePercentage = 0;
            if (lastWeekRevenue > 0)
            {
                changePercentage = ((decimal)(currentWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100;
            }
            else if (currentWeekRevenue > 0)
            {
                changePercentage = 100;
            }

            return (currentWeekRevenue, changePercentage);
        }


        public async Task<(decimal monthlyCount, decimal changePercentage)> GetMonthlyRevenueAsync(string? branchId)
        {
            var timeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var nowUtc = DateTime.UtcNow;
            var today = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, timeZone).Date;
            var startOfMonth = new DateTime(today.Year, today.Month, 1);
            var startOfNextMonth = startOfMonth.AddMonths(1);
            var startOfLastMonth = startOfMonth.AddMonths(-1);

            decimal currentMonthRevenue = 0;
            decimal lastMonthRevenue = 0;

            if (branchId != null)
            {
                currentMonthRevenue = await _courtCallerDbContext.Bookings
                .Where(m => m.BranchId == branchId && m.BookingDate >= startOfMonth && m.BookingDate < startOfNextMonth && m.Status == "Complete")
                .SumAsync(m => m.TotalPrice);

                lastMonthRevenue = await _courtCallerDbContext.Bookings
                    .Where(m => m.BranchId == branchId && m.BookingDate >= startOfLastMonth && m.BookingDate < startOfMonth && m.Status == "Complete")
                    .SumAsync(m => m.TotalPrice);
            }
            else
            {
                currentMonthRevenue = await _courtCallerDbContext.Bookings
                .Where(m => m.BookingDate >= startOfMonth && m.BookingDate < startOfNextMonth && m.Status == "Complete")
                .SumAsync(m => m.TotalPrice);

                lastMonthRevenue = await _courtCallerDbContext.Bookings
                    .Where(m => m.BookingDate >= startOfLastMonth && m.BookingDate < startOfMonth && m.Status == "Complete")
                    .SumAsync(m => m.TotalPrice);
            }

            decimal changePercentage = 0;
            if (lastMonthRevenue > 0)
            {
                changePercentage = ((decimal)(currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
            }
            else if (currentMonthRevenue > 0)
            {
                changePercentage = 100;
            }

            return (currentMonthRevenue, changePercentage);
        }




        public async Task<List<Booking>> GetBookingsForLastWeekAsync()
        {
            var lastWeek = DateTime.Today.AddDays(-7);
            return await _courtCallerDbContext.Bookings
                .Where(b => b.BookingDate >= lastWeek)
                .Include(b => b.TimeSlots)
                .ToListAsync();
        }

        public async Task<int[]> GetBookingsFromStartOfWeek(string? branchId)
        {
            var timeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var nowUtc = DateTime.UtcNow;
            var today = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, timeZone).Date;
            // var today = DateTime.UtcNow.Date.AddDays(1);
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek).AddDays(1);

            var bookingCounts = new List<int>();

            for (var date = startOfWeek; date <= today; date = date.AddDays(1))
            {
                var nextDate = date.AddDays(1);
                int count = 0;
                if (branchId != null)
                {
                    count = await _courtCallerDbContext.Bookings
                    .Where(m => m.BranchId == branchId && m.BookingDate >= date && m.BookingDate < nextDate)
                    .CountAsync();
                }
                else
                {
                    count = await _courtCallerDbContext.Bookings
                    .Where(m => m.BookingDate >= date && m.BookingDate < nextDate)
                    .CountAsync();
                }

                bookingCounts.Add(count);
            }

            return bookingCounts.ToArray();
        }
        public async Task<int[]> GetWeeklyBookingsFromStartOfMonth(string? branchId)
        {
            var timeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var nowUtc = DateTime.UtcNow;
            var today = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, timeZone).Date;
            // var today = DateTime.UtcNow.Date.AddDays(1);
            var firstDayOfMonth = new DateTime(today.Year, today.Month, 1);
            var startOfCurrentWeek = today.AddDays(-(int)today.DayOfWeek).AddDays(1);

            var bookingCounts = new List<int>();

            for (var startOfWeek = firstDayOfMonth.AddDays(-(int)firstDayOfMonth.DayOfWeek).AddDays(1);
                 startOfWeek <= startOfCurrentWeek;
                 startOfWeek = startOfWeek.AddDays(7))
            {
                var endOfWeek = startOfWeek.AddDays(7);

                int count = 0;
                if (branchId != null)
                {
                    count = await _courtCallerDbContext.Bookings
                    .Where(m => m.BranchId == branchId && m.BookingDate >= startOfWeek && m.BookingDate < endOfWeek)
                    .CountAsync();
                }
                else
                {
                    count = await _courtCallerDbContext.Bookings
                    .Where(m => m.BookingDate >= startOfWeek && m.BookingDate < endOfWeek)
                    .CountAsync();
                }

                bookingCounts.Add(count);
            }

            return bookingCounts.ToArray();
        }
        public async Task<int[]> GetMonthlyBookingsFromStartOfYear(string? branchId)
        {
            var timeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var nowUtc = DateTime.UtcNow;
            var today = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, timeZone).Date;
            var startOfYear = new DateTime(today.Year, 1, 1); // First day of the current year

            var bookingCounts = new List<int>();

            for (var month = startOfYear; month <= today; month = month.AddMonths(1))
            {
                var startOfMonth = new DateTime(month.Year, month.Month, 1);
                var endOfMonth = startOfMonth.AddMonths(1);

                int count = 0;
                if (branchId != null)
                {
                    count = await _courtCallerDbContext.Bookings
                    .Where(m => m.BranchId == branchId && m.BookingDate >= startOfMonth && m.BookingDate < endOfMonth)
                    .CountAsync();
                }
                else
                {
                    count = await _courtCallerDbContext.Bookings
                    .Where(m => m.BookingDate >= startOfMonth && m.BookingDate < endOfMonth)
                    .CountAsync();
                }

                bookingCounts.Add(count);
            }

            return bookingCounts.ToArray();
        }
        public async Task<decimal[]> GetRevenueFromStartOfWeek(string? branchId)
        {
            var timeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var nowUtc = DateTime.UtcNow;
            var today = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, timeZone).Date;
            // var today = DateTime.UtcNow.Date.AddDays(1);
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek).AddDays(1);

            var bookingRevenues = new List<decimal>();

            for (var date = startOfWeek; date <= today; date = date.AddDays(1))
            {
                var nextDate = date.AddDays(1);
                decimal revenue = 0;

                if (branchId != null)
                {
                    revenue = await _courtCallerDbContext.Bookings.Where(m => m.BranchId == branchId && m.BookingDate >= date && m.BookingDate < nextDate && m.Status == "Complete").SumAsync(m => m.TotalPrice);
                }
                else
                {
                    revenue = await _courtCallerDbContext.Bookings.Where(m => m.BookingDate >= date && m.BookingDate < nextDate && m.Status == "Complete").SumAsync(m => m.TotalPrice);
                }

                bookingRevenues.Add(revenue);
            }

            return bookingRevenues.ToArray();
        }
        public async Task<decimal[]> GetWeeklyRevenuesFromStartOfMonth(string? branchId)
        {
            var timeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var nowUtc = DateTime.UtcNow;
            var today = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, timeZone).Date;
            // var today = DateTime.UtcNow.Date.AddDays(1);
            var firstDayOfMonth = new DateTime(today.Year, today.Month, 1);
            var startOfCurrentWeek = today.AddDays(-(int)today.DayOfWeek).AddDays(1);

            var bookingCounts = new List<decimal>();

            for (var startOfWeek = firstDayOfMonth.AddDays(-(int)firstDayOfMonth.DayOfWeek).AddDays(1);
                 startOfWeek <= startOfCurrentWeek;
                 startOfWeek = startOfWeek.AddDays(7))
            {
                var endOfWeek = startOfWeek.AddDays(7);
                decimal revenue = 0;

                if (branchId != null)
                {
                    revenue = await _courtCallerDbContext.Bookings.Where(m => m.BranchId == branchId && m.BookingDate >= startOfWeek && m.BookingDate < endOfWeek && m.Status == "Complete").SumAsync(m => m.TotalPrice);

                }
                else
                {
                    revenue = await _courtCallerDbContext.Bookings.Where(m => m.BookingDate >= startOfWeek && m.BookingDate < endOfWeek && m.Status == "Complete").SumAsync(m => m.TotalPrice);
                }

                bookingCounts.Add(revenue);
            }

            return bookingCounts.ToArray();
        }
        public async Task<decimal[]> GetMonthlyRevenueFromStartOfYear(string? branchId)
        {
            var timeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var nowUtc = DateTime.UtcNow;
            var today = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, timeZone).Date;
            var startOfYear = new DateTime(today.Year, 1, 1); // First day of the current year

            var bookingCounts = new List<decimal>();

            for (var month = startOfYear; month <= today; month = month.AddMonths(1))
            {
                var startOfMonth = new DateTime(month.Year, month.Month, 1);
                var endOfMonth = startOfMonth.AddMonths(1);
                decimal revenue = 0;

                if (branchId != null)
                {
                    revenue = await _courtCallerDbContext.Bookings
                        .Where(m => m.BranchId == branchId && m.BookingDate >= startOfMonth && m.BookingDate < endOfMonth)
                        .SumAsync(m => m.TotalPrice);

                }
                else
                {
                    revenue = await _courtCallerDbContext.Bookings
                        .Where(m => m.BookingDate >= startOfMonth && m.BookingDate < endOfMonth)
                        .SumAsync(m => m.TotalPrice);
                }

                bookingCounts.Add(revenue);
            }

            return bookingCounts.ToArray();
        }
    }
}
