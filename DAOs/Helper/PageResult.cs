using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAOs.Helper
{
    public class PageResult
    {
       // const int MaxPageSize = 20;
        public int PageNumber { get; set; } = 1;
        private int _pageSize = 10;
        public int PageSize
        {
            get
            {
                return _pageSize;
            }
            set
            {
                _pageSize = value;
            }
        }

    }

    public class Pagination
    {
        private readonly DbContext _dbContext;

        public Pagination(DbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<T>> GetListAsync<T>(IQueryable<T> query,PageResult pageResult) where T : class
        {
            int skip = (pageResult.PageNumber - 1) * pageResult.PageSize;

            return await query
                                  .Skip(skip)
                                  .Take(pageResult.PageSize)
                                  .ToListAsync();
        }
    }
}
