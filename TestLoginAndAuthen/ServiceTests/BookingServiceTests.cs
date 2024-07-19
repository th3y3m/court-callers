using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using API.Controllers;
using DAOs.Models;
using BusinessObjects;
using Services;
using System.Collections.Generic;
using System.Reflection;

namespace UnitTests.ServiceTests
{

    public class BookingServiceTests
    {
        private readonly Mock<BookingService> _bookingServiceMock;
        private readonly BookingsController _bookingController;

        public BookingServiceTests()
        {
            _bookingServiceMock = new Mock<BookingService> { CallBase = true };
            _bookingController = new BookingsController(_bookingServiceMock.Object);

            var field = typeof(BookingsController).GetField("_bookingService", BindingFlags.NonPublic | BindingFlags.Instance);
            field.SetValue(_bookingController, _bookingServiceMock.Object);
        }

        [Fact]
        public async Task CancelBooking_ValidId_ReturnsOk()
        {
            var result = await _bookingController.CancelBooking("valid-id");
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Booking cancelled successfully.", okResult.Value);
        }

        [Fact]
        public async Task CancelBooking_InvalidId_ReturnsBadRequest()
        {

            var result = await _bookingController.CancelBooking("");
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Invalid booking id.", badRequestResult.Value);
        }
    }
}
