using BusinessObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using DAOs.Helper;
using Microsoft.EntityFrameworkCore;

namespace DAOs
{
	public class UserDAO
	{
		private readonly CourtCallerDbContext _dbContext = null;
        Guid guid =Guid.NewGuid();

        public UserDAO()
		{
			if (_dbContext == null)
			{
				_dbContext = new CourtCallerDbContext();
			}
		}

        public UserDAO(CourtCallerDbContext dbContext)
        {
            _dbContext = dbContext;
        }


        //public string GenerateUserId ()
        //{
        //    return "U" + guid.ToString(); 
        //}

        public async Task<(List<IdentityUser>,int total)> GetUsers(PageResult pageResult, string searchQuery = null)
        {
            var query = _dbContext.Users.AsQueryable();
            int total = await _dbContext.Users.CountAsync();
            if (!string.IsNullOrEmpty(searchQuery))
            {
                query = from user in query
                        join userRole in _dbContext.UserRoles on user.Id equals userRole.UserId
                        join role in _dbContext.Roles on userRole.RoleId equals role.Id
                        where user.Id.Contains(searchQuery) ||
                              user.Email.Contains(searchQuery) ||
                              user.UserName.Contains(searchQuery) ||
                              user.PhoneNumber.Contains(searchQuery) ||
                              role.Name.Contains(searchQuery)
                        select user;
            }


            Pagination pagination = new Pagination(_dbContext);
            List<IdentityUser> identityUsers = await pagination.GetListAsync<IdentityUser>(query, pageResult);
            return (identityUsers,total);
        }


        //public List<IdentityUser> GetUsers()
        //{

        //	return _dbContext.Users.ToList();
        //}
        //public List<IdentityUser> GetIdentityUsers()
        //{
        //	var IdentityUsers = _dbContext.Users
        //  .Include(u => u.IdentityUser)
        //  .ToList();

        //	return IdentityUsers.Select(u => new IdentityUser
        //	{
        //		IdentityUserId = u.IdentityUserId,
        //		Point = u.Point,
        //		FullName = u.FullName,
        //		Status = u.Status,
        //		//only BookingId
        //		IdentityUsers = u.IdentityUsers.Select(b => new Booking
        //		{
        //			BookingId = b.BookingId
        //		}).ToList(),
        //		//only ReviewId
        //		Reviews = u.Reviews.Select(r => new Review
        //		{
        //			ReviewId = r.ReviewId
        //		}).ToList()
        //	}).ToList();
        //}

        public IdentityUser GetUser(string id)
		{
			return _dbContext.Users.FirstOrDefault(m => m.Id.Equals(id));
		}

		public IdentityUser AddUser(IdentityUser IdentityUser)
		{
			_dbContext.Users.Add(IdentityUser);
			_dbContext.SaveChanges();
			return IdentityUser;
		}

        //public IdentityUser UpdateIdentityUser(string id, IdentityUser IdentityUser)
        //{
        //	IdentityUser oIdentityUser = GetIdentityUser(id);
        //	if (oIdentityUser != null)
        //	{
        //		oIdentityUser.Point = IdentityUser.Point;
        //		oIdentityUser.FullName = IdentityUser.FullName;
        //		oIdentityUser.Status = IdentityUser.Status;
        //		_dbContext.Update(oIdentityUser);
        //		_dbContext.SaveChanges();
        //	}
        //	return oIdentityUser;
        //}

        public void DeleteUser(string id)
        {
            IdentityUser oidentityuser = GetUser(id);
            if (oidentityuser != null)
            {
                oidentityuser.LockoutEnabled = false;
                _dbContext.Update(oidentityuser);
                _dbContext.SaveChanges();
            }
        }

        public IdentityUser BanUser(string id)
        {
            IdentityUser oUser = GetUser(id);
            if (oUser != null)
            {
                oUser.LockoutEnabled = false;
                _dbContext.Update(oUser);
                _dbContext.SaveChanges();
            }
            return oUser;
        }


        public IdentityUser UnBanUser(string id)
        {
            IdentityUser oUser = GetUser(id);
            if (oUser != null)
            {
                oUser.LockoutEnabled = true;
                _dbContext.Update(oUser);
                _dbContext.SaveChanges();
            }
            return oUser;
        }

        public List<IdentityUser> SearchUserByEmail(string searchValue) => _dbContext.Users.Where(m => m.Email.Contains(searchValue)).ToList();

        public IdentityUser GetUserByBookingId(string bookingId)
        {
            var userId = _dbContext.Bookings.FirstOrDefault(m => m.BookingId.Equals(bookingId)).Id;
            return _dbContext.Users.FirstOrDefault(m => m.Id.Equals(userId));
        }
    }
}
