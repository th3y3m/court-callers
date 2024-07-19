using DAOs.Models;
using DAOs.Helper;
using Microsoft.AspNetCore.Mvc;
using static QRCoder.PayloadGenerator;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LocationController : ControllerBase
    {

        [HttpPost]
        public IActionResult Post([FromBody] LocationModel location)
        {
            return Ok(new { message = "Location received successfully", location });
        }


        [HttpPost("get-geolocation")]
        public async Task<IActionResult> GetGeolocation([FromBody] string addressModel)
        {
            try
            {
                var geolocation = await GeocodingService.GetGeocodeAsync(addressModel);
                return Ok(geolocation);

            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        
        [HttpPost("pathdistance")]
        public async Task<IActionResult> GetRouteDistanceAsync(LocationModel user)
        {
            try
            {
                var s = await LocationService.GetRouteDistanceAsync(user, new LocationModel
                {
                    Latitude = 10.875323976132528,
                    Longitude = 106.80076631184579
                });

                return Ok(s);

            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


    }
}
