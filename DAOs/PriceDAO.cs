using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAOs.Models;
using BusinessObjects;
using DAOs.Helper;
using Microsoft.EntityFrameworkCore;

namespace DAOs
{
    public class PriceDAO
    {
        private readonly CourtCallerDbContext _dbContext = null;

        public PriceDAO()
        {
            if (_dbContext == null)
            {
                _dbContext = new CourtCallerDbContext();
            }
        }
        
        public PriceDAO(CourtCallerDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        
        public List<Price> GetPrices() => _dbContext.Prices.ToList();
        

        public Price GetPrice(string id)
        {
            return _dbContext.Prices.FirstOrDefault(m => m.PriceId.Equals(id));
        }
        public Price AddPrice(PriceModel priceModel)
        {
            Price price = new Price()
            {
                PriceId = "P" + DAOs.Helper.GenerateId.GenerateShortBookingId(), // "P00001
                BranchId = priceModel.BranchId,
                Type = priceModel.Type,
                IsWeekend = priceModel.IsWeekend,
                SlotPrice = priceModel.SlotPrice
            };
            _dbContext.Prices.Add(price);
            _dbContext.SaveChanges();
            return price;
        }
        public List<decimal> ShowPrice(string branchId)
        {
            var weekdayPricing = _dbContext.Prices.FirstOrDefault(p => p.BranchId == branchId && p.IsWeekend == false);
            var weekendPricing = _dbContext.Prices.FirstOrDefault(p => p.BranchId == branchId && p.IsWeekend == true);
            
            decimal weekdayPrice = weekdayPricing?.SlotPrice ?? 0;
            decimal weekendPrice = weekendPricing?.SlotPrice ?? 0;
            var hehe = new List<decimal>();
            hehe.Add(weekdayPrice);
            hehe.Add(weekendPrice);

            return hehe;
        }

       

        public Price UpdatePrice(string id, PriceModel price)
        {
            Price oPrice = GetPrice(id);
            if (oPrice != null)
            {
                oPrice.IsWeekend = price.IsWeekend;
                oPrice.SlotPrice = price.SlotPrice;
                _dbContext.Update(oPrice);
                _dbContext.SaveChanges();
            }
            return oPrice;
        }

        public void DeletePrice(string id)
        {
            Price oPrice = GetPrice(id);
            if (oPrice != null)
            {
                _dbContext.Remove(oPrice);
                _dbContext.SaveChanges();
            }
        }

        public List<Price> GetPriceByBranch(string branchId)
        {
            return _dbContext.Prices.Where(m => m.BranchId.Equals(branchId)).ToList();
        }

        public Price GetPriceByBranchAndWeekend(string branchId, bool isWeekend)
        {
            return _dbContext.Prices.FirstOrDefault(m => m.BranchId.Equals(branchId) && m.IsWeekend == isWeekend);
        }

        public async Task<List<Price>> SortPrice(string? sortBy, bool isAsc, PageResult pageResult)
        {
            IQueryable<Price> query = _dbContext.Prices;

            switch (sortBy?.ToLower())
            {
                case "priceid":
                    query = isAsc ? query.OrderBy(m => m.PriceId) : query.OrderByDescending(m => m.PriceId);
                    break;
                case "branchid":
                    query = isAsc ? query.OrderBy(m => m.BranchId) : query.OrderByDescending(m => m.BranchId);
                    break;
                case "slotprice":
                    query = isAsc ? query.OrderBy(m => m.SlotPrice) : query.OrderByDescending(m => m.SlotPrice);
                    break;
                case "isweekend":
                    query = isAsc ? query.OrderBy(m => m.IsWeekend) : query.OrderByDescending(m => m.IsWeekend);
                    break;
                default:
                    break;
            }

            Pagination pagination = new Pagination(_dbContext);
            List<Price> prices = await pagination.GetListAsync<Price>(query, pageResult);
            return prices;
        }

        public decimal GetSlotPriceOfBookingFlex(string branchId)
        {
            var price = _dbContext.Prices.FirstOrDefault(p => p.BranchId == branchId && p.Type == "Flex");
            return price?.SlotPrice ?? 0;
        }
        
        public decimal GetSlotPriceOfBookingFix(string branchId)
        {
            var price = _dbContext.Prices.FirstOrDefault(p => p.BranchId == branchId && p.Type == "Fix");
            return price?.SlotPrice ?? 0;
        }

        public decimal GetPriceByBranchAndType(string branchId, string type, bool? isWeekend)
        {
            if(type == "Flex")
            {
                return GetSlotPriceOfBookingFlex(branchId);
            }
            else if(type == "Fix")
            {
                return GetSlotPriceOfBookingFix(branchId);
            }
            else
            {
                return _dbContext.Prices.FirstOrDefault(p => p.BranchId == branchId && p.Type == "By day" && p.IsWeekend == isWeekend).SlotPrice;
            }
        }

        public Price UpdatePriceByPriceModel(PriceModel priceModel)
        {
            Price price = GetPrices().FirstOrDefault(p => p.BranchId == priceModel.BranchId && p.Type == priceModel.Type && p.IsWeekend == priceModel.IsWeekend);
            if (price != null)
            {
                price.SlotPrice = priceModel.SlotPrice;
                _dbContext.Update(price);
                _dbContext.SaveChanges();
            }
            return price;
        }
    }
}
