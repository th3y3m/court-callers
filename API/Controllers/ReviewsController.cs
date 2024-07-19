using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BusinessObjects;
using Services;
using Microsoft.AspNetCore.Identity;
using DAOs.Helper;
using DAOs.Models;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly ReviewService _reviewService;

        public ReviewsController()
        {
            _reviewService = new ReviewService();
        }

        // GET: api/Reviews
        [HttpGet]
        public async Task<ActionResult<PagingResponse<Review>>> GetReviews([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchQuery = null)
        {
            var pageResult = new PageResult
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            var  (review,total) = await _reviewService.GetReview(pageResult,searchQuery);

            var response = new PagingResponse<Review>
            {
                Data = review,
                Total = total
            };

            return Ok(response);
        }

        // GET: api/Reviews/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Review>> GetReview(string id)
        {
            var review = _reviewService.GetReview(id);

            if (review == null)
            {
                return NotFound();
            }

            return review;
        }

        // PUT: api/Reviews/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutReview(string id, ReviewModel reviewModel)
        {
            var review = _reviewService.GetReview(id);
            if (id != review.ReviewId)
            {
                return BadRequest();
            }

            _reviewService.UpdateReview(id, reviewModel);

            return CreatedAtAction("GetReview", new { id = review.ReviewId }, review);
        }

        // POST: api/Reviews
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Review>> PostReview(ReviewModel reviewModel)
        {
            var review = _reviewService.AddReview(reviewModel);

            return CreatedAtAction("GetReview", new { id = review.ReviewId }, review);
        }

        // DELETE: api/Reviews/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(string id)
        {
            var review = _reviewService.GetReview(id);

            _reviewService.DeleteReview(id);

            return NoContent();
        }

        //private bool ReviewExists(string id)
        //{
        //    return reviewService.GetReviews().Any(e => e.ReviewId == id);
        //}


        [HttpGet("GetReviewsByBranch/{id}")]
        public async Task<ActionResult<IEnumerable<Review>>> GetReviewsByBranch(string id)
        {
            return _reviewService.GetReviewsByBranch(id);
        }

        [HttpGet("SearchByUser/{id}")]
        public async Task<ActionResult<IEnumerable<Review>>> SearchByUser(string id)
        {
            return _reviewService.SearchByUser(id);
        }

        [HttpGet("SearchByDate/{start}/{end}")]
        public async Task<ActionResult<IEnumerable<Review>>> SearchByDate(DateTime start, DateTime end)
        {
            return _reviewService.SearchByDate(start, end);
        }

        [HttpGet("SearchByRating/{rating}")]
        public async Task<ActionResult<IEnumerable<Review>>> SearchByRating(int rating)
        {
            return _reviewService.SearchByRating(rating);
        }


        [HttpGet("SortReview/{sortBy}")]
        public async Task<ActionResult<IEnumerable<Review>>> SortReview(string sortBy, bool isAsc, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var pageResult = new PageResult
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            return await _reviewService.SortReview(sortBy, isAsc, pageResult);
        }

        [HttpGet("GetRatingPercentageOfABranch/{branchId}")]
        public ActionResult<List<decimal>> GetRatingPercentageOfABranch(string branchId)
        {
            return _reviewService.GetRatingPercentageOfABranch(branchId);
        }

        [HttpGet("AverageRating/{branchId}")]
        public ActionResult<double> AverageRating(string branchId)
        {
            return _reviewService.AverageRating(branchId);
        }
    }
}
