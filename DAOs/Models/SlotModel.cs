using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAOs.Models
{
    public class SlotModel
    {
        [StringLength(10)]
        public string? CourtId { get; set; } 
        
        [StringLength(10)]
        public string? BranchId { get; set; }

        public DateOnly SlotDate { get; set; }

        [Required]
        public TimeSlotModel TimeSlot { get; set; }
    }

    public class SlotCheckModel
    {
       
        [StringLength(10)]
        public string? BranchId { get; set; }
        public DateOnly SlotDate { get; set; }
        
        [Required]
        public TimeSlotModel TimeSlot { get; set; }
    }
    public class CourtAvailableCheckModel
    {
        [StringLength(10)]
        public string? CourtId { get; set; }
        [StringLength(10)]
        public string? BranchId { get; set; }
        public DateOnly SlotDate { get; set; }

        [Required]
        public TimeSlotModel TimeSlot { get; set; }
    }
}
