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
	public class Review
	{
		[Key]
		[StringLength(10)]
		public string ReviewId { get; set; }

		[StringLength(255)]
		public string ReviewText { get; set; }

        [Required]
        public DateTime? ReviewDate { get; set; }

        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
        public int? Rating { get; set; }

		[ForeignKey("User")]
		[StringLength(450)]
		public string Id { get; set; }

		[ForeignKey("Branch")]
		[StringLength(10)]
		public string BranchId { get; set; }

		// Navigation properties
		public virtual IdentityUser User { get; set; }
		public virtual Branch Branch { get; set; }
	}
}
