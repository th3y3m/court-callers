using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace BusinessObjects
{
	public class UserDetail
	{
		[Key]
        [ForeignKey("User")]
        [StringLength(450)]
        public string UserId { get; set; }

		public decimal Balance { get; set; }

		public decimal? Point { get; set; }

		[StringLength(50)]
		public string? FullName { get; set; }
        
        [StringLength(500)]
		public string? Address { get; set; }
        
        [StringLength(500)]
		public string? ProfilePicture { get; set; }

		public int? YearOfBirth { get; set; }

		public bool? IsVip { get; set; }

		// Navigation property
		public virtual IdentityUser User { get; set; }
	}
}
