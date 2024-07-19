using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAOs.Models
{
    public class TimeSlotModel
    {
        public DateOnly? SlotDate { get; set; }
        [Required]
        public TimeOnly SlotStartTime { get; set; }

        [Required]
        public TimeOnly SlotEndTime { get; set; }
    }
}
