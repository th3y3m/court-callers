using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAOs.Models
{
    public class ExternalLoginModel
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid Email Address")]
        public string Email { get; set; }
        public string Name { get; set; }
        public string Provider { get; set; }
        public string ProviderKey { get; set; }
        // Other properties as needed...
    }
}
