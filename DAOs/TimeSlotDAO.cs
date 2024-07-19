using BusinessObjects;
using DAOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAOs.Models;
using DAOs.Helper;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc.RazorPages;
using PageResult = DAOs.Helper.PageResult;



namespace DAOs
{
    public class TimeSlotDAO
    {
        private readonly CourtCallerDbContext _dbContext = null;


        public TimeSlotDAO()
        {
            if (_dbContext == null)
            {
                _dbContext = new CourtCallerDbContext();
            }
        }

        public TimeSlotDAO(CourtCallerDbContext dbContext)
        {
            _dbContext = dbContext;
        }



        public List<TimeSlot> GetTimeSlots()
        {
            return _dbContext.TimeSlots.ToList();
        }

        public async Task<List<TimeSlot>> GetTimeSlots(PageResult pageResult, string searchQuery = null)
        {
            var query = _dbContext.TimeSlots.AsQueryable();

            if (!string.IsNullOrEmpty(searchQuery))
            {
                query = query.Where(timeslot => timeslot.SlotId.Contains(searchQuery) ||
                                                timeslot.Booking.Id.Contains(searchQuery) ||
                                                timeslot.Price.Equals(searchQuery) ||
                                                timeslot.CourtId.Contains(searchQuery) ||
                                                (timeslot.SlotDate.ToString().Contains(searchQuery)) ||
                                                timeslot.Status.Contains(searchQuery));
            }
            Pagination pagination = new Pagination(_dbContext);
            List<TimeSlot> timeSlots = await pagination.GetListAsync<TimeSlot>(query, pageResult);
            return timeSlots;
        }
        
        public async Task<List<TimeSlot>> GetTimeSlotsByCourtId(string courtId, PageResult pageResult, string searchQuery = null)
        {
            var query = _dbContext.TimeSlots.Where(t => t.CourtId.Equals(courtId)).AsQueryable();

            if (!string.IsNullOrEmpty(searchQuery))
            {
                query = query.Where(timeslot => timeslot.SlotId.Contains(searchQuery) ||
                                                timeslot.Booking.Id.Contains(searchQuery) ||
                                                timeslot.Price.Equals(searchQuery) ||
                                                timeslot.CourtId.Contains(searchQuery) ||
                                                (timeslot.SlotDate.ToString().Contains(searchQuery)) ||
                                                timeslot.Status.Contains(searchQuery));
            }
            Pagination pagination = new Pagination(_dbContext);
            List<TimeSlot> timeSlots = await pagination.GetListAsync<TimeSlot>(query, pageResult);
            return timeSlots;
        }

        public TimeSlot GetTimeSlot(string id)
        {
            TimeSlot timeslots = _dbContext.TimeSlots.Where(t => t.SlotId.Equals(id)).FirstOrDefault(); 
            return timeslots;
        }

        public TimeSlot AddTimeSlot(TimeSlot TimeSlot)
        {
            _dbContext.TimeSlots.Add(TimeSlot);
            _dbContext.SaveChanges();
            return TimeSlot;
        }

        //public TimeSlot UpdateTimeSlot(string id, TimeSlot TimeSlot)
        //{
        //    TimeSlot oTimeSlot = GetTimeSlot(id);
        //    if (oTimeSlot != null)
        //    {
        //        oTimeSlot.Status = "false";
        //        oTimeSlot.Price = TimeSlot.Price;
        //        _dbContext.Update(oTimeSlot);
        //        _dbContext.SaveChanges();
        //    }
        //    return oTimeSlot;
        //}


        public async Task UpdateTimeSlotWithObject(TimeSlot timeSlot)
        {
           
            _dbContext.TimeSlots.Update(timeSlot);
            _dbContext.SaveChanges();
           
        }

        public async Task<TimeSlot> UpdateTimeSlot(string slotId, SlotModel slotModel)
        {
            TimeSlot timeSlot = GetTimeSlot(slotId);
            if (timeSlot != null)
            {
                timeSlot.CourtId = slotModel.CourtId;
                timeSlot.SlotDate = slotModel.SlotDate;
                timeSlot.SlotStartTime = slotModel.TimeSlot.SlotStartTime;
                timeSlot.SlotEndTime = slotModel.TimeSlot.SlotEndTime;
                _dbContext.TimeSlots.Update(timeSlot);
                _dbContext.SaveChanges();
            }
            return timeSlot;
        }

