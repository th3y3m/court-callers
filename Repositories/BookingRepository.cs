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
using DAOs.Helper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace Repositories
{
    public class BookingRepository
    {
        private readonly BookingDAO _bookingDao = null;
        private readonly TimeSlotDAO _timeSlotDao = null;
        private readonly PriceDAO _priceDao = null;
        private readonly UserDAO _userDao = null;
        private readonly UserDetailDAO _userDetailDao = null;
        private readonly TimeSlotRepository _timeSlotRepository = null;
        private readonly BranchDAO _branchDAO = null;


        public BookingRepository()
        {
            if (_bookingDao == null)
            {
                _bookingDao = new BookingDAO();
            }

            if (_timeSlotDao == null)
            {
                _timeSlotDao = new TimeSlotDAO();
            }

            if (_priceDao == null)
            {
                _priceDao = new PriceDAO();
            }

            if (_timeSlotRepository == null)
            {
                _timeSlotRepository = new TimeSlotRepository();
            }

            if (_userDao == null)
            {
                _userDao = new UserDAO();
            }

            if (_userDetailDao == null)
            {
                _userDetailDao = new UserDetailDAO();
            }

            if (_branchDAO == null)
            {
                _branchDAO = new BranchDAO();
            }
        }


        public BookingRepository(BookingDAO bookingDAO, TimeSlotDAO timeSlotDAO, PriceDAO priceDAO, TimeSlotRepository timeSlotRepository, UserDAO user, UserDetailDAO userDetailDAO, BranchDAO branchDAO)
        {
            _bookingDao = bookingDAO;
            _timeSlotDao = timeSlotDAO;
            _priceDao = priceDAO;
            _timeSlotRepository = timeSlotRepository;
            _userDao = user;
            _userDetailDao = userDetailDAO;
            _branchDAO = branchDAO;
        }

        //public Booking AddBooking(Booking Booking) => BookingDAO.AddBooking(Booking);
        public List<Booking> GetBookingsByUserId(string userId) => _bookingDao.GetBookingsByUserId(userId);

        public async Task UpdateBooking(Booking booking) => await _bookingDao.UpdateBooking(booking);

        public void DeleteBooking(string id) => _bookingDao.DeleteBooking(id);

        public async Task<Booking> GetBooking(string id) => await _bookingDao.GetBooking(id);


        public async Task<(List<Booking>, int total)> GetBookings(PageResult pageResult, string searchQuery = null) =>
            await _bookingDao.GetBookings(pageResult, searchQuery);

        public List<Booking> GetBookingsByStatus(string status) => _bookingDao.GetBookingsByStatus(status);

        public async Task SaveChangesAsync() => await _bookingDao.SaveChangesAsync();
        public List<Booking> SearchBookingsByTime(DateTime start, DateTime end) => _bookingDao.SearchBookingsByTime(start, end);

        public async Task<List<Booking>> GetBookingsByUserId(string userId, PageResult pageResult) => await _bookingDao.GetBookingsByUserId(userId, pageResult);



        public async Task<TimeSlot> AddBookingTransaction(string slotId)
        {
            return await _bookingDao.AddBookingTransaction(slotId);
        }

        //add timeslot first then add booking
        //public async Task<bool> ReserveSlotAsync(string[] slotId, string userId)
        //{
        //    await _bookingDao.BeginTransactionAsync();

        //    try
        //    {
        //        foreach (var s in slotId)
        //        {
        //            var slot = await AddBookingTransaction(s);

        //            if (slot == null)
        //            {
        //                return false;
        //            }


        //        }

        //        decimal paymentAmount = 0;

        //        foreach (var s in slotId)
        //        {
        //            var slot = await AddBookingTransaction(s);
        //            slot.Status = "false";
        //            _timeSlotDao.UpdateSlot(slot);
        //            paymentAmount += slot.Price;
        //        }

        //        var generateBookingId = GenerateId.GenerateShortBookingId();




        //        // Tạo booking mới
        //        var booking = new Booking
        //        {
        //            BookingId = generateBookingId,
        //            Id = userId,
        //            BookingDate = DateTime.Now,
        //            Status = "False",
        //            TotalPrice = paymentAmount
        //        };

        //        _bookingDao.AddBooking(booking);
        //        await _bookingDao.SaveChangesAsync();
        //        await _bookingDao.CommitTransactionAsync();

        //        foreach (var s in slotId)
        //        {
        //            _timeSlotDao.UpdateBookinginSlot(s, generateBookingId);
        //        }

        //        return true;
        //        // var slot = await AddBookingTransaction(slotId);

        //        // if (slot == null)
        //        // {
        //        //     return false;
        //        // }

        //        // var generateBookingId = GenerateId.GenerateShortBookingId();

        //        // // Cập nhật trạng thái slot
        //        // slot.IsAvailable = false;
        //        //_timeSlotDao.UpdateSlot(slot);




        //        // // Tạo booking mới
        //        // var booking = new Booking
        //        // {
        //        //     BookingId = generateBookingId,
        //        //     Id = userId,
        //        //     BookingDate = DateTime.Now,
        //        //     Status = "True",
        //        //     TotalPrice = paymentAmount
        //        // };

        //        // _bookingDao.AddBooking(booking);
        //        // await _bookingDao.SaveChangesAsync();
        //        // await _bookingDao.CommitTransactionAsync();
        //        // _timeSlotDao.UpdateBookinginSlot(slotId, generateBookingId);

        //        // return true;
        //    }
        //    catch (DbUpdateException ex)
        //    {

        //        await _bookingDao.RollbackTransactionAsync();
        //        throw;
        //    }
        //    catch (Exception ex)
        //    {

        //        await _bookingDao.RollbackTransactionAsync();
        //        throw;
        //    }
        //}

        public Booking ReserveSlotAsyncV2(SlotModel[] slotModels, string userId)
        {
            //await _bookingDao.BeginTransactionAsync();
            string branchId;
            try
            {
                if(slotModels.IsNullOrEmpty())
                {
                    throw new ArgumentException("SlotModels is not null or empty");
                }
                if (userId.IsNullOrEmpty() || _userDao.GetUser(userId) is null)
                {
                    throw new ArgumentException("userId is not null and having this user in system");
                }
                foreach (var s in slotModels)
                {
                    if (_timeSlotRepository.IsSlotBookedInBranch(s))
                    {
                        return null;
                    }
                }

                if (slotModels[0].CourtId != null)
                {
                    branchId = _branchDAO.GetBranchesByCourtId(slotModels[0].CourtId).FirstOrDefault().BranchId;
                }
                else
                {
                    branchId = slotModels[0].BranchId;
                }

                if (CheckAvaiableSlotsFromBookingTypeFlex(userId, branchId) != null)
                {

                    Booking booking = CheckAvaiableSlotsFromBookingTypeFlex(userId, branchId);
                    foreach (var s in slotModels)
                    {
                        TimeSlot timeSlot = _timeSlotDao.AddSlotToBooking(s, booking.BookingId);
                    }
                    return booking;
                }
                else
                {
                    decimal paymentAmount = 0;

                    var generateBookingId = GenerateId.GenerateShortBookingId();

                    var booking = new Booking
                    {
                        BookingId = generateBookingId,
                        Id = userId,
                        BookingDate = DateTime.Now,
                        BranchId = branchId,
                        Status = "Pending",
                        TotalPrice = 0,
                        BookingType = "By Day",
                        NumberOfSlot = slotModels.Length
                    };
                    _bookingDao.AddBooking(booking);

                    foreach (var s in slotModels)
                    {
                        TimeSlot timeSlot = _timeSlotDao.AddSlotToBooking(s, generateBookingId);
                        paymentAmount += timeSlot.Price;
                    }

                    _bookingDao.UpdateBooking(generateBookingId, paymentAmount);
                    UserDetail userDetail = _userDetailDao.GetUserDetail(userId);
                    userDetail.Point += paymentAmount;
                    _userDetailDao.UpdateUserDetail(userDetail);
                    return booking;
                }

                return null;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task DeleteBookingAndSetTimeSlotAsync(string bookingId) =>
            await _timeSlotDao.DeleteBookingAndSetTimeSlotAsync(bookingId);

        //public async Task<bool> FlexibleBooking(string userId, int numberOfSlot)
        //{
        //    await _bookingDao.BeginTransactionAsync();
        //    Booking booking = new Booking
        //    {
        //        BookingId = "B" + GenerateId.GenerateShortBookingId(),
        //        Id = userId,
        //        BookingDate = DateTime.Now,
        //        Status = "True",
        //        TotalPrice = 50 * numberOfSlot,
        //        BookingType = "Flex",
        //        TimeSlots = new TimeSlot[numberOfSlot],
        //    };
        //    return true;
        //}

        //đã đảm bảo chỉ ra booking loại flex mà chưa đủ slot
        public Booking CheckAvaiableSlotsFromBookingTypeFlex(string userId, string branchId)
        {
            var bookings = _bookingDao.GetBookingTypeFlex(userId);
            foreach (var booking in bookings)
            {
                if (booking.NumberOfSlot > _timeSlotDao.NumberOfSlotsInBooking(booking.BookingId) &&
                    booking.BranchId == branchId
                    )
                {
                    return booking;
                }
            }
            return null;
        }

        public (string , int) NumberOfSlotsAvailable(string userId,string branchId) {
            var booking = CheckAvaiableSlotsFromBookingTypeFlex(userId, branchId);
            
            if (booking is null || booking.BookingId is null ) return (null,0);
            string bookingId = booking.BookingId;
            int numberOfSlotsAvailable = booking.NumberOfSlot - _timeSlotDao.NumberOfSlotsInBooking(booking.BookingId);
            return (bookingId, numberOfSlotsAvailable) ;
        }

        public Booking AddBookingTypeFlex(string userId, int numberOfSlot, string branchId)
        {
            Decimal totalPrice = _priceDao.GetSlotPriceOfBookingFlex(branchId) * numberOfSlot;
            Booking booking = new Booking
            {
                BookingId = "B" + GenerateId.GenerateShortBookingId(),
                Id = userId,
                BookingDate = DateTime.Now,
                BranchId = branchId,
                Status = "Pending",
                TotalPrice = totalPrice,
                BookingType = "Flex",
                NumberOfSlot = numberOfSlot,
            };
            _bookingDao.AddBooking(booking);
            UserDetail userDetail = _userDetailDao.GetUserDetail(userId);
            userDetail.Point += totalPrice;
            _userDetailDao.UpdateUserDetail(userDetail);

            return booking;
        }

        //public async Task<bool> AddBookingTypeFix(int numberOfMonths, string[] dayOfWeek, DateOnly startDate, SlotModel slotModel, string userId)
        //{
        //    DateOnly endDate = startDate.AddMonths(numberOfMonths);

        //    for (var date = startDate; date <= endDate; date = date.AddDays(1))
        //    {
        //        foreach (var day in dayOfWeek)
        //        {
        //            if (date.DayOfWeek.ToString().Equals(day))
        //            {
        //                if (_timeSlotRepository.IsSlotBookedInBranch(slotModel))
        //                {
        //                    return false;
        //                }
        //            }
        //        }
        //    }

        //    string bookingId = GenerateId.GenerateShortBookingId();
        //    int numberOfslots = 0;

        //    Booking booking = new Booking
        //    {
        //        BookingId = bookingId,
        //        Id = userId,
        //        BookingDate = DateTime.Now,
        //        Status = "True",
        //        TotalPrice = _priceDao.GetPriceByBranchAndWeekend(slotModel.BranchId, false).SlotPrice * numberOfMonths * 9 / 10,
        //        BookingType = "Fix"

        //    };
        //    _bookingDao.AddBooking(booking);
        //    for (var date = startDate; date <= endDate; date = date.AddDays(1))
        //    {
        //        foreach (var day in dayOfWeek)
        //        {
        //            if (date.DayOfWeek.ToString().Equals(day))
        //            {
        //                TimeSlot timeSlot = _timeSlotDao.AddSlotToBooking(slotModel, booking.BookingId);
        //                numberOfslots++;
        //            }
        //        }
        //    }
        //    booking.NumberOfSlot = numberOfslots;
        //    _bookingDao.UpdateBooking(bookingId, booking.TotalPrice);

        //    return true;
        //}
        public async Task<Booking> AddBookingTypeFix(int numberOfMonths, string[] dayOfWeek, DateOnly startDate, TimeSlotModel[] timeSlotModels, string userId, string branchId)
        {
            DateOnly endDate = startDate.AddDays(numberOfMonths * 30 - 1);
            List<DateOnly> validDates = new List<DateOnly>();

            // Collect all valid dates first
            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                if (dayOfWeek.Contains(date.DayOfWeek.ToString()))
                {
                    validDates.Add(date);
                }
            }

            // Check if any slot is already booked
            foreach (var timeSlotModel in timeSlotModels)
            {
                foreach (var date in validDates)
                {
                    // Assuming IsSlotBookedInBranch method can check a specific time slot for a given date
                    if (_timeSlotRepository.IsSlotBookedInBranch(new SlotModel()
                    {
                        BranchId = branchId,
                        SlotDate = date,
                        // Assuming TimeSlotModel has properties that can be mapped to SlotModel or they are the same
                        // You might need to adjust this part based on your actual model structure
                        TimeSlot = timeSlotModel
                    }))
                    {
                        return null; // Found a booked slot, return null
                    }
                }
            }

            string bookingId = GenerateId.GenerateShortBookingId();
            int numberOfSlots = validDates.Count * timeSlotModels.Length; // Assuming one slot per valid date per TimeSlotModel

            decimal totalPrice = _priceDao.GetSlotPriceOfBookingFix(branchId) * numberOfSlots;

            Booking booking = new Booking
            {
                BookingId = bookingId,
                Id = userId,
                BookingDate = DateTime.Now,
                Status = "Pending",
                BranchId = branchId,
                TotalPrice = totalPrice,
                BookingType = "Fix",
                NumberOfSlot = numberOfSlots
            };

            _bookingDao.AddBooking(booking);

            // Add slots to booking for each valid date
            foreach (var timeSlotModel in timeSlotModels)
            {
                foreach (var date in validDates)
                {
                    _timeSlotDao.AddSlotToBooking(new SlotModel()
                    {
                        BranchId = branchId,
                        SlotDate = date,
                        TimeSlot = timeSlotModel
                    }, booking.BookingId);
                }
            }

            await _bookingDao.SaveChangesAsync();
            UserDetail userDetail = _userDetailDao.GetUserDetail(userId);
            userDetail.Point += totalPrice;
            _userDetailDao.UpdateUserDetail(userDetail);
            return booking;
        }

        public async void CancelBooking(string bookingId)
        {
            List<TimeSlot> timeSlots = _timeSlotDao.GetTimeSlotsByBookingId(bookingId);
            bool isExpired = timeSlots.Any(timeSlot =>
                timeSlot.SlotDate.CompareTo(DateOnly.FromDateTime(DateTime.Now)) < 0 ||
                (timeSlot.SlotDate.Equals(DateOnly.FromDateTime(DateTime.Now)) &&
                 timeSlot.SlotStartTime.CompareTo(TimeOnly.FromDateTime(DateTime.Now)) < 0));
            if (!isExpired)
            {
                foreach (var timeSlot in timeSlots)
                {
                    _timeSlotDao.DeleteTimeSlot(timeSlot.SlotId);
                }
            }

            IdentityUser user = _userDao.GetUserByBookingId(bookingId);
            Booking booking = await GetBooking(bookingId);
            UserDetail userDetail = _userDetailDao.GetUserDetail(user.Id);

            userDetail.Balance += booking.TotalPrice / 2;
            userDetail.Point -= booking.TotalPrice;

            _userDetailDao.UpdateUserDetail(userDetail);
            _bookingDao.DeleteBooking(bookingId);
        }

        public async Task<List<Booking>> SortBookings(string? sortBy, bool isAsc, PageResult pageResult) => await _bookingDao.SortBookings(sortBy, isAsc, pageResult);


        public async Task<(IEnumerable<BookingResponse>, int count)> GetDailyBookings() => await _bookingDao.GetDailyBookings();

        public async Task<(IEnumerable<WeeklyBookingResponse>, decimal)> GetWeeklyBookingsAsync() => await _bookingDao.GetWeeklyBookingsAsync();

        public async Task<List<Booking>> GetBookingsForLastWeekAsync() => await _bookingDao.GetBookingsForLastWeekAsync();
    }
 
}
