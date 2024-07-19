using BusinessObjects;
using DAOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using DAOs.Helper;

namespace Repositories
{
	public class UserRepository
	{
		private readonly UserDAO _userDao = null;
		public UserRepository()
		{
			if (_userDao == null)
			{
                _userDao = new UserDAO();
			}
		}
		public UserRepository(UserDAO userDAO)
		{
			_userDao = userDAO;
			
		}

        public IdentityUser AddUser(IdentityUser user) => _userDao.AddUser(user);

        //public void DeleteIdentityUser(string id) => UserDAO.DeleteIdentityUser(id);

        public async Task<(List<IdentityUser>, int total)> GetUsers(PageResult page, string searchQuery = null) => await _userDao.GetUsers(page,searchQuery);



        public IdentityUser GetUser(string id) => _userDao.GetUser(id);

		//public List<IdentityUser> GetUsers() => UserDAO.GetUsers();

		//public IdentityUser UpdateIdentityUser(string id, IdentityUser IdentityUser) => UserDAO.UpdateIdentityUser(id, IdentityUser);

		public void BanUser(string id) => _userDao.BanUser(id);

		public void UnBanUser(string id) => _userDao.UnBanUser(id);

        public List<IdentityUser> SearchUserByEmail(string searchValue) => _userDao.SearchUserByEmail(searchValue);

		public IdentityUser GetUserByBookingId(string bookingId) => _userDao.GetUserByBookingId(bookingId);
    }
}
