using BusinessObjects;
using Microsoft.AspNetCore.Identity;
using Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
	public class RoleService
	{
		private readonly RoleRepository _roleRepository = null;
		public RoleService()
		{
			if (_roleRepository == null)
			{
                _roleRepository = new RoleRepository();
			}
		}
		public IdentityRole AddRole(IdentityRole Role) => _roleRepository.AddRole(Role);
		public void DeleteRole(string id) => _roleRepository.DeleteRole(id);
		public IdentityRole GetRole(string id) => _roleRepository.GetRole(id);
		public List<IdentityRole> GetRoles() => _roleRepository.GetRoles();
		public void UpdateRole(string id, string Role) => _roleRepository.UpdateRole(id, Role);

		public string[] GetRoleNameByUserId(string userId) => _roleRepository.GetRoleNameByUserId(userId);
	}
}
