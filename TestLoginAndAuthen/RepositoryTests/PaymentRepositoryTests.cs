using BusinessObjects;
using DAOs;
using Microsoft.EntityFrameworkCore;
using Moq;
using Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UnitTests.RepositoryTests
{
    public class PaymentRepositoryTests
    {
        private readonly Mock<DbSet<Payment>> mockSet;
        private readonly Mock<CourtCallerDbContext> mockContext;
        private readonly List<Payment> paymentList;
        private readonly PaymentDAO paymentDAO;
        private readonly PaymentRepository paymentRepository;

        public PaymentRepositoryTests()
        {
            // Initialize mock set and context
            mockSet = new Mock<DbSet<Payment>>();
            mockContext = new Mock<CourtCallerDbContext>();
            paymentList = new List<Payment>
            {
                new Payment { PaymentId = "P00001", BookingId = "B00001", PaymentDate = DateTime.Now, PaymentAmount = 1000, PaymentStatus = "Completed"},
                new Payment { PaymentId = "P00002", BookingId = "B00001", PaymentDate = DateTime.Now, PaymentAmount = 21000, PaymentStatus = "Cancel"},
                new Payment { PaymentId = "P00003", BookingId = "B00001", PaymentDate = DateTime.Now, PaymentAmount = 4000, PaymentStatus = "Cancel"},
            };
            var data = paymentList.AsQueryable();

            mockSet.As<IQueryable<Payment>>().Setup(m => m.Provider).Returns(data.Provider);
            mockSet.As<IQueryable<Payment>>().Setup(m => m.Expression).Returns(data.Expression);
            mockSet.As<IQueryable<Payment>>().Setup(m => m.ElementType).Returns(data.ElementType);
            mockSet.As<IQueryable<Payment>>().Setup(m => m.GetEnumerator()).Returns(data.GetEnumerator());

            mockContext.Setup(c => c.Payments).Returns(mockSet.Object);

            paymentDAO = new PaymentDAO(mockContext.Object);
            paymentRepository = new PaymentRepository(paymentDAO);
        }

        [Fact]
        public void AddPayment_ReturnsWell()
        {
            Payment payment = new Payment { BookingId = "B00001", PaymentDate = DateTime.Now, PaymentAmount = 1000, PaymentStatus = "Cancel" };

            Payment result = paymentRepository.AddPayment(payment);

            Assert.NotNull(result);
        }

        [Fact]
        public void DeletePayment_ReturnsWell()
        {
            paymentRepository.DeletePayment("P00001");

            Payment payment = paymentRepository.GetPayment("P00001");
            Assert.Equal("Cancel", payment.PaymentStatus);
            
        }

        [Fact]
        public void GetPaymentByBookingId_ReturnsWell()
        {
            Payment result = paymentRepository.GetPaymentByBookingId("B00001");

            Assert.NotNull(result);
        }
        [Fact]
        public void GetPayment_ReturnsWell()
        {
            Payment result = paymentRepository.GetPayment("P00001");

            Assert.NotNull(result);
        }

        [Fact]
        public void GetPayments_ReturnsWell()
        {
            List<Payment> result = paymentRepository.GetPayments();

            Assert.NotNull(result);
        }

        [Fact]
        public void SearchByDate_ReturnsWell()
        {
            DateTime start = DateTime.Now.AddDays(-1);
            DateTime end = DateTime.Now.AddDays(1);

            List<Payment> result = paymentRepository.SearchByDate(start, end);

            Assert.NotNull(result);
        }
    }
}
