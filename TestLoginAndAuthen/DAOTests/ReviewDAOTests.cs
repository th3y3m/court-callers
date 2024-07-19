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
    public class ReviewDAOTests
    {
        private readonly Mock<DbSet<Review>> mockSet;
        private readonly Mock<CourtCallerDbContext> mockContext;
        private readonly List<Review> reviewList;

        public ReviewDAOTests()
        {
            // Initialize mock set and context
            mockSet = new Mock<DbSet<Review>>();
            mockContext = new Mock<CourtCallerDbContext>();
            reviewList = new List<Review>
            {
                new Review { ReviewId = "R00001", BranchId = "B0001", Rating = 5, ReviewText = "Good", ReviewDate = DateTime.Now, Id = "U001" },
                new Review { ReviewId = "R00002", BranchId = "B0001", Rating = 4, ReviewText = "Not bad", ReviewDate = DateTime.Now, Id = "U002" },
                new Review { ReviewId = "R00003", BranchId = "B0001", Rating = 3, ReviewText = "Normal", ReviewDate = DateTime.Now, Id = "U003" },
                new Review { ReviewId = "R00004", BranchId = "B0001", Rating = 2, ReviewText = "Bad", ReviewDate = DateTime.Now, Id = "U004" },
                new Review { ReviewId = "R00005", BranchId = "B0005", Rating = 1, ReviewText = "Very bad", ReviewDate = DateTime.Now, Id = "U005" }
            };
            var data = reviewList.AsQueryable();

            mockSet.As<IQueryable<Review>>().Setup(m => m.Provider).Returns(data.Provider);
            mockSet.As<IQueryable<Review>>().Setup(m => m.Expression).Returns(data.Expression);
            mockSet.As<IQueryable<Review>>().Setup(m => m.ElementType).Returns(data.ElementType);
            mockSet.As<IQueryable<Review>>().Setup(m => m.GetEnumerator()).Returns(data.GetEnumerator());

            mockContext.Setup(c => c.Reviews).Returns(mockSet.Object);
        }


        //[Fact]
        //public void GetReviews_ReturnsReviews()
        //{
        //    var dao = new ReviewDAO(mockContext.Object);
        //    var reviews = dao.GetReviews();
        //    Assert.Equal(5, reviews.Count);
        //}
        [Fact]
        public void GetReview_ReturnsReview()
        {
            var dao = new ReviewDAO(mockContext.Object);
            var review = dao.GetReview("R00001");
            Assert.NotNull(review);
        }
        [Fact]
        public void AddReview_ReturnsReview()
        {
            var dao = new ReviewDAO(mockContext.Object);
            var review = new ReviewModel
            {
                BranchId = "B0001",
                Rating = 5,
                ReviewText = "Good",
                UserId = "U001"
            };
            var result = dao.AddReview(review);
            Assert.NotNull(result);
        }
        [Fact]
        public void UpdateReview_ReturnsReview()
        {
            var dao = new ReviewDAO(mockContext.Object);
            var review = new ReviewModel
            {
                BranchId = "B0001",
                Rating = 5,
                ReviewText = "Good",
                UserId = "U001"
            };
            var result = dao.UpdateReview("R00001", review);
            Assert.NotNull(result);
        }
        [Fact]
        public void DeleteReview_ReturnsReview()
        {
            var dao = new ReviewDAO(mockContext.Object);
            dao.DeleteReview("R00001");
            Assert.NotNull(dao.GetReview("R00001"));
        }
        [Fact]
        public void GetReviewsByBranch_ReturnsReviews()
        {
            var dao = new ReviewDAO(mockContext.Object);
            var reviews = dao.GetReviewsByBranch("B0001");
            Assert.Equal(4, reviews.Count);
        }
        [Fact]
        public void SearchByDate_ReturnsReviews()
        {
            var dao = new ReviewDAO(mockContext.Object);
            var reviews = dao.SearchByDate(DateTime.Now.AddDays(-1), DateTime.Now.AddDays(1));
            Assert.Equal(5, reviews.Count);
        }
        [Fact]
        public void SearchByRating_ReturnsReviews()
        {
            var dao = new ReviewDAO(mockContext.Object);
            var reviews = dao.SearchByRating(5);
            Assert.Equal(1, reviews.Count);
        }
        [Fact]
        public void SearchByUser_ReturnsReviews()
        {
            var dao = new ReviewDAO(mockContext.Object);
            var reviews = dao.SearchByUser("U001");
            Assert.Single(reviews);
        }
        [Fact]
        public void SearchByUser_ReturnsEmpty()
        {
            var dao = new ReviewDAO(mockContext.Object);
            var reviews = dao.SearchByUser("U006");
            Assert.Empty(reviews);
        }


    }
}
