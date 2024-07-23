using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAOs.Models
{
    public class DailyBookingResponse
    {
        public int TodayCount { get; set; }
        public double ChangePercentage { get; set; }
    }

}