        //public void DeleteTimeSlot(int id)
        //{
        //    TimeSlot oTimeSlot = GetTimeSlot(id);
        //    if (oTimeSlot != null)
        //    {
        //        _dbContext.Remove(oTimeSlot);
        //        _dbContext.SaveChanges();
        //    }
        //}
        public List<TimeSlot> GetTimeSlotsByCourtId(string courtId)
        {
            return _dbContext.TimeSlots.Where(t => t.CourtId.Equals(courtId)).ToList();
        }

        public async void UpdateBookinginSlot(string slotId, string bookingId)
        {
            try
            {
                TimeSlot oTimeSlot = GetTimeSlot(slotId);
                if (oTimeSlot != null)
                {
                    oTimeSlot.BookingId = bookingId;
                    _dbContext.Update(oTimeSlot);
                    _dbContext.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        //public string GetDayOfWeek(string date)
        //{
        //    if (DateTime.TryParse(date, out DateTime parsedDate))
        //    {
        //        var dayOfWeek = parsedDate.DayOfWeek;
        //        return dayOfWeek.ToString();
        //    }
        //    else
        //    {
        //        return null;
        //    }
        //}


        //V2
        public List<TimeSlot> GetTimeSlotsByDate(DateOnly dateOnly)
        {
            return _dbContext.TimeSlots.Where(t => t.SlotDate.Equals(dateOnly)).ToList();
        }

        public bool IsSlotAvailable(SlotModel slotModel)
        {
            List<TimeSlot> timeSlots = GetTimeSlotsByDate(slotModel.SlotDate);

            if (!timeSlots.Any())
            {
                return true;
            }

            foreach (var slot in timeSlots)
            {
                if (slot.SlotStartTime.Equals(slotModel.TimeSlot.SlotStartTime) && slot.SlotEndTime.Equals(slotModel.TimeSlot.SlotEndTime))
                {
                    return false;
                }
            }


            return true;
        }

        public TimeSlot AddSlotToBooking(SlotModel slotModel, string bookingId)
        {
            if (slotModel == null || bookingId == null)
            {
                throw new ArgumentNullException("slotModel or bookingId is null");
            }

            TimeSlot timeSlot = new TimeSlot
            {
                SlotId = "S" + GenerateId.GenerateShortBookingId(),
                CourtId = slotModel.CourtId ?? _dbContext.Courts
                    .Where(c => c.BranchId == slotModel.BranchId && !_dbContext.TimeSlots.Any(ts => ts.CourtId == c.CourtId && ts.SlotDate == slotModel.SlotDate && ((ts.SlotStartTime <= slotModel.TimeSlot.SlotStartTime && ts.SlotEndTime > slotModel.TimeSlot.SlotStartTime) || (ts.SlotStartTime < slotModel.TimeSlot.SlotEndTime && ts.SlotEndTime >= slotModel.TimeSlot.SlotEndTime))))
                    .Select(c => c.CourtId)
                    .FirstOrDefault(),
                BookingId = bookingId,
                SlotDate = slotModel.SlotDate,
                Price = GetSlotPrice(slotModel),
                SlotStartTime = slotModel.TimeSlot.SlotStartTime,
                SlotEndTime = slotModel.TimeSlot.SlotEndTime,
                Status = "Reserved",
                Created_at = DateTime.UtcNow,
            };

            try
            {
                _dbContext.TimeSlots.Add(timeSlot);
                _dbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                // Handle exception
                throw;
            }

            return timeSlot;
        }


        public async Task DeleteBookingAndSetTimeSlotAsync(string bookingId)
        {
            using (var transaction = await _dbContext.Database.BeginTransactionAsync())
            {
                try
                {
                    var timeSlots = await _dbContext.TimeSlots
        .Where(ts => ts.BookingId == bookingId && ts.SlotDate != null) // Kiểm tra trường DateTimeColumn không null
        .ToListAsync();
                    foreach (var timeSlot in timeSlots)
                    {
                        timeSlot.BookingId = null;
                        timeSlot.Status = "true";
                        _dbContext.TimeSlots.Update(timeSlot);
                    }
                    await _dbContext.SaveChangesAsync();


                    var booking = await _dbContext.Bookings.FindAsync(bookingId);
                    if (booking != null)
                    {
                        _dbContext.Bookings.Remove(booking);
                        await _dbContext.SaveChangesAsync();
                    }


                    await transaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }

        }

        public async void DeleteTimeSlot(string timeSlotId)
        {
            TimeSlot timeSlot = GetTimeSlot(timeSlotId);
            if (timeSlot != null)
            {
                _dbContext.TimeSlots.Remove(timeSlot);
                _dbContext.SaveChanges();
            }
        }

        public int NumberOfSlotsInBooking(string bookingId)
        {
            return _dbContext.TimeSlots.Count(ts => ts.BookingId == bookingId);
        }

        public TimeSlot CheckSlotByDateAndTime(SlotModel slotModel, string branchId)
        {
            return _dbContext.TimeSlots.FirstOrDefault(ts =>
                //ts.CourtId == slotModel.CourtId && 
                ts.SlotDate == slotModel.SlotDate &&
                ts.SlotStartTime == slotModel.TimeSlot.SlotStartTime &&
                ts.SlotEndTime == slotModel.TimeSlot.SlotEndTime);
        }




        //public decimal GetSlotPrice(SlotModel slotModel)
        //{
        //    return _dbContext.Prices
        //        .FromSqlRaw($"SELECT * FROM Prices p JOIN Branches b ON p.BranchId = b.BranchId JOIN Courts c ON c.BranchId = b.BranchId JOIN TimeSlots t on t.CourtId = c.CourtId WHERE p.IsWeekend = 'True'").First().SlotPrice;
        //}

        public decimal GetSlotPrice(SlotModel slotModel)
        {
            bool isWeekend = slotModel.SlotDate.DayOfWeek == DayOfWeek.Saturday || slotModel.SlotDate.DayOfWeek == DayOfWeek.Sunday;

            Price pricing = null;
            if (slotModel.BranchId != null)
            {
                pricing = _dbContext.Prices
                    .FirstOrDefault(p => p.BranchId == slotModel.BranchId && p.IsWeekend == isWeekend);
            }
            else
            {
                var court = _dbContext.Courts.FirstOrDefault(c => c.CourtId == slotModel.CourtId);
                if (court != null)
                {
                    var branch = _dbContext.Branches.FirstOrDefault(b => b.BranchId == court.BranchId);
                    if (branch != null)
                    {
                        pricing = _dbContext.Prices
                            .FirstOrDefault(p => p.BranchId == branch.BranchId && p.IsWeekend == isWeekend);
                    }
                }
            }

            return pricing?.SlotPrice ?? 0;
        }

        public List<TimeSlot> GetTimeSlotsByBookingId(string bookingId)
        {
            return _dbContext.TimeSlots.Where(ts => ts.BookingId == bookingId).ToList();
        }

        public async Task<List<TimeSlot>> GetTimeSlotsByUserId(string userId, PageResult pageResult)
        {
            var query = _dbContext.TimeSlots
                .Where(ts => _dbContext.Bookings.Any(b => b.BookingId == ts.BookingId && b.Id == userId))
                .Select(ts => new TimeSlot
                {
                    SlotId = ts.SlotId,
                    CourtId = ts.CourtId,
                    BookingId = ts.BookingId,
                    SlotDate = ts.SlotDate,
                    SlotStartTime = ts.SlotStartTime,
                    SlotEndTime = ts.SlotEndTime,
                    Price = ts.Price,
                    Status = ts.Status
                });

            Pagination pagination = new Pagination(_dbContext);
            List<TimeSlot> timeSlots = await pagination.GetListAsync<TimeSlot>(query, pageResult);
            return timeSlots;
        }

        public async Task<List<TimeSlot>> SortTimeSlot(string? sortBy, bool isAsc, PageResult pageResult)
        {
            IQueryable<TimeSlot> query = _dbContext.TimeSlots;

            switch (sortBy?.ToLower())
            {
                case "slotid":
                    query = isAsc ? query.OrderBy(b => b.SlotId) : query.OrderByDescending(b => b.SlotId);
                    break;
                case "bookingid":
                    query = isAsc ? query.OrderBy(b => b.BookingId) : query.OrderByDescending(b => b.BookingId);
                    break;
                case "courtid":
                    query = isAsc ? query.OrderBy(b => b.CourtId) : query.OrderByDescending(b => b.CourtId);
                    break;
                case "slotdate":
                    query = isAsc ? query.OrderBy(b => b.SlotDate) : query.OrderByDescending(b => b.SlotDate);
                    break;
                case "slotstarttime":
                    query = isAsc ? query.OrderBy(b => b.SlotStartTime) : query.OrderByDescending(b => b.SlotStartTime);
                    break;
                case "slotendtime":
                    query = isAsc ? query.OrderBy(b => b.SlotEndTime) : query.OrderByDescending(b => b.SlotEndTime);
                    break;
                case "price":
                    query = isAsc ? query.OrderBy(b => b.Price) : query.OrderByDescending(b => b.Price);
                    break;
                case "status":
                    query = isAsc ? query.OrderBy(b => b.Status) : query.OrderByDescending(b => b.Status);
                    break;
                default:
                    break;
            }
            Pagination pagination = new Pagination(_dbContext);
            List<TimeSlot> timeSlots = await pagination.GetListAsync<TimeSlot>(query, pageResult);
            return timeSlots;
        }

        
        public int CountTimeSlot(SlotCheckModel slotCheckModel)
        {
            var count = _dbContext.Courts.Count(c => c.BranchId == slotCheckModel.BranchId) - _dbContext.TimeSlots.Count(ts => ts.Court.BranchId == slotCheckModel.BranchId && ts.SlotDate == slotCheckModel.SlotDate && ts.SlotStartTime == slotCheckModel.TimeSlot.SlotStartTime && ts.SlotEndTime == slotCheckModel.TimeSlot.SlotEndTime);  
            return count;
        }

        
        public List<TimeSlotModel> UnavailableSlot(DateOnly date, string branchId)
        {
            var courtIds = _dbContext.Courts
                            .Where(c => c.BranchId == branchId)
                            .Select(c => c.CourtId)
                            .ToList();

            if (!courtIds.Any())
            {
                return new List<TimeSlotModel>();
            }

            var unavailableSlots = new List<TimeSlotModel>();
            for (int i = 0; i < 7; i++)
            {
                var currentday = date.AddDays(i);
                var allTimeSlots = _dbContext.TimeSlots
             .Where(ts => ts.SlotDate == currentday)
             .AsEnumerable()
             .Where(ts => courtIds.Contains(ts.CourtId))
             .Select(ts => new TimeSlotModel
             {
                 SlotDate = ts.SlotDate,
                 SlotStartTime = ts.SlotStartTime,
                 SlotEndTime = ts.SlotEndTime
             })
             .Distinct()
             .ToList();

                foreach (var timeslot in allTimeSlots)
                {
                    var slotCheckModel = new SlotCheckModel
                    {
                        BranchId = branchId,
                        SlotDate = currentday,
                        TimeSlot = timeslot

                    };
                    if (CountTimeSlot(slotCheckModel) <= 0)
                    {
                        if (!unavailableSlots.Any(us => us.SlotStartTime == timeslot.SlotStartTime && us.SlotEndTime == timeslot.SlotEndTime && us.SlotDate  == timeslot.SlotDate))
                        {
                            unavailableSlots.Add(timeslot);
                        }

                    }

                }

            }

            return unavailableSlots;
        }


        public async Task<int> GetNumberOfSlotsForDateAsync(DateTime date)
        {

            var dateOnly = DateOnly.FromDateTime(date);
            var slotCount = await _dbContext.TimeSlots
                .Where(ts => ts.SlotDate == dateOnly)
                .CountAsync();

            return slotCount;
        }
    }
}
