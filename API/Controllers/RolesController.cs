using BusinessObjects;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
	{
		private readonly RoleService _roleService;

		public RolesController()
		{
            _roleService = new RoleService();
		}

		// GET: api/Roles
		[HttpGet]
		public async Task<ActionResult<IEnumerable<IdentityRole>>> GetRoles()
		{
			return _roleService.GetRoles();
		}

        // GET: api/Roles/5
        [HttpGet("roleId/{id}")]
        public async Task<ActionResult<IdentityRole>> GetRole(string id)
        {
            var Role = _roleService.GetRole(id);

            if (Role == null)
            {
                return NotFound();
            }

            return Role;
        }

        [HttpGet("userId/{userId}")]
        public async Task<ActionResult<string[]>> GetRoleNameByUserId(string userId)
        {
            var Role = _roleService.GetRoleNameByUserId(userId);

            if (Role == null)
            {
                return NotFound();
            }

            return Role;
        }

        
        [HttpPut("{id}")]
        public IActionResult PutRole(string id,[FromBody] string role)
        {
            var roleUser =  _roleService.GetRoleNameByUserId(id);
            try
            {
                     _roleService.UpdateRole(id, role);

                    return Ok();
                
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // POST: api/Roles
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        //[HttpPost]
        //public async Task<ActionResult<IdentityRole>> PostRole(IdentityRole Role)
        //{
        //	RoleService.AddRole(Role);

        //	return CreatedAtAction("GetRole", new { id = Role.Id }, Role);
        //}

        // DELETE: api/Roles/5
        //[HttpDelete("{id}")]
        //public async Task<IActionResult> DeleteRole(string id)
        //{
        //	var Role = RoleService.GetRole(id);

        //	RoleService.DeleteRole(id);

        //	return NoContent();
        //}

        //private bool RoleExists(string id)
        //{
        //	return RoleService.GetRoles().Any(e => e.Id == id);
        //}
    }
}
