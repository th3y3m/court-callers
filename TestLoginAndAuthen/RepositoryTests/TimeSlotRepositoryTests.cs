using BusinessObjects;
using DAOs.Models;
using DAOs;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Repositories;

namespace UnitTests.RepositoryTests
{
    public class TimeSlotRepositoryTests
    {
        private readonly Mock<DbSet<TimeSlot>> mockSet;
        private readonly Mock<CourtCallerDbContext> mockContext;
        private readonly List<TimeSlot> bookingList;
        private readonly TimeSlotDAO timeSlotDAO;
        private readonly CourtDAO courtDAO;
        private readonly TimeSlotRepository timeSlotRepository;

        public TimeSlotRepositoryTests()
        {
            // Initialize mock set and context
            mockSet = new Mock<DbSet<TimeSlot>>();
            mockContext = new Mock<CourtCallerDbContext>();
            bookingList = new List<TimeSlot>
            {
                new TimeSlot { SlotId = "S00001", SlotDate = DateOnly.FromDateTime(DateTime.Now), Status = "Reserved", CourtId = "C00001", BookingId = "B00001", SlotEndTime = new TimeOnly(8, 0), SlotStartTime = new TimeOnly(7, 0)  },
                new TimeSlot { SlotId = "S00002", SlotDate = DateOnly.FromDateTime(DateTime.Now), Status = "Reserved", CourtId = "C00001", BookingId = "B00001", SlotEndTime = new TimeOnly(9, 0), SlotStartTime = new TimeOnly(8, 0)  },
                new TimeSlot { SlotId = "S00003", SlotDate = DateOnly.FromDateTime(DateTime.Now), Status = "Reserved", CourtId = "C00001", BookingId = "B00001", SlotEndTime = new TimeOnly(10, 0), SlotStartTime = new TimeOnly(9, 0)  },
                new TimeSlot { SlotId = "S00004", SlotDate = DateOnly.FromDateTime(DateTime.Now), Status = "Reserved", CourtId = "C00001", BookingId = "B00001", SlotEndTime = new TimeOnly(11, 0), SlotStartTime = new TimeOnly(10, 0)  },
                new TimeSlot { SlotId = "S00005", SlotDate = DateOnly.FromDateTime(DateTime.Now), Status = "Reserved", CourtId = "C00001", BookingId = "B00001", SlotEndTime = new TimeOnly(12, 0), SlotStartTime = new TimeOnly(11, 0)  },
            };

            var data = bookingList.AsQueryable();

            mockSet.As<IQueryable<TimeSlot>>().Setup(m => m.Provider).Returns(data.Provider);
            mockSet.As<IQueryable<TimeSlot>>().Setup(m => m.Expression).Returns(data.Expression);
            mockSet.As<IQueryable<TimeSlot>>().Setup(m => m.ElementType).Returns(data.ElementType);
            mockSet.As<IQueryable<TimeSlot>>().Setup(m => m.GetEnumerator()).Returns(data.GetEnumerator());

            mockContext.Setup(c => c.TimeSlots).Returns(mockSet.Object);

            timeSlotDAO = new TimeSlotDAO(mockContext.Object);
            courtDAO = new CourtDAO(mockContext.Object);
            timeSlotRepository = new TimeSlotRepository(timeSlotDAO, courtDAO);
        }

        [Theory]
        [InlineData("B00001", 5)]
        [InlineData("B00002", 0)]
        [InlineData("B00003", 0)]
        public void GetTimeSlotsByBookingId_ReturnsTimeSlots(string bookingId, int count)
        {
            
            var timeSlots = timeSlotRepository.GetTimeSlotsByBookingId(bookingId);
            Assert.Equal(count, timeSlots.Count);
        }

        [Fact]
        public void GetTimeSlot_ReturnsTimeSlot()
        {
            
            var timeSlot = timeSlotRepository.GetTimeSlot("S00001");
            Assert.NotNull(timeSlot);
        }

        [Fact]
        public void AddTimeSlot_ReturnsTimeSlot()
        {
            
            var timeSlot = new TimeSlot
            {
                SlotId = "S00006",
                SlotDate = DateOnly.FromDateTime(DateTime.Now),
                Status = "Reserved",
                CourtId = "C00001",
                BookingId = "B00001",
                SlotEndTime = new TimeOnly(13, 0),
                SlotStartTime = new TimeOnly(12, 0)
            };
            var result = timeSlotRepository.AddTimeSlot(timeSlot);
            Assert.NotNull(result);
        }

        [Fact]
        public void UpdateTimeSlot_ReturnsTimeSlot()
        {
            
            var timeSlot = new SlotModel
            {
                SlotDate = DateOnly.FromDateTime(DateTime.Now),
                CourtId = "C00001",
                TimeSlot = new()
                {
                    SlotEndTime = new TimeOnly(13, 0),
                    SlotStartTime = new TimeOnly(12, 0)
                }
            };
            var result = timeSlotRepository.UpdateTimeSlot("S00001", timeSlot);
            Assert.NotNull(result);
        }


        [Fact]
        public void GetTimeSlotsByDate_ReturnsTimeSlots()
        {
            
            var timeSlots = timeSlotRepository.GetTimeSlotsByDate(DateOnly.FromDateTime(DateTime.Now));
            Assert.Equal(5, timeSlots.Count);
        }

        [Fact]
        public void IsSlotBookedInBranch_ReturnsFalse()
        {
            var slotModel = new SlotModel
            {
                BranchId = null,
                CourtId = "C00001",
                SlotDate = DateOnly.FromDateTime(DateTime.Now),
                TimeSlot = new()
                {
                    SlotEndTime = new TimeOnly(14, 0),
                    SlotStartTime = new TimeOnly(13, 0)
                }
            };
            var result = timeSlotRepository.IsSlotBookedInBranch(slotModel);
            Assert.False(result);
        }

        [Fact]
        public void IsSlotBookedInBranchV2_ReturnsFalse()
        {
            var slotModel = new SlotModel
            {
                BranchId = null,
                CourtId = "C00001",
                SlotDate = DateOnly.FromDateTime(DateTime.Now),
                TimeSlot = new()
                {
                    SlotEndTime = new TimeOnly(14, 0),
                    SlotStartTime = new TimeOnly(13, 0)
                }
            };
            var result = timeSlotRepository.IsSlotBookedInBranchV2(slotModel);
            Assert.False(result);
        }

        [Fact]
        public void GetTimeSlots_ReturnsTimeSlots()
        {
            var timeSlots = timeSlotRepository.GetTimeSlots();
            Assert.Equal(5, timeSlots.Count);
        }
    }
}
