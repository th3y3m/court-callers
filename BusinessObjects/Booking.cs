using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace BusinessObjects
{
	public class Booking
	{
		[Key]
		[StringLength(10)]
		public string BookingId { get; set; }

		[ForeignKey("User")]
		[StringLength(450)]
		public string Id { get; set; }

		[StringLength(10)]
		[ForeignKey("Branch")]
		public string? BranchId { get; set; }

		[Required]
		public DateTime BookingDate { get; set; }

        [Required]
        [StringLength(50)]
        public string BookingType { get; set; }

        [Required]
        public int NumberOfSlot { get; set; }

        [Required]
		public string Status { get; set; }

		[Required]
		public decimal TotalPrice { get; set; }

		// Navigation properties
		public virtual IdentityUser User { get; set; }
		public virtual Branch Branch { get; set; }
		public virtual ICollection<TimeSlot> TimeSlots { get; set; }
        public virtual ICollection<Payment> Payments { get; set; }
	}


    

}
