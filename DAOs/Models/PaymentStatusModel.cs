using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAOs.Models
{

    public class PaymentStatusModel
    {
        public bool IsSuccessful { get; set; }
        public string RedirectUrl { get; set; }
    }
}
