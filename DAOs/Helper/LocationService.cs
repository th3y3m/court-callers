using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAOs.Models;
using Newtonsoft.Json.Linq;

namespace DAOs.Helper
{
    public class LocationService
    {
        private const double EarthRadiusInKilometers = 6371.0;
        public static double CalculateDistance(LocationModel point1, LocationModel point2)
        {
            double lat1 = DegreesToRadians(point1.Latitude);
            double lon1 = DegreesToRadians(point1.Longitude);
            double lat2 = DegreesToRadians(point2.Latitude);
            double lon2 = DegreesToRadians(point2.Longitude);

            double latDiff = lat2 - lat1;
            double lonDiff = lon2 - lon1;

            double a = Math.Pow(Math.Sin(latDiff / 2), 2) +
                       Math.Cos(lat1) * Math.Cos(lat2) * Math.Pow(Math.Sin(lonDiff / 2), 2);

            double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return EarthRadiusInKilometers * c;
        }

        private static double DegreesToRadians(double degrees)
        {
            return degrees * Math.PI / 180.0;
        }

        private static readonly HttpClient client = new HttpClient();

        public static async Task<double> GetRouteDistanceAsync(LocationModel user, LocationModel destination)
        {
            var url = $"http://router.project-osrm.org/route/v1/driving/{user.Longitude},{user.Latitude};{destination.Longitude},{destination.Latitude}?overview=false";
            var response = await client.GetStringAsync(url);
            var json = JObject.Parse(response);

            if (json["routes"] != null && json["routes"].HasValues)
            {
                var distanceInMeters = json["routes"][0]["distance"];
                return (double)distanceInMeters / 1000; // Convert meters to kilometers
            }
            else
            {
                throw new Exception("Unable to get route distance");
            }
        }
    }
}
