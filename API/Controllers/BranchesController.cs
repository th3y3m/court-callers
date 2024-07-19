using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BusinessObjects;
using Repositories;
using Services;
using Microsoft.AspNetCore.Authorization;
using DAOs.Helper;
using DAOs.Models;
using Firebase.Storage;
using Firebase.Auth;
using System.Text.Json;
using MailKit.Search;
using static Microsoft.ApplicationInsights.MetricDimensionNames.TelemetryContext;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
  
    public class BranchesController : ControllerBase
    {
        private readonly BranchService _branchService;

        public BranchesController()
        {
            _branchService = new BranchService();
        }

        // GET: api/Branches
      
        [HttpGet]
        public async Task<ActionResult<PagingResponse<Branch>>> GetBranches([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchQuery = null)
        {
            var pageResult = new PageResult
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            var (branches,total) = await _branchService.GetBranches(pageResult,searchQuery);

            var response =  new PagingResponse<Branch>
            {
                Data = branches,
                Total = total
            };
            

            return Ok(response);
        }
        [HttpGet("HomePage")]
        public async Task<ActionResult<PagingResponse<Branch>>> GetBranches([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string status = "Active", [FromQuery] string searchQuery = null)
        {
            var pageResult = new PageResult
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            var (branches,total) = await _branchService.GetBranches(pageResult, status, searchQuery);

            var response =  new PagingResponse<Branch>
            {
                Data = branches,
                Total = total
            };
            

            return Ok(response);
        }

        // GET: api/Branches/5
       
        [HttpGet("{id}")]
        public async Task<ActionResult<Branch>> GetBranch(string id)
        {
            var branch = _branchService.GetBranch(id);

            if (branch == null)
            {
                return NotFound();
            }

            return branch;
        }

        // PUT: api/Branches/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754

        [HttpPut("{id}")]
        public async Task<IActionResult> PutBranch(string id, [FromForm] PutBranch branchModel, [FromForm] List<string> ExistingImages)
        {
            var branch = _branchService.GetBranch(id);
            if (branch == null)
            {
                return NotFound();
            }

           
            Console.WriteLine("Existing Images: " + string.Join(", ", ExistingImages ?? new List<string>()));

            
            var existingImageUrls = ExistingImages ?? new List<string>();
            var imageUrls = new List<string>(existingImageUrls);

            // Upload new images and add their URLs to the list
            //foreach (var file in branchModel.BranchPictures)
            //{
            //    if (file.Length > 0)
            //    {
            //        var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
            //        using (var stream = file.OpenReadStream())
            //        {
            //            var task = new FirebaseStorage("court-callers.appspot.com")
            //                .Child("BranchImage")
            //                .Child(fileName)
            //                .PutAsync(stream);

            //            var downloadUrl = await task;
            //            imageUrls.Add(downloadUrl);
            //        }
            //    }
            //}

            // Log để kiểm tra các URL ảnh kết hợp
            Console.WriteLine("Combined Image URLs: " + string.Join(", ", imageUrls));

            // Serialize combined image URLs
            branchModel.BranchPicture = JsonSerializer.Serialize(imageUrls);

            if (id != branch.BranchId)
            {
                return BadRequest();
            }

            _branchService.UpdateBranch(id, branchModel);

            return CreatedAtAction("GetBranch", new { id = branch.BranchId }, branch);
        }



        // POST: api/Branches

        //[HttpPost]
        //public async Task<ActionResult<Branch>> PostBranch(BranchModel branchModel)
        //{
        //    var branch = _branchService.AddBranch(branchModel);

        //    return CreatedAtAction("GetBranch", new { id = branch.BranchId }, branch);
        //}


        [HttpPost]
        public async Task<ActionResult<Branch>> PostBranch([FromForm] BranchModel branchModel)
        {
            var imageUrls = new List<string>();

            foreach (var file in branchModel.BranchPictures)
            {
                var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
                using (var stream = file.OpenReadStream())
                {
                    var task = new FirebaseStorage("court-callers.appspot.com")
                        .Child("BranchImage")
                        .Child(fileName)
                        .PutAsync(stream);

                    var downloadUrl = await task;
                    imageUrls.Add(downloadUrl);
                }
            }

            branchModel.BranchPicture = JsonSerializer.Serialize(imageUrls);
            var branch = _branchService.AddBranch(branchModel);

            return CreatedAtAction("GetBranch", new { id = branch.BranchId }, branch);
        }

        // DELETE: api/Branches/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBranch(string id)
        {
            var branch = _branchService.GetBranch(id);
            if (branch == null)
            {
                return NotFound();
            }
            _branchService.DeleteBranch(id);
            return NoContent();
        }

        //private bool BranchExists(string id)
        //{
        //    return _branchService.GetBranches().Any(e => e.BranchId == id);
        //}

        [HttpGet("status")]
        public async Task<ActionResult<IEnumerable<Branch>>> GetBranchesByStatus(string status)
        {
            return _branchService.GetBranchesByStatus(status).ToList();
        }

        //[HttpGet("GetBranchByPrice/{minPrice}&&{maxPrice}")]
        //public async Task<ActionResult<IEnumerable<Branch>>> SortBranchByPrice(decimal minPrice, decimal maxPrice)
        //{
        //    return _branchService.GetBranchByPrice(minPrice, maxPrice).ToList();
        //}

        [HttpGet("courtId/{courtId}")]
        public async Task<ActionResult<IEnumerable<Branch>>> GetBranchesByCourtId(string courtId)
        {
            return _branchService.GetBranchesByCourtId(courtId).ToList();
        }

        [HttpGet("lastBranch/{userId}")]
        public async Task<ActionResult<Branch>> GetLastBranch(string userId)
        {
            return _branchService.GetLastBranch(userId);
        }

        [HttpGet("sortBranch/{sortBy}")]
        public async Task<ActionResult<IEnumerable<Branch>>> SortBranch(string sortBy, bool isAsc, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var pageResult = new PageResult
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            return await _branchService.SortBranch(sortBy, isAsc, pageResult);
        }

        [HttpGet("sortBranchByDistance")]
        public async Task<ActionResult<PagingResponse<BranchDistance>>> SortBranchByDistance([FromQuery] LocationModel user, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var pageResult = new PageResult
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            var (branches, total) = await _branchService.SortBranchByDistance(user, pageResult);
            if (total == 0)
            {
                return NotFound("No branches found or unable to sort branches by distance.");
            }

            var response = new PagingResponse<BranchDistance>
            {
                Data = branches,
                Total = total
            };
            return Ok(response);
        }

        [HttpGet("GetBranchByPrice/{minPrice}&&{maxPrice}")]
        public async Task<ActionResult<PagingResponse<Branch>>> GetBranchByPrice([FromQuery] decimal minPrice = 0, [FromQuery] decimal maxPrice = 200, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {

            var pageResult = new PageResult
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            var (branches, total) = await _branchService.GetBranchByPrice(minPrice, maxPrice, pageResult);
            if (total == 0)
            {
                return NotFound("No branches found.");
            }
            var response = new PagingResponse<Branch>
            {
                Data = branches,
                Total = total
            };
            return Ok(response);
        }

        [HttpGet("GetBranchByRating/{rating}")]
        public async Task<ActionResult<PagingResponse<Branch>>> GetBranchByRating([FromQuery] int rating = 5, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {

            var pageResult = new PageResult
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            var (branches, total) = await _branchService.GetBranchByRating(rating, pageResult);
            if (total == 0)
            {
                return NotFound("No branches found.");
            }
            var response = new PagingResponse<Branch>
            {
                Data = branches,
                Total = total
            };
            return Ok(response);
        }

    }
}
