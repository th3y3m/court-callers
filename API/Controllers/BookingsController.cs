using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BusinessObjects;
using DAOs.Models;
using Services;
using Microsoft.AspNetCore.Authorization;
using QRCoder;
using Page = DAOs.Helper;
using Repositories;
using Newtonsoft.Json;
using Qr = API.Helper;
using API.Helper;
using Microsoft.AspNetCore.Identity;
using Services.Interface;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]


    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingsController(IBookingService bookingService)
        {
            _bookingService = new BookingService();
        }

        // GET: api/Bookings
        [HttpGet]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<ActionResult<PagingResponse<Booking>>> GetBookings([FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
           [FromQuery] string searchQuery = null)
        {
            var pageResult = new Page.PageResult
            {
                PageSize = pageSize,
                PageNumber = pageNumber,
            };
            var (bookings, total) = await _bookingService.GetBookings(pageResult, searchQuery);

            var response = new PagingResponse<Booking>
            {
                Data = bookings,
                Total = total
            };
            return Ok(response);
        }

        // GET: api/Bookings/5
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Booking>> GetBooking(string id)
        {
            var booking = _bookingService.GetBooking(id);

            if (booking == null)
            {
                return NotFound();
            }

            return await booking;
        }

        [HttpGet("userId/{userId}")]
        [Authorize]
        public async Task<ActionResult<Booking>> GetBookingByUserId(string userId)
        {
            var bookings = _bookingService.GetBookingsByUserId(userId);

            if (bookings == null)
            {
                return NotFound();
            }

            return Ok(bookings);
        }

        // PUT: api/Bookings/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        //[HttpPut("{id}")]
        //public async Task<IActionResult> PutBooking(string id, Booking booking)
        //{
        //    if (id != booking.BookingId)
        //    {
        //        return BadRequest();
        //    }

        //    bookingService.Entry(booking).State = EntityState.Modified;

        //    return NoContent();
        //}

        // POST: api/Bookings
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754




        // DELETE: api/Bookings/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteBooking(string id)
        {
            var booking = _bookingService.GetBooking(id);
            if (booking == null)
            {
                return NotFound();
            }

            _bookingService.DeleteBooking(id);

            return NoContent();
        }

        //private bool BookingExists(string id)
        //{
        //    return bookingService.Bookings.Any(e => e.BookingId == id);
        //}

        [HttpGet("status/{status}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Booking>>> GetBookingsByStatus(string status)
        {
            return _bookingService.GetBookingsByStatus(status).ToList();
        }

        [HttpGet("search/{start}/{end}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Booking>>> SearchBookingsByTime(DateTime start, DateTime end)
        {
            return _bookingService.SearchBookingsByTime(start, end).ToList();
        }

        [HttpGet("search/{userId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Booking>>> GetBookingsByUser(string userId,
            [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var pageResult = new Page.PageResult
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            List<Booking> bookings = await _bookingService.GetBookingsByUserId(userId, pageResult);

            return Ok(bookings);
        }


        //[HttpPost("reserve")]
        //public async Task<IActionResult> ReserveSlot(string[] slotId, string userId)
        //{
        //    return await bookingService.PessimistLockAsync(slotId, userId);
        //}

        [HttpPost("reserve-slot")]
        [Authorize]
        public async Task<IActionResult> ReserveSlotV2(SlotModel[] slotModels, string userId)
        {
            try
            {
                var booking = _bookingService.ReserveSlotAsyncV2(slotModels, userId);
                return booking != null ? Ok(booking) : BadRequest("Failed to reserve slot.");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                // Log the exception (if logging is set up)
                return StatusCode(500, ex.Message);
            }
        }
        [HttpDelete("cancel/{bookingId}")]
        public async Task<IActionResult> CancelBooking(string bookingId)
        {
            try
            {
                await _bookingService.CancelBooking(bookingId);
                return Ok(new { message = "Booking cancelled successfully." });
            }
            catch (InvalidOperationException ex)
            {
                // Log the exception details here if necessary
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                // Handle other unexpected exceptions
                return StatusCode(500, new { error = "An error occurred while cancelling the booking." });
            }
        }



        [HttpDelete("delete/{bookingId}")]
        [Authorize]
        public async Task<IActionResult> DeleteBookingAndSetTimeSlot(string bookingId)
        {
            if (string.IsNullOrEmpty(bookingId))
            {
                return BadRequest("Invalid booking id.");
            }

            await _bookingService.DeleteBookingAndSetTimeSlotAsync(bookingId);

            return Ok("Booking deleted successfully.");
        }

        //post booking type flex
        [HttpPost("flex")]
        [Authorize]
        public async Task<ActionResult<Booking>> PostBookingTypeFlex(string userId, int numberOfSlot, string branchId)
        {

            var booking = _bookingService.AddBookingTypeFlex(userId, numberOfSlot, branchId);
            return CreatedAtAction("GetBooking", new { id = booking.BookingId }, booking);
        }

        [HttpPost("fix-slot")]
        [Authorize]
        public async Task<IActionResult> PostBookingTypeFix([FromQuery] int numberOfMonths,
            [FromQuery] string[] dayOfWeek, [FromQuery] DateOnly startDate, [FromBody] TimeSlotModel[] timeSlotModel,
            [FromQuery] string userId, string branchId)
        {
            var booking = await _bookingService.AddBookingTypeFix(numberOfMonths, dayOfWeek, startDate, timeSlotModel, userId,
                branchId);
            return booking is not null ? Ok(booking) : BadRequest("Fail to reserve slot type fix");
        }

        [HttpGet("sortBooking/{sortBy}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Booking>>> SortBookings(string sortBy, bool isAsc, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var pageResult = new Page.PageResult
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            List<Booking> bookings = await _bookingService.SortBookings(sortBy, isAsc, pageResult);

            return Ok(bookings);
        }

        //[HttpPost("api/checkin/qr")]
        //public async Task<IActionResult> CheckInWithQR([FromBody] QRCheckInModel request)
        //{
        //    var qrData = DecryptQRCode(request.QRCodeData); // Implement DecryptQRCode to parse QR code data

        //    var booking = await _bookingRepository.GetBooking(qrData.BookingId);
        //    if (booking != null && booking.Status == "complete" && booking.CustomerId == qrData.CustomerId)
        //    {
        //        booking.Status = "checked-in";
        //        await _bookingService.SaveChangesAsync();

        //        return Ok("Check-in successful.");
        //    }
        //    return BadRequest("Invalid QR code or booking.");
        //}

        [HttpGet("checkbookingtypeflex")]
        [Authorize]
        public ActionResult<CheckBookingTypeFlexModel> CheckAvaiableSlotsFromBookingTypeFlex(string userId, string branchId)
        {
            var bookingFlexModel = _bookingService.NumberOfSlotsAvailable(userId, branchId);
            var result = new CheckBookingTypeFlexModel
            {
                bookingId = bookingFlexModel.Item1,
                numberOfSlot = bookingFlexModel.Item2
            };

            return Ok(result);
        }

        // public int NumberOfSlotsAvailable(string userId,string bookingId)

        [Route("qrcode/{bookingId}")]
        [HttpGet]
        public async Task<IActionResult> GetQRCode(string bookingId)
        {
            var booking = _bookingService.GetBooking(bookingId);
            if (booking == null)
            {
                return NotFound("Booking not found.");
            }


            //              "bookingId": "12345",
            //"userId": "67890",
            //"branchId": "B001",
            //"courtId": "C002",
            //"slotDate": "2024-07-01", nên tạo các thứ này

            var qrData = new
            {
                BookingId = booking.Result.BookingId,

            };
            string qrString = JsonConvert.SerializeObject(qrData);
            string qrCodeBase64 = Qr.QrCode.GenerateQRCode(qrString);

            return Ok(new { qrCodeBase64 });
        }

        [HttpGet("daily-bookings")]
        [Authorize]

        public async Task<ActionResult<DailyBookingResponse>> GetDailyBookings(string? branchId)
        {
            var (todayCount, changePercentage) = await _bookingService.GetDailyBookings(branchId);

            var response = new DailyBookingResponse
            {
                TodayCount = todayCount,
                ChangePercentage = changePercentage
            };

            return Ok(response);
        }


        [HttpGet("weekly-bookings")]
        [Authorize]
        public async Task<ActionResult<DailyBookingResponse>> GetWeeklyBookings(string? branchId)
        {
            var (weeklyCount, changePercentage) = await _bookingService.GetWeeklyBookingsAsync(branchId);

            var response = new DailyBookingResponse
            {
                TodayCount = weeklyCount,
                ChangePercentage = changePercentage
            };

            return Ok(response);
        }

        [HttpGet("monthly-bookings")]
        [Authorize]
        public async Task<ActionResult<DailyBookingResponse>> GetMonthlyBookings(string? branchId)
        {
            var (monthlyCount, changePercentage) = await _bookingService.GetMonthlyBookingsAsync(branchId);

            var response = new DailyBookingResponse
            {
                TodayCount = monthlyCount,
                ChangePercentage = changePercentage
            };

            return Ok(response);
        }

        [HttpGet("bookings-from-start-of-week")]
        [Authorize]
        public async Task<IActionResult> GetBookingsFromStartOfWeek(string? branchId)
        {
            try
            {
                var result = await _bookingService.GetBookingsFromStartOfWeek(branchId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }
        [HttpGet("weekly-bookings-from-start-of-month")]

        public async Task<IActionResult> GetWeeklyBookingsFromStartOfMonth(string? branchId)
        {
            try
            {
                var result = await _bookingService.GetWeeklyBookingsFromStartOfMonth(branchId);
                return Ok(result);
            }
            catch (Exception ex)
            {

                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("monthly-bookings-from-start-of-year")]
        [Authorize]
        public async Task<IActionResult> GetMonthlyBookingsFromStartOfYear(string? branchId)
        {
            try
            {
                var result = await _bookingService.GetMonthlyBookingsFromStartOfYear(branchId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("daily-revenue")]
        [Authorize]
        public async Task<ActionResult<RevenueResponse>> GetDailyRevenue(string? branchId)
        {
            var (todayRevenue, changePercentage) = await _bookingService.GetDailyRevenue(branchId);

            var response = new RevenueResponse
            {
                Revenue = todayRevenue,
                ChangePercentage = changePercentage
            };

            return Ok(response);
        }

        [HttpGet("weekly-revenue")]
        [Authorize]
        public async Task<ActionResult<RevenueResponse>> GetWeeklyRevenue(string? branchId)
        {
            var (weeklyRevenue, changePercentage) = await _bookingService.GetWeeklyRevenueAsync(branchId);

            var response = new RevenueResponse
            {
                Revenue = weeklyRevenue,
                ChangePercentage = changePercentage
            };

            return Ok(response);
        }

        [HttpGet("monthly-revenue")]
        [Authorize]
        public async Task<ActionResult<RevenueResponse>> GetMonthlyRevenue(string? branchId)
        {
            var (monthlyRevenue, changePercentage) = await _bookingService.GetMonthlyRevenueAsync(branchId);

            var response = new RevenueResponse
            {
                Revenue = monthlyRevenue,
                ChangePercentage = changePercentage
            };

            return Ok(response);
        }

        [HttpGet("revenue-from-start-of-week")]
        [Authorize]
        public async Task<IActionResult> GetRevenueFromStartOfWeek(string? branchId)
        {
            try
            {
                var result = await _bookingService.GetRevenueFromStartOfWeek(branchId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("weekly-revenue-from-start-of-month")]
        [Authorize]
        public async Task<IActionResult> GetWeeklyRevenueFromStartOfMonth(string? branchId)
        {
            try
            {
                var result = await _bookingService.GetWeeklyRevenueFromStartOfMonth(branchId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("monthly-revenue-from-start-of-year")]
        [Authorize]
        public async Task<IActionResult> GetMonthlyRevenueFromStartOfYear(string? branchId)
        {
            try
            {
                var result = await _bookingService.GetMonthlyRevenueFromStartOfYear(branchId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }


    }
}
