using BusinessObjects;
using DAOs;
using DAOs.Models;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UnitTests.DAOTests
{
    public class PriceDAOTests
    {
        private readonly Mock<DbSet<Price>> mockSet;
        private readonly Mock<CourtCallerDbContext> mockContext;
        private readonly List<Price> priceList;

        public PriceDAOTests()
        {
            // Initialize mock set and context
            mockSet = new Mock<DbSet<Price>>();
            mockContext = new Mock<CourtCallerDbContext>();
            priceList = new List<Price>
            {
                new Price { PriceId = "P00001", BranchId = "B0001", SlotPrice = 100, IsWeekend = null, Type = "Flex" },
                new Price { PriceId = "P00002", BranchId = "B0001", SlotPrice = 200, IsWeekend = false, Type = "By day" },
                new Price { PriceId = "P00003", BranchId = "B0001", SlotPrice = 300, IsWeekend = null, Type = "Fix" },
                new Price { PriceId = "P00004", BranchId = "B0001", SlotPrice = 400, IsWeekend = true, Type = "By day" },
                new Price { PriceId = "P00005", BranchId = "B0005", SlotPrice = 500, IsWeekend = true, Type = "By day" }
            };

            var data = priceList.AsQueryable();

            mockSet.As<IQueryable<Price>>().Setup(m => m.Provider).Returns(data.Provider);
            mockSet.As<IQueryable<Price>>().Setup(m => m.Expression).Returns(data.Expression);
            mockSet.As<IQueryable<Price>>().Setup(m => m.ElementType).Returns(data.ElementType);
            mockSet.As<IQueryable<Price>>().Setup(m => m.GetEnumerator()).Returns(data.GetEnumerator());

            mockContext.Setup(c => c.Prices).Returns(mockSet.Object);
        }

        [Fact]
        public void GetPrices_ReturnsPrices()
        {
            var dao = new PriceDAO(mockContext.Object);
            var prices = dao.GetPrices();
            Assert.Equal(5, prices.Count);
        }

        [Theory]
        [InlineData("P00001")]
        [InlineData("P00002")]
        [InlineData("P00003")]
        public void GetPrice_ReturnsPrice(string priceId)
        {
            var dao = new PriceDAO(mockContext.Object);
            var price = dao.GetPrice(priceId);
            Assert.NotNull(price);
            Assert.Equal(priceId, price.PriceId);
        }

        [Fact]
        public void AddPrice_ReturnsPrice()
        {
            var dao = new PriceDAO(mockContext.Object);
            var priceModel = new PriceModel
            {
                BranchId = "C0001",
                Type = "By day",
                IsWeekend = false,
                SlotPrice = 200
            };
            var price = dao.AddPrice(priceModel);
            Assert.NotNull(price);
        }

        [Theory]
        [InlineData("B0001")]
        [InlineData("B0005")]
        public void ShowPrice_ReturnsPrice(string branchId)
        {
            var dao = new PriceDAO(mockContext.Object);
            var prices = dao.ShowPrice(branchId);
            Assert.NotNull(prices);
            Assert.Equal(2, prices.Count);
        }

        [Fact]
        public void GetSlotPriceOfBookingFlex_B0001_ReturnsPrice()
        {
            var dao = new PriceDAO(mockContext.Object);
            Assert.Equal(100, dao.GetSlotPriceOfBookingFlex("B0001"));
        }
        
        [Fact]
        public void GetSlotPriceOfBookingFix_B0001_ReturnsPrice()
        {
            var dao = new PriceDAO(mockContext.Object);
            Assert.Equal(300, dao.GetSlotPriceOfBookingFix("B0001"));
        }

        [Theory]
        [InlineData("B0001", "Flex", null, 100)]
        [InlineData("B0001", "By day", false, 200)]
        [InlineData("B0001", "Fix", null, 300)]
        [InlineData("B0001", "By day", true, 400)]
        [InlineData("B0005", "By day", true, 500)]
        public void GetPriceByBranchAndType_ReturnsSlotPrice(string branchId, string type, bool? isWeekend, decimal slotPrice)
            {
            var dao = new PriceDAO(mockContext.Object);
            var price = dao.GetPriceByBranchAndType(branchId, type, isWeekend);
            Assert.Equal(slotPrice, price);
        }

        //test UpdatePriceByPriceModel
        [Theory]
        [InlineData("B0001", "By day", true, 500)]
        [InlineData("B0001", "By day", false, 600)]
        [InlineData("B0001", "Fix", null, 700)]
        [InlineData("B0001", "Flex", null, 800)]
        public void UpdatePriceByPriceModel_ReturnsPrice(string branchId, string type, bool? isWeekend, decimal money)
        {
            PriceModel priceModel = new PriceModel
            {
                BranchId = branchId,
                Type = type,
                IsWeekend = isWeekend,
                SlotPrice = money
            };
            var dao = new PriceDAO(mockContext.Object);
            var price = dao.UpdatePriceByPriceModel(priceModel);
            Assert.NotNull(price);
            Assert.Equal(money, price.SlotPrice);
        }
    }
}
