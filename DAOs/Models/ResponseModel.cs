using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace DAOs.Models
{
    public class ResponseModel
    {
        public string Status { get; set; }
        public string Message { get; set; }

        [IgnoreDataMember]
        [JsonIgnore]
        public System.Threading.Tasks.Task<String>? ConfirmEmailToken { get; set; }

        //public string? PaymentUrl { get; set; }
    }
}
