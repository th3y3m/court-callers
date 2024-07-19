using Xunit;
using Moq;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using API.Controllers;
using DAOs.Models;
using Microsoft.AspNetCore.Mvc;
using Services.Interface;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using System;
using Microsoft.Extensions.Options;
using Services;
using System.Dynamic;
using System.Linq;
using NuGet.Protocol;
using Microsoft.AspNetCore.Http;
using BusinessObjects;
using DAOs;
using Microsoft.EntityFrameworkCore.Storage;
using Xunit;


using Microsoft.EntityFrameworkCore;



namespace UnitTests.ControllerTests
{
    public class AuthServiceTests
    {
        private readonly Mock<UserManager<IdentityUser>> _userManagerMock;
        private readonly Mock<RoleManager<IdentityRole>> _roleManagerMock;
        private readonly Mock<IConfiguration> _configurationMock;
        private readonly Mock<IMailService> _mailServiceMock;
        private readonly Mock<ITokenService> _tokenServiceMock;
        private readonly DbContextOptions<CourtCallerDbContext> _dbContextOptions;
        private readonly CourtCallerDbContext _dbContext;
        private readonly AuthenticationController _authController;


        public AuthServiceTests()
        {
            _userManagerMock = GetMockUserManager<IdentityUser>();
            _roleManagerMock = GetMockRoleManager<IdentityRole>();
            _configurationMock = new Mock<IConfiguration>();
            _mailServiceMock = new Mock<IMailService>();
            _tokenServiceMock = new Mock<ITokenService>();


            _dbContextOptions = new DbContextOptionsBuilder<CourtCallerDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
                .Options;

            _dbContext = new CourtCallerDbContext(_dbContextOptions);

            _authController = new AuthenticationController(
                _userManagerMock.Object,
                _roleManagerMock.Object,
                _configurationMock.Object,
                _mailServiceMock.Object,
                _tokenServiceMock.Object
            );
        }



        //lock-out en

        //[Fact]
        //public async Task Login_ValidUser_ReturnsOkObjectResult()
        //{
        //    var loginModel = new LoginModel { Email = "user@gmail.com", Password = "Qwe@123" };
        //    var user = new IdentityUser { UserName = loginModel.Email, Email = loginModel.Email, LockoutEnabled = true };

        //    _userManagerMock.Setup(um => um.FindByNameAsync(loginModel.Email)).ReturnsAsync(user);
        //    _userManagerMock.Setup(um => um.CheckPasswordAsync(user, loginModel.Password)).ReturnsAsync(true);
        //    _userManagerMock.Setup(um => um.GetRolesAsync(user)).ReturnsAsync(new[] { "Customer" });
        //    _tokenServiceMock.Setup(ts => ts.GenerateToken(user, "Customer")).Returns("fake-jwt-token");

        //    var result = await _authController.Login(loginModel);
        //    var okResult = Assert.IsType<OkObjectResult>(result);
        //    var response = okResult.Value;

        //    // Use reflection to access the properties of the anonymous type
        //    var tokenProperty = response.GetType().GetProperty("Token");
        //    Assert.NotNull(tokenProperty);
        //    var tokenValue = tokenProperty.GetValue(response) as string;
        //    Assert.Equal("fake-jwt-token", tokenValue);
        //}



        [Fact]
        public async Task Login_InvalidUser_ReturnsUnauthorized()
        {


            var loginModel = new LoginModel { Email = "wrong@example.com", Password = "Passwd123!" };

            _userManagerMock.Setup(um => um.FindByNameAsync(loginModel.Email)).ReturnsAsync((IdentityUser)null);


            var result = await _authController.Login(loginModel);


            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, statusCodeResult.StatusCode);

            var responseModel = Assert.IsType<ResponseModel>(statusCodeResult.Value);
            Assert.Equal("Error", responseModel.Status);
            Assert.Equal("User not found!", responseModel.Message);
        }

        //[Fact]
        //public async Task Register_ValidUser_ReturnsSuccess()
        //{
        //    // Arrange
        //    var registerModel = new RegisterModel
        //    {
        //        Email = "testuser@example.com",
        //        Password = "Test@1234",
        //        ConfirmPassword = "Test@1234",
        //        FullName = "nguneg wfeew wefwe"
        //    };

        //    _userManagerMock.Setup(um => um.CreateAsync(It.IsAny<IdentityUser>(), It.IsAny<string>()))
        //        .ReturnsAsync(IdentityResult.Success);
        //    _userManagerMock.Setup(um => um.AddToRoleAsync(It.IsAny<IdentityUser>(), It.IsAny<string>()))
        //        .ReturnsAsync(IdentityResult.Success);

        //    // Act
        //    var result = await _authController.Register(registerModel);

