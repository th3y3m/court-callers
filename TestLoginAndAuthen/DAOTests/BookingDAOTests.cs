using BusinessObjects;
using DAOs;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UnitTests.DAOTests
{
    public class BookingDAOTests
    {
        private readonly Mock<DbSet<Booking>> mockSet;
        private readonly Mock<CourtCallerDbContext> mockContext;
        private readonly List<Booking> bookingList;

        public BookingDAOTests()
        {
            // Initialize mock set and context
            mockSet = new Mock<DbSet<Booking>>();
            mockContext = new Mock<CourtCallerDbContext>();
            bookingList = new List<Booking>
            {
                new Booking { BookingId = "B00001", BookingDate = DateTime.Now.AddDays(2), Status = "Pending", BookingType = "By day", NumberOfSlot = 5, Id = "C001" },
                new Booking { BookingId = "B00002", BookingDate = DateTime.Now.AddDays(5), Status = "Pending", BookingType = "Fix", NumberOfSlot = 50, Id = "C001" },
                new Booking { BookingId = "B00003", BookingDate = DateTime.Now.AddDays(10), Status = "Complete", BookingType = "Flex", NumberOfSlot = 3, Id = "C002" },
                new Booking { BookingId = "B00003", BookingDate = DateTime.Now, Status = "Complete", BookingType = "Flex", NumberOfSlot = 3, Id = "C002" },
                new Booking { BookingId = "B00003", BookingDate = DateTime.Now, Status = "Fail", BookingType = "Flex", NumberOfSlot = 3, Id = "C001" }
            };

            var data = bookingList.AsQueryable();

            mockSet.As<IQueryable<Booking>>().Setup(m => m.Provider).Returns(data.Provider);
            mockSet.As<IQueryable<Booking>>().Setup(m => m.Expression).Returns(data.Expression);
            mockSet.As<IQueryable<Booking>>().Setup(m => m.ElementType).Returns(data.ElementType);
            mockSet.As<IQueryable<Booking>>().Setup(m => m.GetEnumerator()).Returns(data.GetEnumerator());

            mockContext.Setup(c => c.Bookings).Returns(mockSet.Object);
        }

        [Theory]
        [InlineData("C001", 1)]
        [InlineData("C002", 2)]
        [InlineData("C003", 0)]
        public void GetBookingsTypeFlex_ReturnsBookings(string userId, int count)
        {
            var dao = new BookingDAO(mockContext.Object);
            var bookings = dao.GetBookingTypeFlex(userId);
            Assert.Equal(count, bookings.Count);
        }

        [Fact]
        public void GetBookingsByUserId_ReturnsBookings()
        {
            var dao = new BookingDAO(mockContext.Object);
            var bookings = dao.GetBookingsByUserId("C001");
            Assert.Equal(3, bookings.Count);
        }

        [Fact]
        public void SearchBookingsByTime_ReturnsBookings()
        {
            var dao = new BookingDAO(mockContext.Object
            );
            var bookings = dao.SearchBookingsByTime(DateTime.Now.AddDays(1), DateTime.Now.AddDays(11));
            Assert.Equal(3, bookings.Count);
        }

        [Theory]
        [InlineData("Pending", 2)]
        [InlineData("Complete", 2)]
        [InlineData("Fail", 1)]
        public void GetBookingsByStatus_ReturnsBookings(string status, int count)
        {
            var dao = new BookingDAO(mockContext.Object);
            var bookings = dao.GetBookingsByStatus(status);
            Assert.Equal(count, bookings.Count);
        }
    }
}
