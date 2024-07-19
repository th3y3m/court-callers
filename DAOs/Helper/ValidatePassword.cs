using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAOs.Helper
{
    public class ValidatePassword
    {
        public static bool ValidatePass(string password)
        {
            if (password.Length < 7)
                return false;

            bool hasUpperCase = false;
            bool hasNumber = false;

            foreach (char c in password)
            {
                if (char.IsUpper(c))
                    hasUpperCase = true;
                if (char.IsDigit(c))
                    hasNumber = true;

                if (hasUpperCase && hasNumber)
                    return true;
            }

            return false;
        }
    }
}
