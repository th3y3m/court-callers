using DAOs;
using BusinessObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAOs.Helper;
using DAOs.Models;
using Microsoft.EntityFrameworkCore;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace DAOs
{
    public class BranchDAO
    {
        private readonly CourtCallerDbContext _courtCallerDbContext = null;

        public BranchDAO()
        {
            if (_courtCallerDbContext == null)
            {
                _courtCallerDbContext = new CourtCallerDbContext();
            }
        }

        public BranchDAO(CourtCallerDbContext context)
        {
            _courtCallerDbContext = context;
        }

        public List<Branch> GetBranches() => _courtCallerDbContext.Branches.ToList();



        public async Task<(List<Branch>,int total)> GetBranches(PageResult pageResult, string searchQuery = null)
        {
            var query = _courtCallerDbContext.Branches.AsQueryable();
            var total = await _courtCallerDbContext.Branches.CountAsync();

            if (!string.IsNullOrEmpty(searchQuery))
            {
                query = query.Where(branch => branch.BranchId.Contains(searchQuery) ||
                                              branch.BranchName.Contains(searchQuery) ||
                                              branch.BranchAddress.Contains(searchQuery) ||
                                              branch.BranchPhone.Contains(searchQuery) ||
                                              branch.Description.Contains(searchQuery) ||
                                              branch.Status.Contains(searchQuery));
            }

            Pagination pagination = new Pagination(_courtCallerDbContext);
            List<Branch> branches = await pagination.GetListAsync<Branch>(query, pageResult);
            return (branches,total);
        }

        public async Task<(List<Branch>,int total)> GetBranches(PageResult pageResult, string status = "Active", string searchQuery = null)
        {

            var query = 
                _courtCallerDbContext.Branches.Where(m => m.Status == status).AsQueryable();

            var total = await _courtCallerDbContext.Branches.CountAsync();

            if (!string.IsNullOrEmpty(searchQuery))
            {
                query = query.Where(branch => branch.BranchId.Contains(searchQuery) ||
                                              branch.BranchName.Contains(searchQuery) ||
                                              branch.BranchAddress.Contains(searchQuery) ||
                                              branch.BranchPhone.Contains(searchQuery) ||
                                              branch.Description.Contains(searchQuery) ||
                                              branch.Status.Contains(searchQuery));
            }

            Pagination pagination = new Pagination(_courtCallerDbContext);
            List<Branch> branches = await pagination.GetListAsync<Branch>(query, pageResult);
            return (branches,total);
        }



        public Branch GetBranch(string id)
        {
            return _courtCallerDbContext.Branches.FirstOrDefault(m => m.BranchId.Equals(id));
        }

        public Branch AddBranch(BranchModel branchModel)
        {
            Branch branch = new Branch()
            {
                BranchId = "B" + (_courtCallerDbContext.Branches.Count() + 1).ToString("D5"),
                BranchAddress = branchModel.BranchAddress,
                BranchName = branchModel.BranchName,
                BranchPhone = branchModel.BranchPhone,
                Description = branchModel.Description,
                BranchPicture = branchModel.BranchPicture,
                OpenTime = branchModel.OpenTime,
                CloseTime = branchModel.CloseTime,
                OpenDay = branchModel.OpenDay,
                Status = branchModel.Status
            };
            _courtCallerDbContext.Branches.Add(branch);
            _courtCallerDbContext.SaveChanges();
            return branch;
        }

        public Branch UpdateBranch(string id, PutBranch branchModel)
        {
            Branch oBranch = GetBranch(id);
            if (oBranch != null)
            {
                oBranch.BranchAddress = branchModel.BranchAddress;
                oBranch.Description = branchModel.Description;
                oBranch.BranchName = branchModel.BranchName;
                oBranch.BranchPhone = branchModel.BranchPhone;
                oBranch.BranchPicture = branchModel.BranchPicture;
                oBranch.OpenTime = branchModel.OpenTime;
                oBranch.CloseTime = branchModel.CloseTime;
                oBranch.OpenDay = branchModel.OpenDay;
                oBranch.Status = branchModel.Status;
                _courtCallerDbContext.Update(oBranch);
                _courtCallerDbContext.SaveChanges();
            }
            return oBranch;
        }


        public void DeleteBranch(string id)
        {
            Branch oBranch = GetBranch(id);
            if (oBranch != null)
            {
                oBranch.Status = "Inactive";
                _courtCallerDbContext.Update(oBranch);
                _courtCallerDbContext.SaveChanges();
            }
        }

        public List<Branch> GetBranchesByStatus(string status)
        {
            return _courtCallerDbContext.Branches.Where(m => m.Status == status).ToList();
        }

        public List<Branch> GetBranchesByCourtId(string courtId)
        {
            return _courtCallerDbContext.Branches.Where(m => m.Courts.Any(c => c.CourtId == courtId)).ToList();
        }

        public List<Branch> GetBranchByPrice(decimal minPrice, decimal maxPrice)
        {

            List<Branch> branches = _courtCallerDbContext.Branches.Where(m => m.Prices.Any(c =>
                c.SlotPrice >= minPrice && c.IsWeekend == false
            )).ToList();
            return branches.Where(m => m.Prices.Any(c =>
                c.SlotPrice <= maxPrice && c.IsWeekend == true
            )).ToList();
        }
        
        public async Task<(List<Branch>, int total)> GetBranchByPrice(decimal minPrice, decimal maxPrice, PageResult pageResult)
        {
            var query = _courtCallerDbContext.Branches.Where(m => m.Prices.Any(c =>
                c.SlotPrice >= minPrice && c.IsWeekend == false
            )).Where(m => m.Prices.Any(c =>
                c.SlotPrice <= maxPrice && c.IsWeekend == true
            )).AsQueryable();
            var total = await _courtCallerDbContext.Branches.CountAsync();

            Pagination pagination = new Pagination(_courtCallerDbContext);
            List<Branch> branches = await pagination.GetListAsync<Branch>(query, pageResult);
            return (branches, total);
        }

        public async Task<(List<Branch>, int total)> GetBranchByRating(int rating, PageResult pageResult)
        {
            var query = _courtCallerDbContext.Branches.Where(m => m.Reviews.Any(c =>
                c.Rating == rating
            )).AsQueryable();
            var total = await _courtCallerDbContext.Branches.CountAsync();

            Pagination pagination = new Pagination(_courtCallerDbContext);
            List<Branch> branches = await pagination.GetListAsync<Branch>(query, pageResult);
            return (branches, total);
        }

        public async Task<List<Branch>> SortBranch(string? sortBy, bool isAsc, PageResult pageResult)
        {
            IQueryable<Branch> query = _courtCallerDbContext.Branches;

            switch (sortBy?.ToLower())
            {
                case "branchid":
                    query = isAsc ? query.OrderBy(b => b.BranchId) : query.OrderByDescending(b => b.BranchId);
                    break;
                case "branchaddress":
                    query = isAsc ? query.OrderBy(b => b.BranchAddress) : query.OrderByDescending(b => b.BranchAddress);
                    break;
                case "branchname":
                    query = isAsc ? query.OrderBy(b => b.BranchName) : query.OrderByDescending(b => b.BranchName);
                    break;
                case "branchphone":
                    query = isAsc ? query.OrderBy(b => b.BranchPhone) : query.OrderByDescending(b => b.BranchPhone);
                    break;
                case "branchpicture":
                    query = isAsc ? query.OrderBy(b => b.BranchPicture) : query.OrderByDescending(b => b.BranchPicture);
                    break;
                case "status":
                    query = isAsc ? query.OrderBy(b => b.Status) : query.OrderByDescending(b => b.Status);
                    break;
                case "closetime":
                    query = isAsc ? query.OrderBy(b => b.CloseTime) : query.OrderByDescending(b => b.CloseTime);
                    break;                
                case "opentime":
                    query = isAsc ? query.OrderBy(b => b.OpenTime) : query.OrderByDescending(b => b.OpenTime);
                    break;                
                case "openday":
                    query = isAsc ? query.OrderBy(b => b.OpenDay) : query.OrderByDescending(b => b.OpenDay);
                    break;                
                case "description":
                    query = isAsc ? query.OrderBy(b => b.Description) : query.OrderByDescending(b => b.Description);
                    break;
                default:
                    break;
            }
            Pagination pagination = new Pagination(_courtCallerDbContext);
            List<Branch> branches = await pagination.GetListAsync<Branch>(query, pageResult);
            return branches;
        }

        public async Task<(List<BranchDistance>, int total)> SortBranchByDistance(LocationModel user, PageResult pageResult)
        {
            // Ensure GetBranches is awaited and correctly fetches branches asynchronously
            var branches = GetBranches(); // Assuming GetBranchesAsync is the correct async method

            var branchDistances = new List<BranchDistance>();

            foreach (var branch in branches.Where(b => b.Status == "Active"))
            {
                var branchLocation = await GeocodingService.GetGeocodeAsync(branch.BranchAddress);
                var distance = await LocationService.GetRouteDistanceAsync(user, branchLocation);
                branchDistances.Add(new BranchDistance { Branch = branch, Distance = distance });
            }

            // Sort the list by distance
            var sortedBranchDistances = branchDistances.OrderBy(bd => bd.Distance).ToList();

            // Manually paginate the sorted list
            var paginatedBranchDistances = sortedBranchDistances
                .Skip((pageResult.PageNumber - 1) * pageResult.PageSize)
                .Take(pageResult.PageSize)
                .ToList();

            // The total count of branches before pagination
            var total = branchDistances.Count;

            return (paginatedBranchDistances, total);
        }

    }
}
