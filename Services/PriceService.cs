using DAOs.Models;
using BusinessObjects;
using Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAOs;
using DAOs.Helper;

namespace Services
{
    public class PriceService
    {
        private readonly PriceRepository _priceRepository = null;
       
        public PriceService()
        {
            if (_priceRepository == null)
            {
                _priceRepository = new PriceRepository();
            }
           
        }
        public Price AddPrice(PriceModel priceModel) => _priceRepository.AddPrice(priceModel);
        public List<decimal> ShowPrice(bool isVip,string branchId)
        {

            var price = _priceRepository.ShowPrice(branchId);
            
            if (isVip)
            {
                for (int i = 0; i < price.Count; i++)
                {
                    price[i] *= 0.8m;
                }
                
            }
            return price;
        }
        public void DeletePrice(string id) => _priceRepository.DeletePrice(id);
        public Price GetPrice(string id) => _priceRepository.GetPrice(id);
        public Price UpdatePrice(string id, PriceModel price) => _priceRepository.UpdatePrice(id, price);
        public List<Price> GetPriceByBranch(string branchId) => _priceRepository.GetPriceByBranch(branchId);

        public async Task<List<Price>> SortPrice(string? sortBy, bool isAsc, PageResult pageResult) => await _priceRepository.SortPrice(sortBy, isAsc, pageResult);

        public decimal GetPriceByBranchAndType(string branchId, string type, bool? isWeekend) => _priceRepository.GetPriceByBranchAndType(branchId, type, isWeekend);

        public Price UpdatePriceByPriceModel(PriceModel priceModel) => _priceRepository.UpdatePriceByPriceModel(priceModel);
    }
}
