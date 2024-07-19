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
    public class PaymentDAOTests
    {
        private readonly Mock<DbSet<Payment>> mockSet;
        private readonly Mock<CourtCallerDbContext> mockContext;
        private readonly List<Payment> paymentList;

        public PaymentDAOTests()
        {
            // Initialize mock set and context
            mockSet = new Mock<DbSet<Payment>>();
            mockContext = new Mock<CourtCallerDbContext>();
            paymentList = new List<Payment>
            {
                new Payment { PaymentId = "P00001", BookingId = "B0001", PaymentAmount = 100, PaymentDate = DateTime.Now.AddDays(3) },
                new Payment { PaymentId = "P00002", BookingId = "B0002", PaymentAmount = 200, PaymentDate = DateTime.Now.AddDays(5) },
                new Payment { PaymentId = "P00003", BookingId = "B0003", PaymentAmount = 300, PaymentDate = DateTime.Now.AddDays(10) },
                new Payment { PaymentId = "P00004", BookingId = "B0004", PaymentAmount = 400, PaymentDate = DateTime.Now },
                new Payment { PaymentId = "P00005", BookingId = "B0005", PaymentAmount = 500, PaymentDate = DateTime.Now }
            };

            var data = paymentList.AsQueryable();

            mockSet.As<IQueryable<Payment>>().Setup(m => m.Provider).Returns(data.Provider);
            mockSet.As<IQueryable<Payment>>().Setup(m => m.Expression).Returns(data.Expression);
            mockSet.As<IQueryable<Payment>>().Setup(m => m.ElementType).Returns(data.ElementType);
            mockSet.As<IQueryable<Payment>>().Setup(m => m.GetEnumerator()).Returns(data.GetEnumerator());

            mockContext.Setup(c => c.Payments).Returns(mockSet.Object);
        }

        [Fact]
        public void GetPayments_ReturnsPayments()
        {
            var dao = new PaymentDAO(mockContext.Object);
            var payments = dao.GetPayments();
            Assert.Equal(5, payments.Count);
        }

        [Theory]
        [InlineData("P00001")]
        [InlineData("P00002")]
        [InlineData("P00003")]
        public void GetPayment_ReturnsPayment(string paymentId)
        {
            var dao = new PaymentDAO(mockContext.Object);
            var payment = dao.GetPayment(paymentId);
            Assert.NotNull(payment);
            Assert.Equal(paymentId, payment.PaymentId);
        }

        [Theory]
        [InlineData("B0001")]
        [InlineData("B0002")]
        public void GetPaymentByBookingId_ReturnsPayment(string bookingId)
        {
            var dao = new PaymentDAO(mockContext.Object);
            var payment = dao.GetPaymentByBookingId(bookingId);
            Assert.NotNull(payment);
            Assert.Equal(bookingId, payment.BookingId);
        }

        [Fact]
        public void SearchByDate_ReturnsSearchByDate() {
            var dao = new PaymentDAO(mockContext.Object);
            var payments = dao.SearchByDate(DateTime.Now.AddDays(2), DateTime.Now.AddDays(6));
            Assert.Equal(2, payments.Count);
        }
    }
}
