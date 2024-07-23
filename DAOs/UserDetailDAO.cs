using DAOs;
using BusinessObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DAOs.Models;
using DAOs.Helper;
using Microsoft.AspNetCore.Identity;

namespace DAOs
{
    public class UserDetailDAO
	{
        private readonly CourtCallerDbContext _dbContext = null;

        public UserDetailDAO()
        {
            if (_dbContext == null)
            {
                _dbContext = new CourtCallerDbContext();
            }
        }

        public UserDetailDAO(CourtCallerDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public List<UserDetail> GetUserDetails()
        {
            return _dbContext.UserDetails.ToList();
        }
        //public List<UserDetail> GetUserDetails()
        //{
        //    var UserDetails = _dbContext.UserDetails
        //  .Include(u => u.User)
        //  .ToList();

        //    return UserDetails.Select(u => new UserDetail
        //    {
        //        UserDetailId = u.UserDetailId,
        //        Point = u.Point,
        //        FullName = u.FullName,
        //        Status = u.Status,
        //        //only BookingId
        //        Users = u.Users.Select(b => new Booking
        //        {
        //            BookingId = b.BookingId
        //        }).ToList(),
        //        //only ReviewId
        //        Reviews = u.Reviews.Select(r => new Review
        //        {
        //            ReviewId = r.ReviewId
        //        }).ToList()
        //    }).ToList();
        //}

        public UserDetail GetUserDetail(string id)
        {
            return _dbContext.UserDetails.FirstOrDefault(m => m.UserId.Equals(id));
        }

        public UserDetail AddUserDetail(UserDetail UserDetail)
        {
            _dbContext.UserDetails.Add(UserDetail);
            _dbContext.SaveChanges();
            return UserDetail;
        }

        public UserDetail UpdateUserDetail(string id, UserDetailsModel userDetailsModel)
        {
            UserDetail oUserDetail = GetUserDetail(id);
            IdentityUser identityUser = _dbContext.Users.FirstOrDefault(m => m.Id.Equals(id));
            if (oUserDetail != null)
            {

                oUserDetail.FullName = userDetailsModel.FullName;
                oUserDetail.Address = userDetailsModel.Address;
                oUserDetail.ProfilePicture = userDetailsModel.ProfilePicture;
                oUserDetail.YearOfBirth = userDetailsModel.YearOfBirth;

                _dbContext.Update(oUserDetail);
                _dbContext.SaveChanges();
            }
            return oUserDetail;
        }

        public async Task<UserDetail> UpdateUserDetailAsync(string userId)
        {
            _dbContext.UserDetails.Update(GetUserDetail(userId));
            await _dbContext.SaveChangesAsync();
            return GetUserDetail(userId);
        }
        public void UpdateUserDetail(UserDetail user)
        {
            _dbContext.UserDetails.Update(user);
            _dbContext.SaveChanges();
        }

        public UserDetail UpdateUser (string id, PutUserDetail userDetailsModel)
        {
            UserDetail oUserDetail = GetUserDetail(id);
            IdentityUser identityUser = _dbContext.Users.FirstOrDefault(m => m.Id.Equals(id));
            if (oUserDetail != null)
            {
                if (!string.IsNullOrEmpty(userDetailsModel.UserName))
                {
                    identityUser.UserName = userDetailsModel.UserName;
                }
                if (!string.IsNullOrEmpty(userDetailsModel.FullName))
                {
                    oUserDetail.FullName = userDetailsModel.FullName;
                }
                if (!string.IsNullOrEmpty(userDetailsModel.PhoneNumber))
                {
                    identityUser.PhoneNumber = userDetailsModel.PhoneNumber;
                }
                if (!string.IsNullOrEmpty(userDetailsModel.Address))
                {
                    oUserDetail.Address = userDetailsModel.Address;
                }
                if (!string.IsNullOrEmpty(userDetailsModel.ProfilePicture))
                {
                    oUserDetail.ProfilePicture = userDetailsModel.ProfilePicture;
                }
                if (userDetailsModel.YearOfBirth.HasValue)
                {
                    oUserDetail.YearOfBirth = userDetailsModel.YearOfBirth.Value;
                }
                _dbContext.Update(oUserDetail);
                _dbContext.SaveChanges();
            }
            return oUserDetail;
        }

        //public void DeleteUserDetail(string id)
        //{
        //    UserDetail oUserDetail = GetUserDetail(id);
        //    if (oUserDetail != null)
        //    {
        //        oUserDetail.Status = false;
        //        _dbContext.Update(oUserDetail);
        //        _dbContext.SaveChanges();
        //    }
        //}

        public List<UserDetail> SearchUserByEmail(string searchValue) 
        {
            try
            {
                var user = _dbContext.Users.Where(m => m.Email == searchValue).FirstOrDefault();
                if (user == null) return null;
                string userId = user.Id;
                var userDetail = _dbContext.UserDetails.Where(u => u.UserId.Equals(userId)).ToList();
                return userDetail;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task<List<UserDetail>> SortUserDetail(string? sortBy, bool isAsc, PageResult pageResult)
        {
            IQueryable<UserDetail> query = _dbContext.UserDetails;

            switch (sortBy?.ToLower())
            {
                case "userid":
                    query = isAsc ? query.OrderBy(b => b.UserId) : query.OrderByDescending(b => b.UserId);
                    break;
                case "address":
                    query = isAsc ? query.OrderBy(b => b.Address) : query.OrderByDescending(b => b.Address);
                    break;
                case "Point":
                    query = isAsc ? query.OrderBy(b => b.Point) : query.OrderByDescending(b => b.Point);
                    break;
                case "fullname":
                    query = isAsc ? query.OrderBy(b => b.FullName) : query.OrderByDescending(b => b.FullName);
                    break;
                case "yearofbirth":
                    query = isAsc ? query.OrderBy(b => b.YearOfBirth) : query.OrderByDescending(b => b.YearOfBirth);
                    break;
                default:
                    break;
            }
            Pagination pagination = new Pagination(_dbContext);
            List<UserDetail> userDetails = await pagination.GetListAsync<UserDetail>(query, pageResult);
            return userDetails;
        }

        public int CountUser()
        {
            return _dbContext.Users.Count();
        }
    }
}
