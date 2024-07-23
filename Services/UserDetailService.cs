using BusinessObjects;
using DAOs.Models;
using Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAOs.Helper;

namespace Services
{
    public class UserDetailService
    {
        private readonly UserDetailRepository _userDetailRepository = null;

        public UserDetailService()
        {
            if (_userDetailRepository == null)
            {
                _userDetailRepository = new UserDetailRepository();
            }

        }
        public UserDetail AddUserDetail(UserDetail userDetail) => _userDetailRepository.AddUserDetail(userDetail);
   
        public UserDetail GetUserDetail(string id) => _userDetailRepository.GetUserDetail(id);
        public List<UserDetail> GetUserDetails() => _userDetailRepository.GetUserDetails();
        public UserDetail UpdateUserDetail(string id, UserDetailsModel userDetailsModel) => _userDetailRepository.UpdateUserDetail(id, userDetailsModel);
       public async Task<UserDetail> UpdateUserDetailAsync(string userId) => await _userDetailRepository.UpdateUserDetailAsync(userId);

        public UserDetail UpdateUser(string id, PutUserDetail putUserDetail) => _userDetailRepository.UpdateUser(id, putUserDetail);
        public List<UserDetail> SearchUserByEmail(string searchValue) => _userDetailRepository.SearchUserByEmail(searchValue);



        public async Task<List<UserDetail>> SortUserDetail(string? sortBy, bool isAsc, PageResult pageResult) => await _userDetailRepository.SortUserDetail(sortBy, isAsc, pageResult);
        public int CountUser() => _userDetailRepository.CountUser();
    }
}
