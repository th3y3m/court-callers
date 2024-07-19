using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAOs.Models
{
    public class BookingResponse
    {
        public string BookingId { get; set; }
        public DateTime BookingDate { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class WeeklyBookingResponse
    {
        public string DayOfWeek { get; set; }
        public decimal TotalPrice { get; set; }
    }

}
