using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAOs.Models
{
    public class PriceModel
    {
        [StringLength(10)]
        public string BranchId { get; set; }

        [StringLength(50)]
        public string? Type { get; set; }

        public bool? IsWeekend { get; set; }

        [Required]
        public decimal SlotPrice { get; set; }
    }
}
