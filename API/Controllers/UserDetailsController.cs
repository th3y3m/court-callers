using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BusinessObjects;
using DAOs.Helper;
using Services;
using Microsoft.AspNetCore.Identity;
using DAOs.Models;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserDetailsController : ControllerBase
    {
        private readonly UserDetailService _userDetailService;

        public UserDetailsController()
        {
            _userDetailService = new UserDetailService();
        }

        // GET: api/UserDetails
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDetail>>> GetUserDetails()
        {
            return _userDetailService.GetUserDetails().ToList();
        }

        // GET: api/UserDetails/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDetail>> GetUser(string id)
        {
            var user = _userDetailService.GetUserDetail(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        //PUT: api/UserDetails/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(string id, UserDetailsModel userDetailsModel)
        {
            var user = _userDetailService.GetUserDetail(id);
            if (id != user.UserId)
            {
                return BadRequest();
            }

            _userDetailService.UpdateUserDetail(id, userDetailsModel);

            return CreatedAtAction("GetUserDetailByUserId", new { userId = user.UserId }, user);
        }

        [HttpPut("foruser/{id}")]
        public async Task<IActionResult> PutUserDetail(string id, PutUserDetail userDetailsModel)
        {
            var user = _userDetailService.GetUserDetail(id);
            if (id != user.UserId)
            {
                return BadRequest();
            }

            _userDetailService.UpdateUser(id, userDetailsModel);

            return CreatedAtAction("GetUserDetailByUserId", new { userId = user.UserId }, user);
        }

        // POST: api/UserDetails
        // To protect from overposting attacks, seek https://go.microsoft.com/fwlink/?linkid=2123754
        //[HttpPost]
        //public async Task<ActionResult<UserDetail>> PostUser(UserDetail user)
        //{
        //    _userDetailService.AddUserDetail(user);

        //    return CreatedAtAction("GetUser", new { id = user.UserId }, user);
        //}

        //DELETE: api/UserDetails/5
        //[HttpDelete("{id}")]
        //public async Task<IActionResult> DeleteUser(string id)
        //{
        //	var user = UserDetailservice.GetUserDetail(id);
        //	if (user == null)
        //	{
        //		return NotFound();
        //	}

        //	UserDetailservice.DeleteUserDetail(id);

        //	return NoContent();
        //}

        private bool UserExists(string id)
        {
            return _userDetailService.GetUserDetails().Any(e => e.UserId == id);
        }

        [HttpGet("GetUserDetailByUserId/{userId}")]
        public async Task<ActionResult<UserDetail>> GetUserDetailByUserId(string userId)
        {
            var user = _userDetailService.GetUserDetail(userId);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        [HttpGet("GetUserDetailByUserEmail/{userEmail}")]
        public async Task<ActionResult<UserDetail>> GetUserByEmail(string userEmail)
        {
            if (string.IsNullOrEmpty(userEmail))
            {
                return BadRequest("User email cannot be null or empty.");
            }

            try
            {
                var user = _userDetailService.SearchUserByEmail(userEmail).FirstOrDefault();
                if (user == null)
                {
                    return NotFound($"User with email {userEmail} not found.");
                }

                return user;
            }
            catch (Exception ex)
            {
                
                return StatusCode(500, $"Internal server error: {ex}");
            }
        }

        [HttpGet("SortUser/{sortBy}")]
        public async Task<ActionResult<IEnumerable<UserDetail>>> SortReview(string sortBy, bool isAsc, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var pageResult = new PageResult
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            return await _userDetailService.SortUserDetail(sortBy, isAsc, pageResult);
        }
    }
}
