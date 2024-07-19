using API.Controllers;
using BusinessObjects;
using DAOs;
using DAOs.Models;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Services.Interface;

namespace UnitTests.ControllerTests
{
    public class BookingsControllerTests
    {
        private readonly Mock<IBookingService> _mockBookingService;
        private readonly BookingsController _controller;


        public BookingsControllerTests()
        {
            _mockBookingService = new Mock<IBookingService>();

            _controller = new BookingsController(_mockBookingService.Object);
        }

        //[Fact]
        //public async Task ReserveSlotV2_ReturnsOk_WhenBookingIsSuccessful()
        //{
        //    // Arrange
        //    var slotModels = new SlotModel[]
        //    {
        //    new SlotModel
        //    {
        //        BranchId = "B00002",
        //        SlotDate = DateOnly.FromDateTime(DateTime.Now.AddDays(1)),
        //        CourtId = "C00002",
        //        TimeSlot = new TimeSlotModel
        //        {
        //            SlotStartTime = new TimeOnly(10, 0),
        //            SlotEndTime = new TimeOnly(11, 0)
        //        }
        //    }
        //    };
        //    string userId = "26191b56-76f4-4379-ae05-3356c6dacc16";
        //    var booking = new Booking
        //    {

        //        Id = userId,
        //        BranchId = "B00002",
        //        BookingDate = DateTime.Now,
        //        Status = "Pending",
        //        TotalPrice = 100,
        //        BookingType = "By Day",
        //        NumberOfSlot = slotModels.Length
        //    };

        //    _mockBookingService.Setup(service => service.ReserveSlotAsyncV2(It.IsAny<SlotModel[]>(), It.IsAny<string>()))
        //        .Returns(booking);


        //    var result = await _controller.ReserveSlotV2(slotModels, userId);


        //    var okResult = Assert.IsType<OkObjectResult>(result);
        //    var returnedBooking = Assert.IsType<Booking>(okResult.Value);
        //    Assert.Equal(booking.Id, returnedBooking.Id);
        //}

        //[Fact]
        //public async Task ReserveSlotV2_ReturnsBadRequest_WhenBookingFails()
        //{
        //    // Arrange
        //    var slotModels = new SlotModel[]
        //    {
        //    new SlotModel
        //    {
        //        BranchId = "B000019",
        //        SlotDate = DateOnly.FromDateTime(DateTime.Now),
        //        CourtId = "C00001",
        //        TimeSlot = new TimeSlotModel
        //        {
        //            SlotStartTime = new TimeOnly(9, 0),
        //            SlotEndTime = new TimeOnly(10, 0)
        //        }
        //    }
        //    };
        //    string userId = "26191b56-76f4-4379-ae05-3356c6dacc16";

        //    _mockBookingService.Setup(service => service.ReserveSlotAsyncV2(It.IsAny<SlotModel[]>(), It.IsAny<string>()))
        //        .Returns((Booking)null);

        //    var result = await _controller.ReserveSlotV2(slotModels, userId);


        //    var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        //    Assert.Equal("Failed to reserve slot.", badRequestResult.Value);
        //}

        [Fact]
        public async Task ReserveSlotV2_ReturnsBadRequest_WhenSlotModelsAreNull()
        {

            SlotModel[] slotModels = null;
            string userId = "26191b56-76f4-4379-ae05-3356c6dacc16";

            _mockBookingService.Setup(service => service.ReserveSlotAsyncV2(slotModels, userId))
                .Returns((Booking)null);


            var result = await _controller.ReserveSlotV2(slotModels, userId);


            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("SlotModels is not null or empty", badRequestResult.Value);
        }

        [Fact]
        public async Task ReserveSlotV2_ReturnsBadRequest_WhenSlotModelsAreEmpty()
        {

            var slotModels = new SlotModel[] { };
            string userId = "26191b56-76f4-4379-ae05-3356c6dacc16";

            _mockBookingService.Setup(service => service.ReserveSlotAsyncV2(slotModels, userId))
                .Returns((Booking)null);


            var result = await _controller.ReserveSlotV2(slotModels, userId);


            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("SlotModels is not null or empty", badRequestResult.Value);
        }

        //[Fact]
        //public async Task ReserveSlotV2_ReturnsBadRequest_WhenUserIdIsInvalid()
        //{

        //    var slotModels = new SlotModel[]
        //    {
        //    new SlotModel
        //    {
        //        BranchId = "B00002",
        //        SlotDate = DateOnly.FromDateTime(DateTime.Now.AddDays(1)),
        //        CourtId = "C00002",
        //        TimeSlot = new TimeSlotModel
        //        {
        //            SlotStartTime = new TimeOnly(10, 0),
        //            SlotEndTime = new TimeOnly(11, 0)
        //        }
        //    }
        //    };
        //    string userId = "INVALID_USER";

        //    _mockBookingService.Setup(service => service.ReserveSlotAsyncV2(slotModels, userId))
        //        .Returns((Booking)null);


        //    var result = await _controller.ReserveSlotV2(slotModels, userId);


        //    var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        //    Assert.Equal("userId is not null and having this user in system", badRequestResult.Value);
        //}

        // [Fact]
        // public async Task ReserveSlotV2_ReturnsInternalServerError_WhenExceptionIsThrown()
        // {
        //     // Arrange
        //     var slotModels = new SlotModel[]
        //     {
        //     new SlotModel
        //     {
        //         BranchId = "B000026",
        //         SlotDate = DateOnly.FromDateTime(DateTime.Now.AddDays(1)),
        //         CourtId = "C00002",
        //         TimeSlot = new TimeSlotModel
        //         {
        //             SlotStartTime = new TimeOnly(10, 0),
        //             SlotEndTime = new TimeOnly(11, 0)
        //         }
        //     }
        //     };
        //     string userId = "26191b56-76f4-4379-ae05-3356c6dacc16";

        //     _mockBranchDAO.Setup(dao => dao.GetBranchesByCourtId(It.IsAny<string>()))
        //.Throws(new Exception("Internal server error"));

        //     // Act
        //     var result = await _controller.ReserveSlotV2(slotModels, userId);

        //     // Assert
        //     var statusCodeResult = Assert.IsType<ObjectResult>(result);
        //     Assert.Equal(500, statusCodeResult.StatusCode);
        //     Assert.Equal("Internal server error", statusCodeResult.Value);
        // }
    }
}
