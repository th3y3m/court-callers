using Hangfire;
using System.Text;
using DAOs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Repositories;
using Repositories.Helper;
using Services;
using Services.Interface;
using API.Helper;
using Services.SignalRHub;
using Microsoft.Extensions.Logging;
using System.Text.Json.Serialization;
using Services.MLModels;



namespace API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            ConfigurationManager configuration = builder.Configuration;

            // Configure DbContext
            builder.Services.AddDbContext<CourtCallerDbContext>(options =>
            {
                var connectionString = configuration.GetConnectionString("CourtCallerDb");
                options.UseSqlServer(connectionString);
            });

            // Configure Azure SignalR
            builder.Services.AddSignalR()
                .AddAzureSignalR(configuration.GetConnectionString("AzureSignalRConnectionString"));

            builder.Services.AddLogging(logging =>
            {
                logging.ClearProviders();
                logging.AddConsole();
                logging.AddDebug();
            });

            // Configure Identity
            builder.Services.AddIdentity<IdentityUser, IdentityRole>()
                .AddEntityFrameworkStores<CourtCallerDbContext>()
                .AddDefaultTokenProviders();
            builder.Services.Configure<DataProtectionTokenProviderOptions>(options =>
      options.TokenLifespan = TimeSpan.FromHours(24));


            // Configure Hangfire
            builder.Services.AddHangfire(config =>
                config.UseSqlServerStorage(configuration.GetConnectionString("CourtCallerDb")));
            builder.Services.AddHangfireServer();

            //add Model Training
            builder.Services.AddScoped<ModelTrainer>(sp => new ModelTrainer(
        @"C:\FPTUNI\5\SWP391_Project\API\data\booking_data.csv",
        @"C:\FPTUNI\5\SWP391_Project\API\data\Model.zip"
    ));
  
            builder.Services.AddScoped<ModelTrainingService>();

            //// Add services to the container
            //builder.Services.AddControllers().AddJsonOptions(options =>
            //{
            //    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
            //    options.JsonSerializerOptions.WriteIndented = true;
            //});

            // Add services to the container
            builder.Services.AddControllers();

            // Configure JWT authentication
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.SaveToken = true;
                options.RequireHttpsMetadata = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JWT:Secret"]))
                };
            });

            builder.Services.AddEndpointsApiExplorer();

            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });

                // Define security scheme for JWT
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "Please enter a valid token",
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] { }
                    }
                });
            });

            builder.Services.AddScoped<ITokenService, TokenService>();
            builder.Services.AddScoped<PriceDAO>();
            builder.Services.AddScoped<PriceService>();
            builder.Services.Configure<TokenSettings>(configuration.GetSection("TokenSettings"));
            builder.Services.AddScoped<TimeSlotRepository>();
            builder.Services.AddScoped<TimeSlotService>();
            builder.Services.AddScoped<PaymentService>();
            builder.Services.AddScoped<TokenForPayment>();
            builder.Services.AddScoped<BookingRepository>();
            builder.Services.AddScoped<PaymentRepository>();
            builder.Services.AddScoped<TimeslotCleanupManager>();
            builder.Services.AddScoped<TrainingService>();
            builder.Services.AddScoped<IBookingService , BookingService>();
            // VNPay Service
            builder.Services.AddScoped<VnpayService>();

            // Email Service
            builder.Services.AddTransient<IMailService, MailService>();
            builder.Services.Configure<MailSettings>(configuration.GetSection("MailSettings"));

            // CORS for React application
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowSpecificOrigin",
                    policy =>
                    {
                        policy.WithOrigins("https://localhost:3000", "https://courtcaller.azurewebsites.net", "https://localhost:7104", "https://court-caller-deploy-git-master-lethanhnhan91s-projects.vercel.app", "https://react-admin-lilac.vercel.app", "https://court-caller-deploy.vercel.app")
                              .AllowAnyHeader()
                              .AllowAnyMethod()
                              .AllowCredentials();
                    });
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline
            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();
            app.UseCors("AllowSpecificOrigin");
            app.UseAuthentication();

           

            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1");
            });

            app.UseRouting();
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHub<TimeSlotHub>("/timeslothub");
                endpoints.MapControllers();
            });

            app.UseHangfireDashboard();

            // Sử dụng DI container để tạo TimeslotCleanupManager cho Hangfire
            RecurringJob.AddOrUpdate<TimeslotCleanupManager>(
                manager => manager.CleanupPendingTimeslots(),
                Cron.Minutely);

            app.Run();
        }
    }


}







