using BusinessObjects;
using DAOs.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAOs.Helper;
using Microsoft.AspNetCore.Http.HttpResults;
using MimeKit.Cryptography;

namespace Services
{
    public class PaymentService
    {
        private readonly PaymentRepository _paymentRepository = null;
        private readonly BookingRepository _bookingRepository = null;
        private readonly UserDetailService _userDetailService = null;
        private readonly VnpayService _vnpayService = null;
        private readonly ILogger<VnpayService> _logger;
        public PaymentService()
        {
            if (_paymentRepository == null)
            {
                _paymentRepository = new PaymentRepository();
            }
            if (_bookingRepository == null)
            {
                _bookingRepository = new BookingRepository();
            }
            if (_vnpayService == null)
            {
                _vnpayService = new VnpayService(_logger, _bookingRepository, _paymentRepository);
            }
            if (_userDetailService == null)
            {
                _userDetailService = new UserDetailService();
            }

        }

        public async Task<(List<Payment>, int total)> GetPayments(PageResult pageResult) => await _paymentRepository.GetPayments(pageResult);
        public Payment AddPayment(Payment Payment) => _paymentRepository.AddPayment(Payment);
        public void DeletePayment(string id) => _paymentRepository.DeletePayment(id);

        public Payment GetPaymentByBookingId(string bookingId) => _paymentRepository.GetPaymentByBookingId(bookingId);

        public Payment GetPayment(string id) => _paymentRepository.GetPayment(id);
        public List<Payment> GetPayments() => _paymentRepository.GetPayments();
        //public Payment UpdatePayment(string id, Payment Payment) => PaymentRepository.UpdatePayment(id, Payment);

        public List<Payment> SearchByDate(DateTime start, DateTime end) => _paymentRepository.SearchByDate(start, end);

        public async Task<string> ProcessBookingPayment(string bookingId)
        {
            var bookings = await _bookingRepository.GetBooking(bookingId);
            if (bookings == null)
            {
                return null;
            }

            var paymentURL = _vnpayService.CreatePaymentUrl(bookings.TotalPrice,"ok",bookings.BookingId);


            return paymentURL;
        }
        public async Task<ResponseModel> ProcessBookingPaymentByBalance(string bookingId)
        {
            try
            {
                var bookings = await _bookingRepository.GetBooking(bookingId);
                var user = _userDetailService.GetUserDetail(bookings.Id);

                if (bookings == null || user == null)
                {
                    return new ResponseModel
                    {
                        Status = "Error",
                        Message = "Booking information is required."
                    };
                }

                if (user.Balance < bookings.TotalPrice || user.Balance - bookings.TotalPrice < 0)
                {
                    return new ResponseModel
                    {
                        Status = "Error",
                        Message = "Error While Processing Balance(Not enough balance)"
                    };
                }
                user.Balance -= bookings.TotalPrice;
                bookings.Status = "Complete";
                await _userDetailService.UpdateUserDetailAsync(user.UserId);
                await _bookingRepository.UpdateBooking(bookings);
                var payment = new Payment
                {
                    PaymentId = "P" + GenerateId.GenerateShortBookingId(),
                    BookingId = bookingId,
                    PaymentAmount = bookings.TotalPrice,
                    PaymentDate = DateTime.Now,
                    PaymentMessage = "Complete",
                    PaymentStatus = "True",

                };
                _paymentRepository.AddPayment(payment);
                return new ResponseModel
                {
                    Status = "Success",
                    Message = "Payment Success"
                };
            }
            catch (Exception e)
            {
                return new ResponseModel
                {
                    Status = "Error",
                    Message = e.Message
                };
            }
        }
        public async Task<List<Payment>> SortPayment(string? sortBy, bool isAsc, PageResult pageResult) => await _paymentRepository.SortPayment(sortBy, isAsc, pageResult);

        public async Task<decimal> GetDailyRevenue(DateTime date) => await _paymentRepository.GetDailyRevenue(date);

        public async Task<decimal> GetRevenueByDay(DateTime start, DateTime end) => await _paymentRepository.GetRevenueByDay(start, end);
    }
}
