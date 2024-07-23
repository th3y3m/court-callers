using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BusinessObjects;
using DAOs.Helper;
using Services;
using DAOs.Models;
using Services.Interface;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly PaymentService _paymentService = new PaymentService();
        private readonly TokenForPayment _tokenForPayment;

        public PaymentsController(TokenForPayment tokenForPayment)
        {

            _tokenForPayment = tokenForPayment;
        }

        // GET: api/Payments
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Payment>>> GetPayments()
        {
            return _paymentService.GetPayments();
        }

        [HttpGet("GetPayments")]
        [Authorize]

        public async Task<ActionResult<PagingResponse<Payment>>> GetPayments([FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {

            var pageResult = new PageResult
            {
                PageSize = pageSize,
                PageNumber = pageNumber,
            };
            var (payments, total) = await _paymentService.GetPayments(pageResult);

            var response = new PagingResponse<Payment>
            {
                Data = payments,
                Total = total
            };
            return Ok(response);
        }

        [HttpGet("GetPaymentsByDate")]
        [Authorize]
        public async Task<ActionResult<PagingResponse<Payment>>> GetPaymentsByDate(
            [FromQuery] int? day, 
            [FromQuery] int? month, 
            [FromQuery] int? year,
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 10
            )
        {

            var pageResult = new PageResult
            {
                PageSize = pageSize,
                PageNumber = pageNumber,
            };
            var (payments, total) = await _paymentService.GetPayments(pageResult, day, month, year);

            var response = new PagingResponse<Payment>
            {
                Data = payments,
                Total = total
            };
            return Ok(response);
        }


        [HttpGet("bookingid/{bookingId}")]
        [Authorize]

        public async Task<ActionResult<Payment>> GetPaymentByBookingId(string bookingId)
        {
            var payment = _paymentService.GetPaymentByBookingId(bookingId);

            if (payment == null)
            {
                return NotFound();
            }

            return payment;
        }

        // GET: api/Payments/5
        [HttpGet("{id}")]
        [Authorize]

        public async Task<ActionResult<Payment>> GetPayment(string id)
        {
            var payment = _paymentService.GetPayment(id);

            if (payment == null)
            {
                return NotFound();
            }

            return payment;
        }

        // PUT: api/Payments/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        //[HttpPut("{id}")]
        //public async Task<IActionResult> PutPayment(string id, Payment payment)
        //{
        //    if (id != payment.PaymentId)
        //    {
        //        return BadRequest();
        //    }

        //    paymentService.Entry(payment).State = EntityState.Modified;

        //    try
        //    {
        //        await paymentService.SaveChangesAsync();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!PaymentExists(id))
        //        {
        //            return NotFound();
        //        }
        //        else
        //        {
        //            throw;
        //        }
        //    }

        //    return NoContent();
        //}

        // POST: api/Payments
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize]

        public async Task<ActionResult<Payment>> PostPayment(Payment payment)
        {
            _paymentService.AddPayment(payment);

            return CreatedAtAction("GetPayment", new { id = payment.PaymentId }, payment);
        }

        // DELETE: api/Payments/5
        [HttpDelete("{id}")]
        [Authorize]

        public async Task<IActionResult> DeletePayment(string id)
        {
            var payment = _paymentService.GetPayment(id);
            if (payment == null)
            {
                return NotFound();
            }

            _paymentService.DeletePayment(id);

            return NoContent();
        }

        //private bool PaymentExists(string id)
        //{
        //    return paymentService.GetPayments().Any(e => e.PaymentId == id);
        //}

        [HttpGet("SearchByDate")]
        [Authorize]

        public async Task<ActionResult<IEnumerable<Payment>>> SearchByDate(DateTime start, DateTime end)
        {
            return _paymentService.SearchByDate(start, end);
        }


        [HttpGet("GeneratePaymentToken/{bookingId}")]
        public IActionResult GeneratePaymentToken(string bookingId)
        {
            var token = _tokenForPayment.GenerateToken(bookingId);
            return Ok(new { token });
        }

        [HttpPost("ProcessPayment")]
        public async Task<ActionResult> ProcessPayment(string role ,string token)
        {
            //if (bookingId == null)
            //{
            //    return BadRequest(new ResponseModel
            //    {
            //        Status = "Error",
            //        Message = "Booking information is required."
            //    });
            //}
            var bookingId = _tokenForPayment.ValidateToken(token);
            var response = await _paymentService.ProcessBookingPayment(role,bookingId);
            return Ok(response);
        }

        [HttpPost("ProcessPaymentByBalance")]
        public async Task<ActionResult> ProcessPaymentByBalance(string token)
        {
            try
            {

                var bookingId = _tokenForPayment.ValidateToken(token);
                var response = await _paymentService.ProcessBookingPaymentByBalance(bookingId);
                if (response.Status == "Error")
                {
                    return response.Message switch
                    {
                        "Booking information is required." => BadRequest(response.Message),
                        "Error While Processing Balance(Not enough balance)" => BadRequest(response.Message),
                        _ => BadRequest(response.Message),
                    };
                }
                return Ok(response.Message);
            }
            catch (Exception e)
            {
                return BadRequest(new ResponseModel
                {
                    Status = "Error",
                    Message = e.Message
                });
            }
        }




        [HttpGet("SortPayment/{sortBy}")]
        [Authorize]

        public async Task<ActionResult<IEnumerable<Payment>> > SortPayment(string sortBy, bool isAsc, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var pageResult = new PageResult
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            return await _paymentService.SortPayment(sortBy, isAsc, pageResult);
        }

        [HttpGet("GetDailyRevenue")]
        [Authorize]

        public async Task<ActionResult<decimal>> GetDailyRevenue()
        {
            try
            {
                var date = DateTime.UtcNow;
                TimeZoneInfo asianZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
                date = TimeZoneInfo.ConvertTimeFromUtc(date, asianZone);
               Console.WriteLine(date);
                return Ok(await _paymentService.GetDailyRevenue(date));
            }
            catch (Exception e)
            {
                return BadRequest(new ResponseModel
                {
                    Status = "Error",
                    Message = e.Message
                });
            }
        }

        [HttpGet("GetRevenueByDate")]
        [Authorize]

        public async Task<ActionResult<decimal>> GetRevenueByDate(DateTime start, DateTime end)
        {   
            if (start > end)
            {
                return BadRequest(new ResponseModel
                {
                    Status = "Error",
                    Message = "Start date must be before end date"
                });
            }
            try
            {
                return Ok(await _paymentService.GetRevenueByDay(start, end));
            }
            catch (Exception e)
            {
                return BadRequest(new ResponseModel
                {
                    Status = "Error",
                    Message = e.Message
                });
            }
        }

    }
}
