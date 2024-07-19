using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects
{
    public class Price
    {
        [Key]
        [StringLength(10)]
        public string PriceId { get; set; }

        [ForeignKey("Branch")]
        [StringLength(10)]
        public string BranchId { get; set; }

        [StringLength(50)]
        public string Type { get; set; }

        public bool? IsWeekend { get; set; }
        
        [Required]
        public decimal SlotPrice { get; set; }

        public virtual Branch? Branch { get; set; }

    }
}
