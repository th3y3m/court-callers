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
    public class CourtRepositoryTests
    {
        private readonly Mock<DbSet<Court>> mockSet;
        private readonly Mock<CourtCallerDbContext> mockContext;
        private readonly List<Court> courtList;
        private readonly CourtDAO courtDAO;
        private readonly CourtRepository courtRepository;

        public CourtRepositoryTests()
        {
            // Initialize mock set and context
            mockSet = new Mock<DbSet<Court>>();
            mockContext = new Mock<CourtCallerDbContext>();
            courtList = new List<Court>
            {
                new Court { CourtId = "C00001", CourtName = "Test Court 1", Status = "Active", BranchId = "B00001" },
                new Court { CourtId = "C00002", CourtName = "Test Court 2", Status = "Inactive", BranchId = "B00001" },
                new Court { CourtId = "C00003", CourtName = "Test Court 3", Status = "Active", BranchId = "B00001" },
                new Court { CourtId = "C00004", CourtName = "Test Court 4", Status = "Active", BranchId = "B00001" }
            };
            var data = courtList.AsQueryable();

            mockSet.As<IQueryable<Court>>().Setup(m => m.Provider).Returns(data.Provider);
            mockSet.As<IQueryable<Court>>().Setup(m => m.Expression).Returns(data.Expression);
            mockSet.As<IQueryable<Court>>().Setup(m => m.ElementType).Returns(data.ElementType);
            mockSet.As<IQueryable<Court>>().Setup(m => m.GetEnumerator()).Returns(data.GetEnumerator());

            mockContext.Setup(c => c.Courts).Returns(mockSet.Object);

            courtDAO = new CourtDAO(mockContext.Object);
            courtRepository = new CourtRepository(courtDAO);
        }

        [Fact]
        public void AddCourt_ReturnsWell()
        {
            CourtModel courtModel = new CourtModel { CourtName = "Test Court 1", BranchId = "B00001" };

            Court court = courtRepository.AddCourt(courtModel);

            Assert.NotNull(court);
        }

        [Theory]
        [InlineData("C00001")]
        [InlineData("C00002")]

        public void GetCourt_ReturnsWell(string courtId)
        {

            Court court = courtRepository.GetCourt(courtId);

            Assert.NotNull(court);
        }

        [Fact]
        public void UpdateCourt_ReturnsWell()
        {
            Court court = new Court { CourtId = "C00001", CourtName = "Test Court 1" };
            CourtModel courtModel = new CourtModel { CourtName = "Test Court 1 Updated" };
            mockSet.Setup(m => m.Find(court.CourtId)).Returns(court);

            Court actual = courtRepository.UpdateCourt(court.CourtId, courtModel);

            Assert.Equal(courtModel.CourtName, actual.CourtName);
        }

        [Theory]
        [InlineData("Active", 3)]
        [InlineData("Inactive", 1)]
        [InlineData("Maintain", 0)]
        public void GetCourtsByStatus_ReturnsWell(string status, int count)
        {

            List<Court> actual = courtRepository.GetCourtsByStatus(status);

            Assert.Equal(count, actual.Count);
        }


    }
}
