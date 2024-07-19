using DAOs;
using BusinessObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAOs.Helper;
using Microsoft.EntityFrameworkCore;

namespace DAOs
{
    public class PaymentDAO
    {
        private readonly CourtCallerDbContext _courtCallerDbContext = null;

        public PaymentDAO()
        {
            if (_courtCallerDbContext == null)
            {
                _courtCallerDbContext = new CourtCallerDbContext();
            }
        }

        public PaymentDAO(CourtCallerDbContext courtCallerDbContext)
        {
            _courtCallerDbContext = courtCallerDbContext;
        }

        public async Task<(List<Payment>, int total)> GetPayments(Helper.PageResult pageResult)
        {
            var query = _courtCallerDbContext.Payments.AsQueryable();
            var total = await _courtCallerDbContext.Payments.CountAsync();


            //if (!string.IsNullOrEmpty(searchQuery))
            //{
            //    query = query.Where(court => court.CourtId.Contains(searchQuery) ||
            //                                  court.BranchId.Contains(searchQuery) ||
            //                                  court.CourtName.Contains(searchQuery) ||
            //                                  court.Status.Contains(searchQuery));

            //}

            Pagination pagination = new Pagination(_courtCallerDbContext);
            List<Payment> payments = await pagination.GetListAsync<Payment>(query, pageResult);
            return (payments, total);

        }

        public List<Payment> GetPayments()
        {
            return _courtCallerDbContext.Payments.ToList();
        }
        
        public Payment GetPaymentByBookingId(string bookingId) {
            return _courtCallerDbContext.Payments.FirstOrDefault(m => m.BookingId.Equals(bookingId));
        }

        public Payment GetPayment(string id)
        {
            return _courtCallerDbContext.Payments.FirstOrDefault(m => m.PaymentId.Equals(id));
        }

        public Payment AddPayment(Payment Payment)
        {
            _courtCallerDbContext.Payments.Add(Payment);
            _courtCallerDbContext.SaveChanges();
            return Payment;
        }

        //public Payment UpdatePayment(string id, Payment Payment)
        //{
        //    Payment oPayment = GetPayment(id);
        //    if (oPayment != null)
        //    {
        //        oPayment.PaymentName = Payment.PaymentName;
        //        oPayment.IsNatural = Payment.IsNatural;
        //        DbContext.Update(oPayment);
        //        DbContext.SaveChanges();
        //    }
        //    return oPayment;
        //}

        public void DeletePayment(string id)
        {
            Payment oPayment = GetPayment(id);
            if (oPayment != null)
            {
                oPayment.PaymentStatus = "Cancel";
                _courtCallerDbContext.Update(oPayment);
                _courtCallerDbContext.SaveChanges();
            }
        }

        public List<Payment> SearchByDate(DateTime start, DateTime end) => _courtCallerDbContext.Payments.Where(m => m.PaymentDate >= start && m.PaymentDate <= end).ToList();

        public async Task<List<Payment>> SortPayment(string? sortBy, bool isAsc, PageResult pageResult)
        {
            IQueryable<Payment> query = _courtCallerDbContext.Payments;

            switch (sortBy?.ToLower())
            {
                case "paymentid":
                    query = isAsc ? query.OrderBy(b => b.PaymentId) : query.OrderByDescending(b => b.PaymentId);
                    break;
                case "bookingid":
                    query = isAsc ? query.OrderBy(b => b.BookingId) : query.OrderByDescending(b => b.BookingId);
                    break;
                case "paymentamount":
                    query = isAsc ? query.OrderBy(b => b.PaymentAmount) : query.OrderByDescending(b => b.PaymentAmount);
                    break;
                case "paymentdate":
                    query = isAsc ? query.OrderBy(b => b.PaymentDate) : query.OrderByDescending(b => b.PaymentDate);
                    break;
                case "paymentmessage":
                    query = isAsc ? query.OrderBy(b => b.PaymentMessage) : query.OrderByDescending(b => b.PaymentMessage);
                    break;
                case "paymentsignature":
                    query = isAsc ? query.OrderBy(b => b.PaymentSignature) : query.OrderByDescending(b => b.PaymentSignature);
                    break;
                case "paymentstatus":
                    query = isAsc ? query.OrderBy(b => b.PaymentStatus) : query.OrderByDescending(b => b.PaymentStatus);
                    break;
                default:
                    break;
            }
            Pagination pagination = new Pagination(_courtCallerDbContext);
            List<Payment> payments = await pagination.GetListAsync<Payment>(query, pageResult);
            return payments;
        }

        //viết hàm để tính revenue theo ngày
        public async Task<decimal> GetDailyRevenue (DateTime date)
        {
            var startDate = date.Date; 
            var endDate = startDate.AddDays(1);

            var payments = await _courtCallerDbContext.Payments
                                .Where(m => m.PaymentDate >= startDate && m.PaymentDate < endDate
                                            && m.PaymentMessage == "Complete")
                                .SumAsync(p => p.PaymentAmount);
            return payments;
        }

        public async Task<decimal> GetRevenueByDay (DateTime start, DateTime end)
        {
            var dayStartParse = start.Date;
            var dayEndParse = end.Date;
            var payments = await _courtCallerDbContext.Payments
                                .Where(m => m.PaymentDate >= dayStartParse && m.PaymentDate < dayEndParse
                                            && m.PaymentMessage == "Complete")
                                .SumAsync(p => p.PaymentAmount);
            return payments;
        }

    }
}
