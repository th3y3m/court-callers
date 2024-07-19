using DAOs.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace DAOs.Helper
{
    public class GeocodingService
    {
        private static readonly HttpClient client = new HttpClient();

        public static async Task<LocationModel> GetGeocodeAsync(string address)
        {
            var userAgent = "CourtCallers/1.0 (courtcallers@gmail.com)"; // Replace with your app name and contact info
            client.DefaultRequestHeaders.UserAgent.ParseAdd(userAgent);

            var url = $"https://nominatim.openstreetmap.org/search?q={Uri.EscapeDataString(address)}&format=json&addressdetails=1&limit=1";
            var response = await client.GetAsync(url);

            if (response.IsSuccessStatusCode)
            {
                var json = JArray.Parse(await response.Content.ReadAsStringAsync());

                if (json.Count > 0)
                {
                    var location = json[0];
                    double latitude = (double)location["lat"];
                    double longitude = (double)location["lon"];
                    LocationModel locationModel = new LocationModel
                    {
                        Latitude = latitude,
                        Longitude = longitude
                    };
                    return locationModel;
                }
                else
                {
                    throw new Exception("Unable to geocode address");
                }
            }
            else
            {
                throw new HttpRequestException($"Response status code does not indicate success: {(int)response.StatusCode} ({response.ReasonPhrase}).");
            }
        }
    }

}
