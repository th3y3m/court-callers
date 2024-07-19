using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects
{
	public class Payment
	{
		[Key]
		[StringLength(10)]
		public string PaymentId { get; set; }

		[ForeignKey("Booking")]
		[StringLength(10)]
		public string BookingId { get; set; }

        [Required]
        public decimal PaymentAmount { get; set; }

        [Required]
		public DateTime PaymentDate { get; set; }

		[StringLength(500)]
		public string PaymentMessage { get; set; }

		[StringLength(50)]
        [Required]
        public string PaymentStatus { get; set; }

		[StringLength(50)]
		public string? PaymentSignature { get; set; }

		// Navigation property
		public virtual Booking Booking { get; set; }
	}
}
