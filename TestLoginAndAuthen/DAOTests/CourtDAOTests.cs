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
    public class CourtDAOTests
    {
        private readonly Mock<DbSet<Court>> mockSet;
        private readonly Mock<CourtCallerDbContext> mockContext;
        private readonly List<Court> courtList;

        public CourtDAOTests()
        {
            // Initialize mock set and context
            mockSet = new Mock<DbSet<Court>>();
            mockContext = new Mock<CourtCallerDbContext>();
            courtList = new List<Court>
            {
                new Court { CourtId = "C00001", CourtName = "Court 1", BranchId = "B0001", Status = "Active" },
                new Court { CourtId = "C00002", CourtName = "Court 2", BranchId = "B0001", Status = "Inactive" },
                new Court { CourtId = "C00003", CourtName = "Court 3", BranchId = "B0002", Status = "Active" },
                new Court { CourtId = "C00004", CourtName = "Court 4", BranchId = "B0002", Status = "Active" },
                new Court { CourtId = "C00005", CourtName = "Court 5", BranchId = "B0003", Status = "Inactive" }
            };

            var data = courtList.AsQueryable();

            mockSet.As<IQueryable<Court>>().Setup(m => m.Provider).Returns(data.Provider);
            mockSet.As<IQueryable<Court>>().Setup(m => m.Expression).Returns(data.Expression);
            mockSet.As<IQueryable<Court>>().Setup(m => m.ElementType).Returns(data.ElementType);
            mockSet.As<IQueryable<Court>>().Setup(m => m.GetEnumerator()).Returns(data.GetEnumerator());

            mockContext.Setup(c => c.Courts).Returns(mockSet.Object);
        }

        [Fact]
        public void GetCourts_ReturnsCourts()
        {
            var dao = new CourtDAO(mockContext.Object);
            var courts = dao.GetCourts();
            Assert.Equal(5, courts.Count);
        }

        [Theory]
        [InlineData("C00001")]
        [InlineData("C00002")]
        [InlineData("C00003")]
        public void GetCourt_ReturnsCourt(string courtId)
        {
            var dao = new CourtDAO(mockContext.Object);
            var court = dao.GetCourt(courtId);
            Assert.NotNull(court);
            Assert.Equal(courtId, court.CourtId);
        }

        [Fact]
        public void AddCourt_ReturnsCourt()
        {
            var dao = new CourtDAO(mockContext.Object);
            var courtModel = new CourtModel { CourtName = "Court 6", BranchId = "B0003", Status = "Active" };
            var court = dao.AddCourt(courtModel);
            Assert.NotNull(court);
            Assert.Equal("C00006", court.CourtId);
        }

        [Fact]
        public void UpdateCourt_ReturnsCourt()
        {
            var dao = new CourtDAO(mockContext.Object);
            var court = dao.GetCourt("C00001");
            var updatedCourt = dao.UpdateCourt("C00001", new CourtModel()
            {
                CourtName = "Court 7",
            });
            Assert.NotNull(updatedCourt);
            Assert.Equal("Court 7", updatedCourt.CourtName);
        }

        [Theory]
        [InlineData("C00001")]
        [InlineData("C00002")]
        public void DeleteCourt_ReturnsVoid(string courtId)
        {
            var dao = new CourtDAO(mockContext.Object);
            dao.DeleteCourt(courtId);
            var court = dao.GetCourt(courtId);
            Assert.NotNull(court);
            Assert.Equal("Inactive", court.Status);
        }

        [Theory]
        [InlineData("Active", 3)]
        [InlineData("Inactive", 2)]
        public void GetCourtsByStatus_ReturnsCourts(string status, int count)
        {
            var dao = new CourtDAO(mockContext.Object);
            var courts = dao.GetCourtsByStatus(status);
            Assert.Equal(count, courts.Count);
        }
    }
}