//using System.Text;
//using DAOs;
//using Microsoft.AspNetCore.Authentication.JwtBearer;
//using Microsoft.AspNetCore.Identity;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.IdentityModel.Tokens;
//using Microsoft.OpenApi.Models;
//using Repositories;
//using Repositories.Helper;
//using Services;
//using Services.Interface;


//namespace API
//{
//    public class Program
//    {
//        public static void Main(string[] args)
//        {
//            var builder = WebApplication.CreateBuilder(args);

//            ConfigurationManager configuration = builder.Configuration;

//            // Configure DbContext
//            builder.Services.AddDbContext<DbContext>(options =>
//            {
//                options.UseSqlServer(configuration.GetConnectionString("CourtCallerDb"));
//            });

//            // Configure SignalR
//            builder.Services.AddSignalR();

//            // Configure Identity
//            builder.Services.AddIdentity<IdentityUser, IdentityRole>()
//                .AddEntityFrameworkStores<DbContext>()
//                .AddDefaultTokenProviders();

//            // Add services to the container
//            builder.Services.AddControllers();

//            // Configure JWT authentication
//            builder.Services.AddAuthentication(options =>
//            {
//                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
//                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
//                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
//            }).AddJwtBearer(options =>
//            {
//                options.SaveToken = true;
//                options.RequireHttpsMetadata = false;
//                options.TokenValidationParameters = new TokenValidationParameters
//                {
//                    ValidateIssuer = false,
//                    ValidateAudience = false,
//                    ValidateLifetime = true,
//                    ValidateIssuerSigningKey = true,
//                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JWT:Secret"]))
//                };
//            });

//            builder.Services.AddEndpointsApiExplorer();

//            builder.Services.AddSwaggerGen(c =>
//            {
//                c.SwaggerDoc("v1", new OpenApiInfo { Title = "API", Version = "v1" });
//                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
//                {
//                    Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
//                    In = ParameterLocation.Header,
//                    Type = SecuritySchemeType.ApiKey,
//                    Scheme = "Bearer"
//                });

//                c.AddSecurityRequirement(new OpenApiSecurityRequirement
//                {
//                    {
//                        new OpenApiSecurityScheme
//                        {
//                            Reference = new OpenApiReference
//                            {
//                                Type = ReferenceType.SecurityScheme,
//                                Id = "Bearer"
//                            }
//                        },
//                        new string[] {}
//                    }
//                });
//            });

//            builder.Services.AddScoped<ITokenService, TokenService>();

//            builder.Services.AddScoped<PriceDAO>();
//            builder.Services.AddScoped<PriceService>();
//            builder.Services.Configure<TokenSettings>(configuration.GetSection("TokenSettings"));
//            builder.Services.AddScoped<TimeSlotService>();
//            builder.Services.AddScoped<PaymentService>();
//            builder.Services.AddScoped<TokenForPayment>();
//            builder.Services.AddScoped<BookingRepository>();
//            builder.Services.AddScoped<PaymentRepository>();

//            // VNPay Service
//            builder.Services.AddScoped<VnpayService>();

//            // Email Service
//            builder.Services.AddTransient<IMailService, MailService>();
//            builder.Services.Configure<MailSettings>(configuration.GetSection("MailSettings"));

//            // CORS for React application
//            builder.Services.AddCors(options =>
//            {
//                options.AddPolicy("AllowAnyOrigin",
//                    policy =>
//                    {
//                        policy.AllowAnyOrigin()
//                              .AllowAnyHeader()
//                              .AllowAnyMethod();
//                    });
//            });

//            var app = builder.Build();

//            // Configure the HTTP request pipeline
//            if (app.Environment.IsDevelopment())
//            {
//                app.UseDeveloperExceptionPage();
//            }

//            app.UseHttpsRedirection();

//            app.UseAuthentication();
//            app.UseAuthorization();

//            app.UseCors("AllowAnyOrigin");

//            app.UseSwagger();
//            app.UseSwaggerUI(c =>
//            {
//                c.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1");
//            });

//            app.UseRouting();

//            app.UseEndpoints(endpoints =>
//            {
//                endpoints.MapControllers();
//                endpoints.MapHub<Services.SignalRHub.TimeSlotHub>("/timeslotHub");
//            });

//            app.Run();
//        }
//    }
//}
