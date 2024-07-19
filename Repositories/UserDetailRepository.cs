using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BusinessObjects;
using DAOs.Models;
using DAOs;
using DAOs.Helper;

namespace Repositories
{
    public class UserDetailRepository
    {
        private readonly UserDetailDAO _userDetailDao = null;
        public UserDetailRepository()
        {
            if (_userDetailDao == null)
            {
                _userDetailDao = new UserDetailDAO();
            }
        }
        public UserDetailRepository(UserDetailDAO userDetailDAO)
        {
            _userDetailDao = userDetailDAO;

        }


        public UserDetail AddUserDetail(UserDetail userDetail) => _userDetailDao.AddUserDetail(userDetail);

        //public void DeleteUserDetail(string id) => _userDetailDao.DeleteUserDetail(id);

        public UserDetail GetUserDetail(string id) => _userDetailDao.GetUserDetail(id);

        public List<UserDetail> GetUserDetails() => _userDetailDao.GetUserDetails();

        public UserDetail UpdateUserDetail(string id, UserDetailsModel userDetailsModel) => _userDetailDao.UpdateUserDetail(id, userDetailsModel);

        public async Task<UserDetail> UpdateUserDetailAsync(string userId) => await _userDetailDao.UpdateUserDetailAsync(userId);
        public UserDetail UpdateUser (string id , PutUserDetail putUserDetail) => _userDetailDao.UpdateUser(id, putUserDetail);

        public List<UserDetail> SearchUserByEmail(string searchValue) => _userDetailDao.SearchUserByEmail(searchValue);

        public async Task<List<UserDetail>> SortUserDetail(string? sortBy, bool isAsc, PageResult pageResult) => await _userDetailDao.SortUserDetail(sortBy, isAsc, pageResult);
    }
}
