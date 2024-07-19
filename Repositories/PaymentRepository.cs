using BusinessObjects;
using DAOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAOs.Helper;

namespace Repositories
{
    public class PaymentRepository
    {
        private readonly PaymentDAO _paymentDao = null;
        public PaymentRepository()
        {
            if (_paymentDao == null)
            {
                _paymentDao = new PaymentDAO();
            }
        }
        public PaymentRepository(PaymentDAO paymentDAO)
        {
            _paymentDao = paymentDAO;
        }


        public async Task<(List<Payment>, int total)> GetPayments(PageResult pageResult) => await _paymentDao.GetPayments(pageResult);
        public Payment AddPayment(Payment payment) => _paymentDao.AddPayment(payment);

        public void DeletePayment(string id) => _paymentDao.DeletePayment(id);

        public Payment GetPaymentByBookingId(string bookingId) => _paymentDao.GetPaymentByBookingId(bookingId);

        public Payment GetPayment(string id) => _paymentDao.GetPayment(id);

        public List<Payment> GetPayments() => _paymentDao.GetPayments();



        //public Payment UpdatePayment(string id, Payment Payment) => PaymentDAO.UpdatePayment(id, Payment);

        public List<Payment> SearchByDate(DateTime start, DateTime end) => _paymentDao.SearchByDate(start, end);

        public async Task<List<Payment>> SortPayment(string? sortBy, bool isAsc, PageResult pageResult) => await _paymentDao.SortPayment(sortBy, isAsc, pageResult);

        public async Task<decimal> GetDailyRevenue(DateTime date) => await _paymentDao.GetDailyRevenue(date);

        public async Task<decimal> GetRevenueByDay(DateTime start, DateTime end) => await _paymentDao.GetRevenueByDay(start, end);
    }
}
