using DAOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UnitTests.DAOTests
{
    public class RoleDAOTests
    {
        private readonly Mock<DbSet<IdentityRole>> mockSet;
        private readonly Mock<CourtCallerDbContext> mockContext;
        private readonly List<IdentityRole> roleList;

        public RoleDAOTests()
        {
            // Initialize mock set and context
            mockSet = new Mock<DbSet<IdentityRole>>();
            mockContext = new Mock<CourtCallerDbContext>();
            roleList = new List<IdentityRole>
            {
                new IdentityRole { Id = "R00001", Name = "Admin", NormalizedName = "ADMIN" },
                new IdentityRole { Id = "R00002", Name = "User", NormalizedName = "USER" },
                new IdentityRole { Id = "R00003", Name = "Manager", NormalizedName = "MANAGER" },
                new IdentityRole { Id = "R00004", Name = "Staff", NormalizedName = "STAFF" },
                new IdentityRole { Id = "R00005", Name = "Customer", NormalizedName = "CUSTOMER" }
            };
            var data = roleList.AsQueryable();

            mockSet.As<IQueryable<IdentityRole>>().Setup(m => m.Provider).Returns(data.Provider);
            mockSet.As<IQueryable<IdentityRole>>().Setup(m => m.Expression).Returns(data.Expression);
            mockSet.As<IQueryable<IdentityRole>>().Setup(m => m.ElementType).Returns(data.ElementType);
            mockSet.As<IQueryable<IdentityRole>>().Setup(m => m.GetEnumerator()).Returns(data.GetEnumerator());

            mockContext.Setup(c => c.Roles).Returns(mockSet.Object);
        }

        [Fact]
        public void GetRoles_ReturnsRoles()
        {
            var dao = new RoleDAO(mockContext.Object);
            var roles = dao.GetRoles();
            Assert.Equal(5, roles.Count);
        }
        [Fact]
        public void GetRole_ReturnsRole()
        {
            var dao = new RoleDAO(mockContext.Object);
            var role = dao.GetRole("R00001");
            Assert.NotNull(role);
        }
        [Fact]
        public void AddRole_ReturnsRole()
        {
            var dao = new RoleDAO(mockContext.Object);
            var role = new IdentityRole
            {
                Name = "Admin",
                NormalizedName = "ADMIN"
            };
            var result = dao.AddRole(role);
            Assert.NotNull(result);
        }
    }
}
