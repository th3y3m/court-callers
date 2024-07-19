using BusinessObjects;
using DAOs;
using DAOs.Helper;
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
    public class BranchDAOTests
    {
        private readonly Mock<DbSet<Branch>> mockSet;
        private readonly Mock<CourtCallerDbContext> mockContext;
        private readonly List<Branch> branchList;

        public BranchDAOTests()
        {
            // Initialize mock set and context
            mockSet = new Mock<DbSet<Branch>>();
            mockContext = new Mock<CourtCallerDbContext>();
            branchList = new List<Branch>
            {
                new Branch
                {
                    BranchId = "B00001",
                    BranchName = "Test Branch 1",
                    BranchAddress = "Test Address 1",
                    Status = "Active",
                    Courts = new List<Court>
                    {
                        new Court { CourtId = "C001", CourtName = "Court 1", BranchId = "B00001" },
                        new Court { CourtId = "C002", CourtName = "Court 2", BranchId = "B00001" }
                    },
                    Prices = new List<Price>
                    {
                        new Price { PriceId = "P001", SlotPrice = 100, BranchId = "B00001", IsWeekend = false },
                        new Price { PriceId = "P002", SlotPrice = 150, BranchId = "B00001", IsWeekend = true }
                    }
                },
                new Branch
                {
                    BranchId = "B00002",
                    BranchName = "Test Branch 2",
                    BranchAddress = "Test Address 2",
                    Status = "Active",
                    Courts = new List<Court>
                    {
                        new Court { CourtId = "C003", CourtName = "Court 3", BranchId = "B00002" },
                        new Court { CourtId = "C004", CourtName = "Court 4", BranchId = "B00002" }
                    },
                    Prices = new List<Price>
                    {
                        new Price { PriceId = "P003", SlotPrice = 120, BranchId = "B00002", IsWeekend = false },
                        new Price { PriceId = "P004", SlotPrice = 180, BranchId = "B00002", IsWeekend = true }
                    }
                },
                new Branch
                {
                    BranchId = "B00003",
                    BranchName = "Test Branch 3",
                    BranchAddress = "Test Address 3",
                    Status = "Inactive",
                    Courts = new List<Court>
                    {
                        new Court { CourtId = "C005", CourtName = "Court 5", BranchId = "B00003" },
                        new Court { CourtId = "C006", CourtName = "Court 6", BranchId = "B00003" }
                    },
                    Prices = new List<Price>
                    {
                        new Price { PriceId = "P005", SlotPrice = 130, BranchId = "B00003", IsWeekend = false },
                        new Price { PriceId = "P006", SlotPrice = 190, BranchId = "B00003", IsWeekend = true }
                    }
                }
            };

            var data = branchList.AsQueryable();

            mockSet.As<IQueryable<Branch>>().Setup(m => m.Provider).Returns(data.Provider);
            mockSet.As<IQueryable<Branch>>().Setup(m => m.Expression).Returns(data.Expression);
            mockSet.As<IQueryable<Branch>>().Setup(m => m.ElementType).Returns(data.ElementType);
            mockSet.As<IQueryable<Branch>>().Setup(m => m.GetEnumerator()).Returns(data.GetEnumerator());

            mockContext.Setup(c => c.Branches).Returns(mockSet.Object);
        }

        [Fact]
        public void GetBranches_ReturnsAllBranches()
        {
            var dao = new BranchDAO(mockContext.Object);

            var result = dao.GetBranches();

            Assert.Equal(3, result.Count);
            Assert.Equal(branchList, result);
        }

        [Theory]
        [InlineData("B00001")]
        [InlineData("B00002")]
        public void GetBranch_ReturnsBranch(string branchId)
        {
            var dao = new BranchDAO(mockContext.Object);

            var result = dao.GetBranch(branchId);

            Assert.NotNull(result);
            Assert.Equal(branchId, result.BranchId);
        }

        [Fact]
        public void GetBranch_ReturnsNull()
        {
            var dao = new BranchDAO(mockContext.Object);

            var result = dao.GetBranch("B00000");

            Assert.Null(result);
        }

        [Fact]
        public void AddBranch_ReturnsBranch()
        {
            var dao = new BranchDAO(mockContext.Object);
            var branchModel = new BranchModel
            {
                BranchName = "Test Branch 4",
                BranchAddress = "Test Address 4",
            };

            var result = dao.AddBranch(branchModel);

            Assert.NotNull(result);
            Assert.Equal("B00004", result.BranchId);
            Assert.Equal(branchModel.BranchName, result.BranchName);
        }

        //use DDT to test addbranch
        [Theory]
        [InlineData("Test Branch 4", "Test Address 4")]
        [InlineData("Test Branch 5", "Test Address 5")]
        public void AddBranchDDT_ReturnsBranch(string branchName, string branchAddress)
        {
            var dao = new BranchDAO(mockContext.Object);
            var branchModel = new BranchModel
            {
                BranchName = branchName,
                BranchAddress = branchAddress,
            };

            var result = dao.AddBranch(branchModel);

            Assert.NotNull(result);
            Assert.Equal("B00004", result.BranchId);
            Assert.Equal(branchModel.BranchName, result.BranchName);
            Assert.Equal(branchModel.BranchAddress, result.BranchAddress);
        }


        [Fact]
        public void UpdateBranch_ReturnsBranch()
        {
            var dao = new BranchDAO(mockContext.Object);
            var branchModel = new PutBranch
            {
                BranchName = "Test Branch 4",
            };

            var result = dao.UpdateBranch("B00001", branchModel);

            Assert.NotNull(result);
            Assert.Equal("B00001", result.BranchId);
            Assert.Equal(branchModel.BranchName, result.BranchName);
            Assert.Equal(branchModel.BranchAddress, result.BranchAddress);
        }

        [Fact]
        public void DeleteBranch_ReturnsBranch()
        {
            var dao = new BranchDAO(mockContext.Object);

            dao.DeleteBranch("B00001");

            var result = dao.GetBranch("B00001");
            Assert.Equal("Inactive", result.Status);
        }

        [Fact]
        public void DeleteBranch_ReturnsNull()
        {
            var dao = new BranchDAO(mockContext.Object);

            dao.DeleteBranch("B00000");

            var result = dao.GetBranch("B00000");
            Assert.Null(result);
        }

        [Fact]
        public void DeleteBranch_ReturnsBranchNotFound()
        {
            var dao = new BranchDAO(mockContext.Object);

            dao.DeleteBranch("B00004");

            var result = dao.GetBranch("B00004");
            Assert.Null(result);
        }

        [Theory]
        [InlineData("Active", 2)]
        [InlineData("Inactive", 1)]
        public void GetBranchesByStatusActive_ReturnsAllBranches(string status, int expectedNum)
        {
            var dao = new BranchDAO(mockContext.Object);

            var result = dao.GetBranchesByStatus(status);

            Assert.Equal(expectedNum, result.Count);
        }
        [Theory]
        [InlineData(100, 150, 1)]
        [InlineData(120, 180, 1)]
        public void GetBranchByPrice_ReturnsAllBranches(decimal minPrice, decimal maxPrice, int expectedNum)
        {
            var dao = new BranchDAO(mockContext.Object);

            var result = dao.GetBranchByPrice(minPrice, maxPrice);

            Assert.Equal(expectedNum, result.Count);
        }



        [Theory]
        [InlineData("C001", 1)]
        [InlineData("C003", 1)]
        public void GetBranchesByCourtId_ReturnsAllBranches(string courtId, int expectedNum)
        {
            var dao = new BranchDAO(mockContext.Object);

            var result = dao.GetBranchesByCourtId(courtId);

            Assert.Equal(expectedNum, result.Count);
        }
    }
}
