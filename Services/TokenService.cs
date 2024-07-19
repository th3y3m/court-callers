using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

using Services.Interface;

namespace Services
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;
        private readonly RoleManager<IdentityRole> _roleManager;

        public TokenService(IConfiguration configuration, RoleManager<IdentityRole> roleManager)
        {
            _configuration = configuration;
            _roleManager = roleManager;
        }

        //public async Task<string> GenerateJwtToken(IEnumerable<string> userRoles)
        //{
        //    var authClaims = new List<Claim>();

        //    foreach (var userRole in userRoles)
        //    {
        //        authClaims.Add(new Claim(ClaimTypes.Role, userRole));
        //        var role = await _roleManager.FindByNameAsync(userRole);
        //        if (role != null)
        //        {
        //            var roleClaims = await _roleManager.GetClaimsAsync(role);
        //            foreach (Claim roleClaim in roleClaims)
        //            {
        //                authClaims.Add(roleClaim);
        //            }
        //        }
        //    }

        //    var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]));

        //    var token = new JwtSecurityToken(
        //        issuer: _configuration["JWT:ValidIssuer"],
        //        audience: _configuration["JWT:ValidAudience"],
        //        expires: DateTime.Now.AddHours(3),
        //        claims: authClaims,
        //        signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
        //    );

        //    return new JwtSecurityTokenHandler().WriteToken(token);
        //}

        public string GenerateToken(IdentityUser user, string role)
        {
            var jwtTokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["JWT:Secret"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("Id", user.Id),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, role),
                    //new Claim(ClaimTypes.NameIdentifier, user.UserName)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = jwtTokenHandler.CreateToken(tokenDescriptor);
            return jwtTokenHandler.WriteToken(token);
        }
    }


    public class TokenSettings
    {
        public string SecretKey { get; set; }
    }

    public class TokenForPayment
    {
        private readonly string _secretKey;

        public TokenForPayment(IOptions<TokenSettings> tokenSettings)
        {
            _secretKey = tokenSettings.Value.SecretKey;
        }

        public string GenerateToken(string bookingId)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_secretKey);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                new Claim("BookingId", bookingId)
                }),
                Expires = DateTime.UtcNow.AddMinutes(10), 
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public string ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_secretKey);
            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            var jwtToken = (JwtSecurityToken)validatedToken;
            var bookingId = jwtToken.Claims.First(x => x.Type == "BookingId").Value;

            return bookingId;
        }
    }
}
