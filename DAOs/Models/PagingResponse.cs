using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAOs.Models
{
    public class PagingResponse<T>
    {
        public IEnumerable<T> Data { get; set; }
        public int Total { get; set; }
    }
}
