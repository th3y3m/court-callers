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
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;
        

        public UsersController()
        {
            _userService = new UserService();
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<PagingResponse<IdentityUser>>> GetUsers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchQuery = null)
        {
            var pageResult = new PageResult
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            var (users,total) = await _userService.GetUsers(pageResult,searchQuery);

            var response = new PagingResponse<IdentityUser>
            {
                Data = users,
                Total = total
            };

            return Ok(response);
        }







        //[HttpGet]
        //public async Task<ActionResult<IEnumerable<IdentityUser>>> GetUsers()
        //{
        //    return _userService.GetUsers().ToList();
        //}

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<IdentityUser>> GetUser(string id)
        {
            var user = _userService.GetUser(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // PUT: api/Users/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        //[HttpPut("{id}")]
        //public async Task<IActionResult> PutUser(string id, IdentityUser user)
        //{
        //    if (id != user.Id)
        //    {
        //        return BadRequest();
        //    }

        //    _userService.UpdateUser(id, user);

        //    return NoContent();
        //}

        // POST: api/Users
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        //[HttpPost]
        //public async Task<ActionResult<IdentityUser>> PostUser(IdentityUser user)
        //{
        //    _userService.AddUser(user);

        //    return CreatedAtAction("GetUser", new { id = user.Id }, user);
        //}

        // DELETE: api/Users/5
        //[HttpDelete("{id}")]
        //public async Task<IActionResult> DeleteUser(string id)
        //{
        //    var user = _userService.GetUser(id);
        //    if (user == null)
        //    {
        //        return NotFound();
        //    }

        //    _userService.DeleteUser(id);

        //    return NoContent();
        //}

        //private bool UserExists(string id)
        //{
        //    return _userService.Users.Any(e => e.UserId == id);
        //}

        [HttpPut("{id}/ban")]
        public async Task<IActionResult> BanUser(string id)
        {
            
            IdentityUser user = _userService.GetUser(id);
            if (id != user.Id)
                return BadRequest();
            else _userService.BanUser(id);

            return NoContent();
        }


        [HttpPut("{id}/unban")]
        public async Task<IActionResult> UnbanUser(string id)
        {
            IdentityUser user = _userService.GetUser(id);
            if (id != user.Id)
                return BadRequest();
            else _userService.UnBanUser(id);

            return NoContent();
        }

        [HttpGet("GetUserDetailByUserEmail/{userEmail}")]
        public async Task<ActionResult<IEnumerable<IdentityUser>>> GetUserByEmail(string userEmail)
        {
            if (string.IsNullOrEmpty(userEmail))
            {
                return BadRequest("User email cannot be null or empty.");
            }

            try
            {
                List<IdentityUser> user = _userService.SearchUserByEmail(userEmail);
                if (user == null)
                {
                    return NotFound($"User with email {userEmail} not found.");
                }

                return user;
            }
            catch (Exception ex)
            {
                // Log the exception here
                return StatusCode(500, $"Internal server error: {ex}");
            }
        }


    }
}
