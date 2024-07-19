using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAOs.Helper
{
    public class GenerateId
    {
        public static string GenerateShortBookingId()
        {
            Guid guid = Guid.NewGuid();
            string base64Guid = Convert.ToBase64String(guid.ToByteArray());

            // Replace URL-unsafe characters and remove padding characters
            base64Guid = base64Guid.Replace("/", "_").Replace("+", "-").Substring(0, 9);

            return base64Guid;
        }
    }
}
