using Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using StackExchange.Redis;
using Newtonsoft.Json;

namespace Services
{
	public class UserService
	{
		private readonly UserRepository _userRepository = null;
        private readonly IConnectionMultiplexer _redis;
        private IDatabase _db ;
        public UserService()
		{
			if (_userRepository == null)
			{
                _userRepository = new UserRepository();
			}
		}

        public void InitializeRedis(IConnectionMultiplexer redis)
        {
            _db = redis.GetDatabase();
        }
        public void UpdateIdentityUser(IdentityUser IdentityUser) => _userRepository.UpdateIdentityUser(IdentityUser);

        public IdentityUser AddUser(IdentityUser User) => _userRepository.AddUser(User);
		//public void DeleteUser(string id) => UserRepository.DeleteUser(id);
		public IdentityUser GetUser(string id) => _userRepository.GetUser(id);
		//public List<IdentityUser> GetUsers() => UserRepository.GetUsers();
		//public IdentityUser UpdateUser(string id, IdentityUser User) => UserRepository.UpdateUser(id, User);

		public async Task<(List<IdentityUser>, int total)> GetUsers(DAOs.Helper.PageResult page, string searchQuery = null)
		{
            if (_db == null)
            {
                throw new InvalidOperationException("Redis database has not been initialized.");
            }
            string key = $"all_users_pageNum_{page.PageNumber}_pageSize_{page.PageSize}_Search_{searchQuery}";
            var cachedUsers = await _db.StringGetAsync(key);
            List<IdentityUser> users;
            int total;

            if (!cachedUsers.IsNullOrEmpty)
            {
                var cachedData = JsonConvert.DeserializeObject<(List<IdentityUser>, int)>(cachedUsers);
                users = cachedData.Item1;
                total = cachedData.Item2;
            }
            else
            {
                var userList = await _userRepository.GetUsers(page, searchQuery);
                users = userList.Item1;
                total = userList.Item2;

                // Lưu vào Redis
                await _db.StringSetAsync(key, JsonConvert.SerializeObject((users, total)));
            }
           

            return (users,total);
		}

        public void BanUser(string id) => _userRepository.BanUser(id);
		
		public void UnBanUser(string id) => _userRepository.UnBanUser(id);

        public List<IdentityUser> SearchUserByEmail(string searchValue) => _userRepository.SearchUserByEmail(searchValue);

    }
}
