using BusinessObjects;
using DAOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace Repositories
{
    public class RoleRepository
    {
        private readonly RoleDAO _roleDao = null;
        public RoleRepository()
        {
            if (_roleDao == null)
            {
                _roleDao = new RoleDAO();
            }
        }

        public RoleRepository(RoleDAO roleDAO)
        {

            _roleDao = roleDAO;

        }


        public IdentityRole AddRole(IdentityRole role) => _roleDao.AddRole(role);

        public void DeleteRole(string id) => _roleDao.DeleteRole(id);

        public IdentityRole GetRole(string id) => _roleDao.GetRole(id);

        public List<IdentityRole> GetRoles() => _roleDao.GetRoles();

        public void UpdateRole(string id, string role) => _roleDao.UpdateRole(id, role);

        public string[] GetRoleNameByUserId(string userId) => _roleDao.GetRoleNameByUserId(userId);
    }

}
