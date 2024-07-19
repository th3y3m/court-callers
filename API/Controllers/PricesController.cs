using BusinessObjects;
using DAOs.Helper;
using DAOs.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace API.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class PricesController : ControllerBase
    {
        private readonly PriceService _priceService;

        public PricesController()
        {
            _priceService = new PriceService();
        }

        //public decimal GetPriceByBranchAndType(string branchId, string type, bool? isWeekend) create api for this
        [HttpGet("branchId/{branchId}/type/{type}")]
        public IActionResult GetPriceByBranchAndType(string branchId, string type, bool? isWeekend)
        {
            var price = _priceService.GetPriceByBranchAndType(branchId, type, isWeekend);
            return Ok(price);
        }


        [HttpGet("branchId/{branchId}")]
        public ActionResult<IEnumerable<Price>> GetPrices(string branchId)
        {
            return _priceService.GetPriceByBranch(branchId).ToList();
        }

        // GET: api/Prices/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Price>> GetPrice(string id)
        {
            var Price = _priceService.GetPrice(id);

            if (Price == null)
            {
                return NotFound();
            }

            return Price;
        }
        [HttpPost("PostPrice")]
        public async Task<ActionResult<Price>> PostPrice(PriceModel price)
        {

            var Price = _priceService.AddPrice(price);

            return CreatedAtAction("GetPrice", new { id = Price.PriceId }, Price);
        }
        // PUT: api/Prices/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("UpdatePrice")]
        public async Task<IActionResult> PutPrice(PriceModel priceModel)
        {


            var Price = _priceService.UpdatePriceByPriceModel(priceModel);

            return CreatedAtAction("GetPrice", new { id = Price.PriceId }, Price);
        }

        // POST: api/Prices
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("showprice")]
        public IActionResult GetPricesForWeek(bool isVip,string branchId)
        {
            var price = _priceService.ShowPrice(isVip,branchId);
            var weekdayPrice = price[0];
            var weekendPrice = price[1];
            return Ok(new
            {
                WeekdayPrice = weekdayPrice,
                WeekendPrice = weekendPrice
            });
        }

        // DELETE: api/Prices/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePrice(string id)
        {
            var Price = _priceService.GetPrice(id);
            if (Price == null)
            {
                return NotFound();
            }

            _priceService.DeletePrice(id);

            return NoContent();
        }



        [HttpGet("sortPrice/{sortBy}")]
        public async Task<ActionResult<IEnumerable<Price>>> SortPrice(string sortBy, bool isAsc, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var pageResult = new PageResult
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            return await _priceService.SortPrice(sortBy, isAsc, pageResult);
        }
    }

}
