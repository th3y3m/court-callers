using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;


namespace BusinessObjects
{
	public class Court
	{
		[Key]
		[StringLength(10)]
		public string CourtId { get; set; }

		[ForeignKey("Branch")]
		[StringLength(10)]
		public string BranchId { get; set; }

		[StringLength(100)]
		public string CourtName { get; set; }
        
        [StringLength(450)]
		public string? CourtPicture { get; set; }

		[Required]
        [StringLength(100)]
        public string Status { get; set; }

		// Navigation properties
		public virtual Branch Branch { get; set; }

        [JsonIgnore]
        public virtual ICollection<TimeSlot> TimeSlots { get; set; }
	}
}
