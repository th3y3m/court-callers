using BusinessObjects;
using DAOs;
using DAOs.Helper;
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
    public class ReviewRepositoryTests
    {
        private readonly Mock<DbSet<Review>> mockSet;
        private readonly Mock<CourtCallerDbContext> mockContext;
        private readonly List<Review> reviewList;
        private readonly ReviewDAO reviewDAO;
        private readonly ReviewRepository reviewRepository;

        public ReviewRepositoryTests()
        {
            // Initialize mock set and context
            mockSet = new Mock<DbSet<Review>>();
            mockContext = new Mock<CourtCallerDbContext>();
            reviewList = new List<Review>
            {
                new Review { ReviewId = "R00001", ReviewText = "Test Review 1", Rating = 5, ReviewDate = DateTime.Now, BranchId = "B00001", Id = "U00001"},
                new Review { ReviewId = "R00002", ReviewText = "Test Review 2", Rating = 1, ReviewDate = DateTime.Now, BranchId = "B00001", Id = "U00001" },
                new Review { ReviewId = "R00003", ReviewText = "Test Review 3", Rating = 2, ReviewDate = DateTime.Now, BranchId = "B00001", Id = "U00002" },
                new Review { ReviewId = "R00004", ReviewText = "Test Review 4", Rating = 3, ReviewDate = DateTime.Now, BranchId = "B00001", Id = "U00003" },
                new Review { ReviewId = "R00005", ReviewText = "Test Review 5", Rating = 4, ReviewDate = DateTime.Now, BranchId = "B00001", Id = "U00004"},
                new Review { ReviewId = "R00006", ReviewText = "Test Review 6", Rating = 5, ReviewDate = DateTime.Now, BranchId = "B00001", Id = "U00005"},
            };

            var data = reviewList.AsQueryable();

            mockSet.As<IQueryable<Review>>().Setup(m => m.Provider).Returns(data.Provider);
            mockSet.As<IQueryable<Review>>().Setup(m => m.Expression).Returns(data.Expression);
            mockSet.As<IQueryable<Review>>().Setup(m => m.ElementType).Returns(data.ElementType);
            mockSet.As<IQueryable<Review>>().Setup(m => m.GetEnumerator()).Returns(data.GetEnumerator());

            mockContext.Setup(c => c.Reviews).Returns(mockSet.Object);

            reviewDAO = new ReviewDAO(mockContext.Object);
            reviewRepository = new ReviewRepository(reviewDAO);
        }

        //[Theory]
        //[InlineData(5, 33, "B00001")]
        //[InlineData(1, 17, "B00001")]
        //public void GetRatingPercentageOfABranch_ReturnsWell(int rating, decimal expected, string branchId)
        //{
        //    decimal actual = Math.Round(reviewRepository.GetRatingPercentageOfABranch(rating, branchId));

        //    Assert.Equal(expected, actual);
        //}

        //[Fact]
        //public void GetRatingPercentageOfABranch_ReturnsZero()
        //{
        //    decimal actual = Math.Round(reviewRepository.GetRatingPercentageOfABranch(0, "B00001"));

        //    Assert.Equal(0, actual);
        //}

        [Fact]
        public void AddReview_ReturnsWell()
        {
            ReviewModel reviewModel = new ReviewModel
            {
                ReviewText = "Test Review 7",
                Rating = 5,
                BranchId = "B00001",
                UserId= "U00001"
            };

            Review review = reviewRepository.AddReview(reviewModel);

            Assert.NotNull(review);
            Assert.Equal("Test Review 7", review.ReviewText);
            Assert.Equal(5, review.Rating);
            Assert.Equal("B00001", review.BranchId);
        }

        [Fact]
        public void GetReivew_ReturnsWell()
        {
            Review review = reviewRepository.GetReview("R00001");

            Assert.NotNull(review);
            Assert.Equal("R00001", review.ReviewId);
            Assert.Equal("Test Review 1", review.ReviewText);
            Assert.Equal(5, review.Rating);
            Assert.Equal("B00001", review.BranchId);
        }

        [Fact]
        public void GetReviewsByBranch_ReturnsWell()
        {
            List<Review> reviews = reviewRepository.GetReviewsByBranch("B00001");

            Assert.NotNull(reviews);
            Assert.Equal(6, reviews.Count);
        }

        [Theory]
        [InlineData("U00001", 2)]
        [InlineData("U00002", 1)]
        [InlineData("U00003", 1)]
        [InlineData("U00004", 1)]
        [InlineData("U00005", 1)]
        [InlineData("U00009", 0)]

        public void SearchByUser_ReturnsWell(string userId, int count)
        {
            List<Review> reviews = reviewRepository.SearchByUser(userId);

            Assert.NotNull(reviews);
            Assert.Equal(count, reviews.Count);
        }
        [Fact]
        public void SearchByDate_ReturnsWell()
        {
            List<Review> reviews = reviewRepository.SearchByDate(DateTime.Now.AddDays(-1), DateTime.Now.AddDays(1));

            Assert.NotNull(reviews);
            Assert.Equal(6, reviews.Count);
        }
        [Fact]
        public void SearchByRating_ReturnsWell()
        {
            List<Review> reviews = reviewRepository.SearchByRating(5);

            Assert.NotNull(reviews);
            Assert.Equal(2, reviews.Count);
        }

        [Fact]
        public void UpdateReview_ReturnsWell() {
            ReviewModel reviewModel = new ReviewModel
            {
                ReviewText = "Test Review 1 Updated",
                Rating = 1,
                BranchId = "B00001",
                UserId = "U00001"
            };

            Review review = reviewRepository.UpdateReview("R00001", reviewModel);

            Assert.NotNull(review);
            Assert.Equal("Test Review 1 Updated", review.ReviewText);
            Assert.Equal(1, review.Rating);
            Assert.Equal("B00001", review.BranchId);
        }
        [Fact]
        public void GetReview_ReturnsNull()
        {
            Review review = reviewRepository.GetReview("R00007");

            Assert.Null(review);
        }
        [Fact]
        public void DeleteReview_ReturnsNull()
        {
            reviewRepository.DeleteReview("R00007");

            Review review = reviewRepository.GetReview("R00007");

            Assert.Null(review);
        }

    }
}