        //    // Assert
        //    var okResult = Assert.IsType<OkObjectResult>(result);
        //    var response = Assert.IsType<ResponseModel>(okResult.Value);
        //    Assert.Equal("Success", response.Status);
        //    Assert.Equal("User registered successfully!", response.Message);
        //}

     
        [Fact]
        public async Task Login_MissingEmail_ReturnsBadRequest()
        {
            var loginModel = new LoginModel { Email = "", Password = "Qwe@123" };

            var result = await _authController.Login(loginModel);

            var badRequestResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, badRequestResult.StatusCode);

            var responseModel = Assert.IsType<ResponseModel>(badRequestResult.Value);
            Assert.Equal("Error", responseModel.Status);
            Assert.Equal("Email or password is empty.", responseModel.Message);
        }

        [Fact]
        public async Task Login_InvalidPasswordFormat_ReturnsBadRequest()
        {
            var loginModel = new LoginModel { Email = "user@gmail.com", Password = "123" };

            var result = await _authController.Login(loginModel);

            var badRequestResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, badRequestResult.StatusCode);

            var responseModel = Assert.IsType<ResponseModel>(badRequestResult.Value);
            Assert.Equal("Error", responseModel.Status);
            Assert.Equal("Password format is incorrect.", responseModel.Message);
        }

        //[Fact]
        //public async Task Login_LockedOutUser_ReturnsUnauthorized()
        //{
        //    var loginModel = new LoginModel { Email = "lockeduser@gmail.com", Password = "Qwe@123" };
        //    var user = new IdentityUser { UserName = loginModel.Email, Email = loginModel.Email, LockoutEnabled = false, LockoutEnd = DateTimeOffset.MaxValue };

        //    _userManagerMock.Setup(um => um.FindByNameAsync(loginModel.Email)).ReturnsAsync(user);
        //    _userManagerMock.Setup(um => um.CheckPasswordAsync(user, loginModel.Password)).ReturnsAsync(true);

        //    var result = await _authController.Login(loginModel);

        //    var unauthorizedResult = Assert.IsType<ObjectResult>(result);
        //    Assert.Equal(StatusCodes.Status500InternalServerError, unauthorizedResult.StatusCode);
           
        //    var responseModel = Assert.IsType<ResponseModel>(unauthorizedResult.Value);
        //    Assert.Equal("Error", responseModel.Status);
        //    Assert.Equal("User is banned!", responseModel.Message);
        //}


        //[Fact]
        //public async Task Register_ExistingUser_ReturnsError()
        //{
        //    // Arrange
        //    var registerModel = new RegisterModel { Email = "test@example.com", Password = "Password123!", FullName = "Test User" };
        //    var user = new IdentityUser { UserName = registerModel.Email, Email = registerModel.Email };

        //    _userManagerMock.Setup(um => um.FindByNameAsync(registerModel.Email)).ReturnsAsync(user);

        //    // Act
        //    var result = await _authController.Register(registerModel);

        //    // Assert
        //    var errorResult = Assert.IsType<ObjectResult>(result);
        //    Assert.Equal(500, errorResult.StatusCode);
        //    var response = Assert.IsType<ResponseModel>(errorResult.Value);
        //    Assert.Equal("Error", response.Status);
        //    Assert.Equal("User already exists!", response.Message);
        //}

        private static Mock<UserManager<TUser>> GetMockUserManager<TUser>() where TUser : class
        {
            var store = new Mock<IUserStore<TUser>>();
            var optionsAccessor = new Mock<IOptions<IdentityOptions>>();
            var passwordHasher = new Mock<IPasswordHasher<TUser>>();
            var userValidators = new List<IUserValidator<TUser>> { new UserValidator<TUser>() };
            var passwordValidators = new List<IPasswordValidator<TUser>> { new PasswordValidator<TUser>() };
            var lookupNormalizer = new Mock<ILookupNormalizer>();
            var identityErrorDescriber = new Mock<IdentityErrorDescriber>();
            var serviceProvider = new Mock<IServiceProvider>();
            var logger = new Mock<ILogger<UserManager<TUser>>>();

            return new Mock<UserManager<TUser>>(
                store.Object,
                optionsAccessor.Object,
                passwordHasher.Object,
                userValidators,
                passwordValidators,
                lookupNormalizer.Object,
                identityErrorDescriber.Object,
                serviceProvider.Object,
                logger.Object);
        }

        private static Mock<RoleManager<TRole>> GetMockRoleManager<TRole>() where TRole : class
        {
            var store = new Mock<IRoleStore<TRole>>();
            var roleValidators = new List<IRoleValidator<TRole>> { new RoleValidator<TRole>() };
            var keyNormalizer = new Mock<ILookupNormalizer>();
            var errors = new Mock<IdentityErrorDescriber>();
            var logger = new Mock<ILogger<RoleManager<TRole>>>();

            return new Mock<RoleManager<TRole>>(
                store.Object,
                roleValidators,
                keyNormalizer.Object,
                errors.Object,
                logger.Object);
        }
    }
}