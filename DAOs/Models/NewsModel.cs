using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAOs.Models
{
    public class NewsModel
    {
        [Required]
        [StringLength(255)]
        public string Title { get; set; }

        [Required]
        [StringLength(int.MaxValue)]
        public string Content { get; set; }

        [StringLength(int.MaxValue)]
        public string? Image { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; }

        [Required]
        public bool IsHomepageSlideshow { get; set; }
        public IFormFile? NewsImage { get; set; }
    }



}
