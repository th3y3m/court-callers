using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Repositories.Helper;

namespace Services.Interface
{
    public interface IMailService
    { 
        public Task SendEmailAsync(MailRequest mailRequest);

    }
}
