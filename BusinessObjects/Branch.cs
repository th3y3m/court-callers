using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Nodes;
using System.Threading.Tasks;

namespace BusinessObjects
{
	public class Branch
	{
		[Key]
		[StringLength(10)]
		public string BranchId { get; set; }

		[Required]
		[StringLength(255)]
		public string BranchAddress { get; set; }
        
        [Required]
		[StringLength(255)]
		public string BranchName { get; set; }
        
        [Required]
		[StringLength(15)]
		public string BranchPhone { get; set; }

		[StringLength(255)]
		public string Description { get; set; }

		[StringLength(int.MaxValue)]
		public string BranchPicture { get; set; }

		[Required]
		public TimeOnly OpenTime { get; set; }

		[Required]
		public TimeOnly CloseTime { get; set; }

		[Required]
		[StringLength(255)]
		public string OpenDay { get; set; }

		[Required]
        [StringLength(50)]
        public string Status { get; set; }

		// Navigation property
		public virtual ICollection<Court> Courts { get; set; }
        public virtual ICollection<Price> Prices { get; set; }
        public virtual ICollection<Review> Reviews { get; set; }
    }
}
