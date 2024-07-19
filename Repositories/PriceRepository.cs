using DAOs.Models;
using BusinessObjects;
using DAOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAOs.Helper;

namespace Repositories
{
    public class PriceRepository
    {
        private readonly PriceDAO _priceDao = null;
        public PriceRepository()
        {
            if (_priceDao == null)
            {
                _priceDao = new PriceDAO();
            }
        }
        public List<decimal> ShowPrice(string branchId) => _priceDao.ShowPrice(branchId);
        public Price AddPrice(PriceModel priceModel) => _priceDao.AddPrice(priceModel);
        public void DeletePrice(string id) => _priceDao.DeletePrice(id);

        public Price GetPrice(string id) => _priceDao.GetPrice(id);

        public Price UpdatePrice(string id, PriceModel price) => _priceDao.UpdatePrice(id, price);

        public List<Price> GetPriceByBranch(string branchId) => _priceDao.GetPriceByBranch(branchId);

        public async Task<List<Price>> SortPrice(string? sortBy, bool isAsc, PageResult pageResult) => await _priceDao.SortPrice(sortBy, isAsc, pageResult);

        public decimal GetPriceByBranchAndType(string branchId, string type, bool? isWeekend) => _priceDao.GetPriceByBranchAndType(branchId, type, isWeekend);

        public Price UpdatePriceByPriceModel(PriceModel priceModel) => _priceDao.UpdatePriceByPriceModel(priceModel);
    }
}
