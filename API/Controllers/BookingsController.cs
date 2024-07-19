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
        public async Task<ActionResult<PagingResponse<Booking>>> GetBookings([FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
           [FromQuery] string searchQuery = null)
        {
            var pageResult = new Page.PageResult
            {
                PageSize = pageSize,
                PageNumber = pageNumber,
            };
            var (bookings,total) = await _bookingService.GetBookings(pageResult,searchQuery);

            var response = new PagingResponse<Booking>
            {
                Data = bookings,
                Total = total
            };
            return Ok(response);
        }

        // GET: api/Bookings/5
        [HttpGet("{id}")]
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
        public async Task<ActionResult<IEnumerable<Booking>>> GetBookingsByStatus(string status)
        {
            return _bookingService.GetBookingsByStatus(status).ToList();
        }

        [HttpGet("search/{start}/{end}")]
        public async Task<ActionResult<IEnumerable<Booking>>> SearchBookingsByTime(DateTime start, DateTime end)
        {
            return _bookingService.SearchBookingsByTime(start, end).ToList();
        }

        [HttpGet("search/{userId}")]
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

        [HttpDelete("cancelBooking/{bookingId}")]
        public async Task<IActionResult> CancelBooking(string bookingId)
        {
            if (string.IsNullOrEmpty(bookingId))
            {
                return BadRequest("Invalid booking id.");
            }

            _bookingService.CancelBooking(bookingId);

            return Ok("Booking cancelled successfully.");
        }

        [HttpDelete("delete/{bookingId}")]
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
        public async Task<ActionResult<Booking>> PostBookingTypeFlex(string userId, int numberOfSlot, string branchId)
        {

            var booking = _bookingService.AddBookingTypeFlex(userId, numberOfSlot, branchId);
            return CreatedAtAction("GetBooking", new { id = booking.BookingId }, booking);
        }

        [HttpPost("fix-slot")]
        public async Task<IActionResult> PostBookingTypeFix([FromQuery] int numberOfMonths,
            [FromQuery] string[] dayOfWeek, [FromQuery] DateOnly startDate, [FromBody] TimeSlotModel[] timeSlotModel,
            [FromQuery] string userId, string branchId)
        {
            var booking = await _bookingService.AddBookingTypeFix(numberOfMonths, dayOfWeek, startDate, timeSlotModel, userId,
                branchId);
            return booking is not null ? Ok(booking) : BadRequest("Fail to reserve slot type fix");
        }

        [HttpGet("sortBooking/{sortBy}")]
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
        public  ActionResult<CheckBookingTypeFlexModel> CheckAvaiableSlotsFromBookingTypeFlex(string userId, string branchId)
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
        public async Task<ActionResult<PagingResponse<BookingResponse>>> GetDailyBookings()
        {
            var (dailyBookings,total) = await _bookingService.GetDailyBookings();
            var response = new PagingResponse<BookingResponse>
            {
                Data = dailyBookings,
                Total = total
            };
            return Ok(response);
        }

        [HttpGet("weekly-bookings")]
        public async Task<IActionResult> GetWeeklyBookings()
        {
            var result = await _bookingService.GetWeeklyBookingsAsync();
            return Ok(new { data = result.Item1, total = result.Item2 });
        }

       
    }
}
