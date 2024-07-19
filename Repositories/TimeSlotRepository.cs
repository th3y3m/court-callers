using BusinessObjects;
using DAOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAOs.Helper;
using DAOs.Models;
using Microsoft.EntityFrameworkCore;

namespace Repositories
{
    public class TimeSlotRepository
    {
        private readonly TimeSlotDAO _timeSlotDao = null;
        private readonly CourtDAO _courtDao = null;
        public TimeSlotRepository()
        {
            if (_timeSlotDao == null)
            {
                _timeSlotDao = new TimeSlotDAO();
            }

            if (_courtDao == null)
            {
                _courtDao = new CourtDAO();
            }
        }
        public async Task<List<TimeSlot>> GetTimeSlotsByCourtId(string courtId, PageResult pageResult, string searchQuery = null)
=> await _timeSlotDao.GetTimeSlotsByCourtId(courtId, pageResult, searchQuery);

        public TimeSlotRepository(TimeSlotDAO timeSlotDao, CourtDAO courtDao)
        {
            _timeSlotDao = timeSlotDao;
            _courtDao = courtDao;
        }
        public TimeSlot AddTimeSlot(TimeSlot timeSlot) => _timeSlotDao.AddTimeSlot(timeSlot);

        public async Task<List<TimeSlot>> GetTimeSlots(PageResult pageResult, string searchQuery = null) => await _timeSlotDao.GetTimeSlots(pageResult, searchQuery);
        public async Task<List<TimeSlot>> GetTimeSlotsByUserId(string userId, PageResult pageResult) => await _timeSlotDao.GetTimeSlotsByUserId(userId, pageResult);

        public List<TimeSlot> GetTimeSlotsByDate(DateOnly dateOnly) => _timeSlotDao.GetTimeSlotsByDate(dateOnly);
        public void DeleteTimeSlot(string id) => _timeSlotDao.DeleteTimeSlot(id);

        public TimeSlot GetTimeSlot(string id) => _timeSlotDao.GetTimeSlot(id);

        public List<TimeSlot> GetTimeSlots() => _timeSlotDao.GetTimeSlots();
        public async Task UpdateTimeSlotWithObject(TimeSlot timeSlot) => await _timeSlotDao.UpdateTimeSlotWithObject(timeSlot);

        public async Task<TimeSlot> UpdateTimeSlot(string id, SlotModel slotModel) => await _timeSlotDao.UpdateTimeSlot(id, slotModel);

        public bool IsSlotBookedInBranch(SlotModel slotModel)
        {
            bool isBooked = true;
            if (slotModel.BranchId == null)
            {
                isBooked = _timeSlotDao.GetTimeSlots().Any(t =>
                    t.CourtId == slotModel.CourtId &&
                    t.SlotDate == slotModel.SlotDate &&
                    t.SlotStartTime == slotModel.TimeSlot.SlotStartTime &&
                    t.SlotEndTime == slotModel.TimeSlot.SlotEndTime);
            }
            else
            {
                List<Court> courtsInBranch = _courtDao.GetCourts().Where(c => c.BranchId == slotModel.BranchId && c.Status == "Active").ToList(); 
                foreach (var court in courtsInBranch)
                {
                    isBooked = false;
                    List<TimeSlot> timeSlots = _timeSlotDao.GetTimeSlots().Where(t => t.CourtId == court.CourtId).ToList();
                    foreach (var timeSlot in timeSlots)
                    {
                        if (slotModel.SlotDate == timeSlot.SlotDate && slotModel.TimeSlot.SlotStartTime == timeSlot.SlotStartTime && slotModel.TimeSlot.SlotEndTime == timeSlot.SlotEndTime)
                        {
                            isBooked = true;
                            break;
                        }
                    }
                    if (!isBooked)
                    {
                        break;
                    }
                }
    //            isBooked = _courtDao.GetCourts()
    //.Where(c => c.BranchId == slotModel.BranchId)
    //.All(court => _timeSlotDao.GetTimeSlots()
    //    .Where(t => t.CourtId == court.CourtId)
    //    .Any(timeSlot => slotModel.SlotDate == timeSlot.SlotDate &&
    //                     slotModel.TimeSlot.SlotStartTime == timeSlot.SlotStartTime &&
    //                     slotModel.TimeSlot.SlotEndTime == timeSlot.SlotEndTime));

            }
            return isBooked;
        }

        public bool IsSlotBookedInBranchV2(SlotModel slotModel)
        {
            if (slotModel.BranchId == null)
            {
                return _timeSlotDao.GetTimeSlots().Any(t =>
                    t.CourtId == slotModel.CourtId &&
                    t.SlotDate == slotModel.SlotDate &&
                    t.SlotStartTime == slotModel.TimeSlot.SlotStartTime &&
                    t.SlotEndTime == slotModel.TimeSlot.SlotEndTime);
            }
            else
            {
                List<Court> courtsInBranch = _courtDao.GetCourts().Where(c => c.BranchId == slotModel.BranchId && c.Status == "Active").ToList();
                foreach (var court in courtsInBranch)
                {
                    bool isBooked = _timeSlotDao.GetTimeSlots().Any(t =>
                        t.CourtId == court.CourtId &&
                        t.SlotDate == slotModel.SlotDate &&
                        t.SlotStartTime == slotModel.TimeSlot.SlotStartTime &&
                        t.SlotEndTime == slotModel.TimeSlot.SlotEndTime &&
                        t.Status == "Pending");

                    if (!isBooked)
                    {
                        return false;
                    }
                }
                return true;
            }
        }


        public List<TimeSlot> GetTimeSlotsByBookingId(string bookingId) => _timeSlotDao.GetTimeSlotsByBookingId(bookingId);

        public TimeSlot ChangeSlot(SlotModel slotModel, string slotId)
        {

            if (IsSlotBookedInBranch(slotModel))
            {
                return null;
            }

            var timeSlot = _timeSlotDao.GetTimeSlots().FirstOrDefault(t =>
                t.SlotId == slotId);

            if (timeSlot != null)
            {
                DeleteTimeSlot(slotId);
                TimeSlot newTimeSlot = _timeSlotDao.AddSlotToBooking(slotModel, timeSlot.BookingId);
                return newTimeSlot;
            }
            return null;
        }

        public async Task<List<TimeSlot>> SortTimeSlot(string? sortBy, bool isAsc, PageResult pageResult) => await _timeSlotDao.SortTimeSlot(sortBy, isAsc, pageResult);

        public int CountTimeSlot(SlotCheckModel slotCheckModel) => _timeSlotDao.CountTimeSlot(slotCheckModel);

        public List<TimeSlotModel> UnavailableSlot(DateOnly date, string branchId) => _timeSlotDao.UnavailableSlot(date,  branchId);

        public List<TimeSlot> AddSlotToBooking(SlotModel[] slotModel, string bookingId)
        {
            var timeSlots = new List<TimeSlot>();
            foreach (var s in slotModel)
            {
                TimeSlot timeSlot = _timeSlotDao.AddSlotToBooking(s, bookingId);
                timeSlots.Add(timeSlot);
            }
            return timeSlots;
        }

        public async Task<int> GetNumberOfSlotsForDateAsync(DateTime date) => await _timeSlotDao.GetNumberOfSlotsForDateAsync(date);
    }

    
}
