using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BusinessObjects;
using Services;
using Microsoft.AspNetCore.Authorization;
using DAOs.Helper;
using DAOs.Models;




namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourtsController : ControllerBase
    {
        private readonly CourtService _courtService;

        public CourtsController()
        {
            _courtService = new CourtService();
        }

        // GET: api/Courts
        [HttpGet]
        
        public async Task<ActionResult<IEnumerable<Court>>> GetCourts([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchQuery = null) 
        {
            var pageResult = new PageResult
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            var court = await _courtService.GetCourts(pageResult, searchQuery);
            return Ok(court);
        }

        // GET: api/Courts/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Court>> GetCourt(string id)
        {
            var court = _courtService.GetCourt(id);

            if (court == null)
            {
                return NotFound();
            }

            return court;
        }

        // PUT: api/Courts/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCourt(string id, CourtModel courtModel)
        {
            var court = _courtService.GetCourt(id);
            if (id != court.CourtId)
            {
                return BadRequest();
            }

            _courtService.UpdateCourt(id, courtModel);

            return CreatedAtAction("GetCourt", new { id = court.CourtId }, court);
        }

        // POST: api/Courts
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Court>> PostCourt(CourtModel courtModel)
        {

            var court = _courtService.AddCourt(courtModel);

            return CreatedAtAction("GetCourt", new { id = court.CourtId }, court);
        }

        // DELETE: api/Courts/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourt(string id)
        {
            var court = _courtService.GetCourt(id);
            if (court == null)
            {
                return NotFound();
            }

            _courtService.DeleteCourt(id);

            return NoContent();
        }

        //private bool CourtExists(string id)
        //{
        //    return courtService.GetCourts().Any(e => e.CourtId == id);
        //}

        [HttpGet("{status}")]
        public async Task<ActionResult<IEnumerable<Court>>> GetCourtsByStatus(string status)
        {
            return _courtService.GetCourtsByStatus(status);
        }

        [HttpGet("{sortBy}")]
        public async Task<ActionResult<IEnumerable<Court>>> SortCourt(string sortBy, bool isAsc, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var pageResult = new PageResult
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            return await _courtService.SortCourt(sortBy, isAsc, pageResult);
        }

        [HttpGet("/numberOfCourt/{branchId}")]
        public async Task<ActionResult<int>> GetNumberOfCourtsByBranchId(string branchId)
        {
            if (branchId == null)
            {
                return BadRequest();
            }
            return Ok(_courtService.GetNumberOfCourtsByBranchId(branchId));
        }

        [HttpPost("AvailableCourts")]
        public ActionResult<IEnumerable<Court>> AvailableCourts([FromBody] SlotModel slotModel)
        {
            try
            {
                return Ok(_courtService.AvailableCourts(slotModel));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("GetCourtsByBranchId")]
        public async Task<ActionResult<IEnumerable<Court>>> GetCourtsByBranchId([FromQuery] string branchId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchQuery = null)
        {
            var pageResult = new PageResult
            {
                PageNumber = 1,
                PageSize = 10
            };
            return await _courtService.GetCourtsByBranchId(branchId, pageResult, searchQuery);
        }

    }
}
