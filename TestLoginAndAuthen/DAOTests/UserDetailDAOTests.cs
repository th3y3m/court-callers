using BusinessObjects;
using DAOs;
using DAOs.Models;
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
    public class UserDetailDAOTests
    {
        private readonly Mock<DbSet<UserDetail>> mockSet;
        private readonly Mock<CourtCallerDbContext> mockContext;
        private readonly List<UserDetail> userList;

        public UserDetailDAOTests()
        {
            // Initialize mock set and context
            mockSet = new Mock<DbSet<UserDetail>>();
            mockContext = new Mock<CourtCallerDbContext>();
            userList = new List<UserDetail>
            {
                new UserDetail { UserId = "U00001", Address = "Q1", Balance = 10, FullName = "A", Point = 10  },
                new UserDetail { UserId = "U00002", Address = "Q2", Balance = 20, FullName = "B", Point = 20  },
                new UserDetail { UserId = "U00003", Address = "Q3", Balance = 30, FullName = "C", Point = 30  },
                new UserDetail { UserId = "U00004", Address = "Q4", Balance = 40, FullName = "D", Point = 40  },
            };

            var data = userList.AsQueryable();

            mockSet.As<IQueryable<UserDetail>>().Setup(m => m.Provider).Returns(data.Provider);
            mockSet.As<IQueryable<UserDetail>>().Setup(m => m.Expression).Returns(data.Expression);
            mockSet.As<IQueryable<UserDetail>>().Setup(m => m.ElementType).Returns(data.ElementType);
            mockSet.As<IQueryable<UserDetail>>().Setup(m => m.GetEnumerator()).Returns(data.GetEnumerator());

            mockContext.Setup(c => c.UserDetails).Returns(mockSet.Object);
        }

        [Theory]
        [InlineData("U00001")]
        [InlineData("U00002")]
        public void GetUserDetail_ReturnsUserDetail(string userId)
        {
            var dao = new UserDetailDAO(mockContext.Object);
            var user = dao.GetUserDetail(userId);
            Assert.Equal(user.UserId, userId);
        }

        [Theory]
        [InlineData("U00009")]
        [InlineData("U00010")]
        public void GetUserDetail_ReturnsNull(string userId)
        {
            var dao = new UserDetailDAO(mockContext.Object);
            var user = dao.GetUserDetail(userId);
            Assert.Null(user);
        }

        [Fact]
        public void AddUserDetail_ReturnsUserDetail()
        {
            var dao = new UserDetailDAO(mockContext.Object);
            var user = new UserDetail { UserId = "U00005", Address = "Q5", Balance = 50, FullName = "E", Point = 50 };
            var result = dao.AddUserDetail(user);
            Assert.NotNull(result);
        }

        [Fact]
        public void GetUserDetails_ReturnsUserDetails()
        {
            var dao = new UserDetailDAO(mockContext.Object);
            var user = dao.GetUserDetails();
            Assert.Equal(userList.Count, user.Count);
        }

        //[Fact]
        //public void UpdateUserDetail_ReturnsUserDetail()
        //{
        //    var dao = new UserDetailDAO(mockContext.Object);
        //    var user = new UserDetailsModel { Point = 100, FullName = "F", Address = "Q6" };
        //    var result = dao.UpdateUserDetail("U00001", user);
        //    Assert.Equal(result.FullName, user.FullName);
        //    Assert.Equal(result.Point, user.Point);
        //    Assert.Equal(result.Address, user.Address);
        //}
    }
}
