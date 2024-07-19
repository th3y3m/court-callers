using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAOs.Models
{
    public class UserDetailsModel
    {
        public decimal? Point { get; set; }

        public decimal? Balance { get; set; }


        [Required(ErrorMessage = "Full name is required")]
        [StringLength(50)]
        public string? FullName { get; set; }

        [StringLength(500)]
        public string? Address { get; set; }

        [StringLength(500)]
        public string? ProfilePicture { get; set; }

        public int? YearOfBirth { get; set; }

        
        
    }

    public class PutUserDetail
    {

        [Required(ErrorMessage = "Full name is required")]
        [StringLength(50)]
        public string FullName { get; set; }

        [StringLength(50)]
        public string UserName { get; set; }    

        [StringLength(500)]
        public string? Address { get; set; }

        [StringLength(500)]
        public string? ProfilePicture { get; set; }

        public int? YearOfBirth { get; set; }

        [StringLength(500)]
        public string? PhoneNumber { get; set; }

    }
}
