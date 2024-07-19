using Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace Services
{
	public class UserService
	{
		private readonly UserRepository _userRepository = null;
		public UserService()
		{
			if (_userRepository == null)
			{
                _userRepository = new UserRepository();
			}
		}

		public IdentityUser AddUser(IdentityUser User) => _userRepository.AddUser(User);
		//public void DeleteUser(string id) => UserRepository.DeleteUser(id);
		public IdentityUser GetUser(string id) => _userRepository.GetUser(id);
		//public List<IdentityUser> GetUsers() => UserRepository.GetUsers();
        //public IdentityUser UpdateUser(string id, IdentityUser User) => UserRepository.UpdateUser(id, User);

        public async Task<(List<IdentityUser>, int total)> GetUsers(DAOs.Helper.PageResult page, string searchQuery = null) => await _userRepository.GetUsers(page,searchQuery);


        public void BanUser(string id) => _userRepository.BanUser(id);
		
		public void UnBanUser(string id) => _userRepository.UnBanUser(id);

        public List<IdentityUser> SearchUserByEmail(string searchValue) => _userRepository.SearchUserByEmail(searchValue);

    }
}
