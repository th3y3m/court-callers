using BusinessObjects;
using DAOs;
using DAOs.Models;
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
    public class BranchRepositoryDAO
    {
        private readonly Mock<DbSet<Branch>> mockSet;
        private readonly Mock<CourtCallerDbContext> mockContext;
        private readonly List<Branch> branchList;
        private readonly BranchDAO branchDAO;
        private readonly BookingDAO bookingDAO;
        private readonly TimeSlotDAO timeSlotDAO;
        private readonly CourtDAO courtDAO;
        private readonly BranchRepository branchRepository;

        public BranchRepositoryDAO()
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

            branchDAO = new BranchDAO(mockContext.Object);
            bookingDAO = new BookingDAO(mockContext.Object);
            timeSlotDAO = new TimeSlotDAO(mockContext.Object);
            courtDAO = new CourtDAO(mockContext.Object);
            branchRepository = new BranchRepository(branchDAO, bookingDAO, timeSlotDAO, courtDAO);
        }

        [Theory]
        [InlineData("B00001")]
        public void GetBranch_ReturnsBranch(string branchId)
        {
            var branch = branchRepository.GetBranch(branchId);
            Assert.Equal(branch.BranchId, branchId);
        }

        [Theory]
        [InlineData("B00009")]
        public void GetBranch_ReturnsNull(string branchId)
        {
            var branch = branchRepository.GetBranch(branchId);
            Assert.Null(branch);
        }

        [Fact]
        public void AddBranch_ReturnsBranch()
        {
            branchRepository.AddBranch(new BranchModel()
            {
                BranchAddress = "Q2",
                BranchName = "B",
                BranchPhone = "0001"
            });
            mockSet.Verify(m => m.Add(It.IsAny<Branch>()), Times.Once());
            mockContext.Verify(m => m.SaveChanges(), Times.Once());
        }

        [Fact]
        public void RemoveBranch_ReturnsBranch()
        {
            branchRepository.DeleteBranch("B00001");
            var branch = branchRepository.GetBranch("B00001");
            Assert.Equal("Inactive", branch.Status);

        }
        [Fact]
        public void UpdateBranch_ReturnsBranch()
        {
            branchRepository.UpdateBranch("B00001", new PutBranch()
            {
                BranchAddress = "HCM",
            });
            var branch = branchRepository.GetBranch("B00001");
            Assert.Equal("HCM", branch.BranchAddress);
        }

        [Theory]
        [InlineData("Active", 2)]
        [InlineData("Inactive", 1)]
        [InlineData("Maintaining", 0)]

        public void GetBranchesByStatus_ReturnsBranches(string status, int count)
        {
            var branches = branchRepository.GetBranchesByStatus(status);
            Assert.Equal(count, branches.Count);
        }

        [Theory]
        [InlineData("C001", 1)]
        [InlineData("C003", 1)]
        [InlineData("C005", 1)]
        public void GetBranchesByCourtId_ReturnsBranches(string courtId, int count)
        {
            var branches = branchRepository.GetBranchesByCourtId(courtId);
            Assert.Equal(count, branches.Count);
        }

        [Theory]
        [InlineData(100, 150, 1)]
        [InlineData(120, 180, 1)]
        public void GetBranchByPrice_ReturnsBranches(decimal minPrice, decimal maxPrice, int count)
        {
            var branches = branchRepository.GetBranchByPrice(minPrice, maxPrice);
            Assert.Equal(count, branches.Count);
        }
    }
}
