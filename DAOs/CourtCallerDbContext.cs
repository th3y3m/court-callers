using BusinessObjects;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace DAOs
{
	public class CourtCallerDbContext : IdentityDbContext
	{
		public CourtCallerDbContext(DbContextOptions<CourtCallerDbContext> options)
			: base(options)
		{
		}
		public CourtCallerDbContext()
		{
		}

		protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
		{

			var builder = new ConfigurationBuilder()
				.SetBasePath(Directory.GetCurrentDirectory())
				.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);

			IConfigurationRoot configurationRoot = builder.Build();
			optionsBuilder.UseSqlServer(configurationRoot.GetConnectionString("CourtCallerDb"));

		}

		public virtual DbSet<Review> Reviews { get; set; }
		public virtual DbSet<UserDetail> UserDetails { get; set; }
		public virtual DbSet<Branch> Branches { get; set; }
		public virtual DbSet<Court> Courts { get; set; }
		public virtual DbSet<TimeSlot> TimeSlots { get; set; }
		public virtual DbSet<Booking> Bookings { get; set; }
		public virtual DbSet<Payment> Payments { get; set; }
        public virtual DbSet<Price> Prices { get; set; }
        public virtual DbSet<News> News { get; set; }
        public virtual DbSet<RegistrationRequest> RegistrationRequests { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
            base.OnModelCreating(modelBuilder);
            // Seed roles
            modelBuilder.Entity<IdentityRole>().HasData(
				new IdentityRole
				{
					Id = "R001",
					Name = "Admin",
					NormalizedName = "ADMIN",
					ConcurrencyStamp = Guid.NewGuid().ToString()
				},
				new IdentityRole
				{
					Id = "R002",
					Name = "Staff",
					NormalizedName = "STAFF",
					ConcurrencyStamp = Guid.NewGuid().ToString()
				},
				new IdentityRole
				{
					Id = "R003",
					Name = "Customer",
					NormalizedName = "CUSTOMER",
					ConcurrencyStamp = Guid.NewGuid().ToString()
				}
			);
		}
	}
}
