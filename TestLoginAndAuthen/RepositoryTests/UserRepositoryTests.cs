using DAOs;
using Microsoft.AspNetCore.Identity;
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
    public class UserRepositoryTests
    {
        private readonly Mock<DbSet<IdentityUser>> mockSet;
        private readonly Mock<CourtCallerDbContext> mockContext;
        private readonly List<IdentityUser> userList;
        private readonly UserDAO userDAO;
        private readonly UserRepository userRepository;

        public UserRepositoryTests()
        {
            // Initialize mock set and context
            mockSet = new Mock<DbSet<IdentityUser>>();
            mockContext = new Mock<CourtCallerDbContext>();
            userList = new List<IdentityUser>
            {
                new IdentityUser { Id = "U00001", UserName = "user1", Email = "abc1@gmail.com", PhoneNumber = "12345678", LockoutEnabled = true  },
                new IdentityUser { Id = "U00002", UserName = "user2", Email = "abc2@gmail.com", PhoneNumber = "23321231", LockoutEnabled = false  },
                new IdentityUser { Id = "U00003", UserName = "user3", Email = "abc3@gmail.com", PhoneNumber = "546445678", LockoutEnabled = true  },
                new IdentityUser { Id = "U00004", UserName = "user4", Email = "abc4@gmail.com", PhoneNumber = "8676765", LockoutEnabled = false  },
            };

            var data = userList.AsQueryable();

            mockSet.As<IQueryable<IdentityUser>>().Setup(m => m.Provider).Returns(data.Provider);
            mockSet.As<IQueryable<IdentityUser>>().Setup(m => m.Expression).Returns(data.Expression);
            mockSet.As<IQueryable<IdentityUser>>().Setup(m => m.ElementType).Returns(data.ElementType);
            mockSet.As<IQueryable<IdentityUser>>().Setup(m => m.GetEnumerator()).Returns(data.GetEnumerator());

            mockContext.Setup(c => c.Users).Returns(mockSet.Object);

            userDAO = new UserDAO(mockContext.Object);
            userRepository = new UserRepository(userDAO);
        }

        [Theory]
        [InlineData("U00001")]
        [InlineData("U00002")]
        public void GetUser_ReturnsUser(string userId)
        {
            
            var user = userRepository.GetUser(userId);
            Assert.Equal(user.Id, userId);
        }

        [Theory]
        [InlineData("U00009")]
        [InlineData("U00010")]
        public void GetUser_ReturnsNull(string userId)
        {
            
            var user = userRepository.GetUser(userId);
            Assert.Null(user);
        }

        [Fact]
        public void AddUser_ReturnsUser()
        {
            
            var user = new IdentityUser { Id = "U00005" };
            userRepository.AddUser(user);
            mockSet.Verify(m => m.Add(It.IsAny<IdentityUser>()), Times.Once());
            mockContext.Verify(m => m.SaveChanges(), Times.Once());
        }

        [Fact]
        public void BanUser_ReturnsUser()
        {
            
            userRepository.BanUser("U00001");
            IdentityUser user = userRepository.GetUser("U00001");
            Assert.False(user.LockoutEnabled);
            mockContext.Verify(m => m.SaveChanges(), Times.Once());
        }

        [Fact]
        public void UnBanUser_ReturnsUser()
        {
            
            userRepository.UnBanUser("U00002");
            IdentityUser user = userRepository.GetUser("U00001");
            Assert.True(user.LockoutEnabled);
            mockContext.Verify(m => m.SaveChanges(), Times.Once());
        }

        [Theory]
        [InlineData("abc1", 1)]
        [InlineData("abc9", 0)]
        [InlineData("abc", 4)]

        public void SearchUserByEmail_ReturnsUser(string searchValue, int count)
        {
            
            var user = userRepository.SearchUserByEmail(searchValue);
            Assert.Equal(count, user.Count);
        }
    }
}
