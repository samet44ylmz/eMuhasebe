﻿using eMuhasebeServer.Domain.Entities;
using eMuhasebeServer.Domain.Enums;
using GenericRepository;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace eMuhasebeServer.Infrastructure.Context
{
    internal sealed class ApplicationDbContext : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>, IUnitOfWork
    {
        public ApplicationDbContext(DbContextOptions options) : base(options)
        {
        }


        public DbSet<CashRegister> CashRegisters { get; set; }
        public DbSet<CashRegisterDetail> CashRegisterDetails { get; set; }
        public DbSet<Bank> Banks { get; set; }
        public DbSet<BankDetail> BankDetails { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<CustomerDetail> CustomerDetails { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductDetail> ProductDetails { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceDetail> InvoiceDetails { get; set; }
        public DbSet<EmployeeDetails> Employees { get; set; }
        public DbSet<EmployeeDetail> EmployeeDetails { get; set; }
        public DbSet<Gider> Giderler { get; set; }
        public DbSet<SalaryPayment> SalaryPayments { get; set; }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.ApplyConfigurationsFromAssembly(typeof(DependencyInjection).Assembly);

            builder.Ignore<IdentityUserLogin<Guid>>();
            builder.Ignore<IdentityRoleClaim<Guid>>();
            builder.Ignore<IdentityUserToken<Guid>>();
            builder.Ignore<IdentityUserRole<Guid>>();
            builder.Ignore<IdentityUserClaim<Guid>>();

            #region CashRegister
            builder.Entity<CashRegister>().Property(p => p.DepositAmount).HasColumnType("money");
            builder.Entity<CashRegister>().Property(p => p.WithdrawalAmount).HasColumnType("money");

            builder.Entity<CashRegister>()
                .Property(p => p.CurrencyType)
                .HasConversion(type => type.Value, value => CurrencyTypeEnum.FromValue(value));

            builder.Entity<CashRegister>().HasQueryFilter(filter => !filter.IsDeleted);
            builder.Entity<CashRegister>()
               .HasMany(p => p.Details)
               .WithOne()
               .HasForeignKey(p => p.CashRegisterId);
            #endregion

            #region CashRegisterDetail
            builder.Entity<CashRegisterDetail>().Property(p => p.DepositAmount).HasColumnType("money");
            builder.Entity<CashRegisterDetail>().Property(p => p.WithdrawalAmount).HasColumnType("money");
            #endregion

            #region Bank
            builder.Entity<Bank>().Property(p => p.DepositAmount).HasColumnType("money");
            builder.Entity<Bank>().Property(p => p.WithdrawalAmount).HasColumnType("money");

            builder.Entity<Bank>()
                .Property(p => p.CurrencyType)
                .HasConversion(type => type.Value, value => CurrencyTypeEnum.FromValue(value));
            builder.Entity<Bank>().HasQueryFilter(filter => !filter.IsDeleted);
            builder.Entity<Bank>()
                .HasMany(p => p.Details)
                .WithOne()
                .HasForeignKey(p => p.BankId);
            #endregion

            #region BankDetail
            builder.Entity<BankDetail>().Property(p => p.DepositAmount).HasColumnType("money");
            builder.Entity<BankDetail>().Property(p => p.WithdrawalAmount).HasColumnType("money");
            #endregion

            #region Customer
            builder.Entity<Customer>().Property(p => p.DepositAmount).HasColumnType("money");
            builder.Entity<Customer>().Property(p => p.WithdrawalAmount).HasColumnType("money");
            builder.Entity<Customer>().HasQueryFilter(filter => !filter.IsDeleted);
            #endregion

            #region Customer Details
            builder.Entity<CustomerDetail>().Property(p => p.DepositAmount).HasColumnType("money");
            builder.Entity<CustomerDetail>().Property(p => p.WithdrawalAmount).HasColumnType("money");
            builder.Entity<CustomerDetail>().Property(p => p.Type)
              .HasConversion(type => type.Value, value => CustomerDetailTypeEnum.FromValue(value));
            #endregion

            #region Product
            builder.Entity<Product>().HasQueryFilter(filter => !filter.IsDeleted);
            builder.Entity<Product>().Property(p => p.Deposit).HasColumnType("decimal(7,2)");
            builder.Entity<Product>().Property(p => p.Withdrawal).HasColumnType("decimal(7,2)");
            #endregion

            #region ProductDetails
            builder.Entity<ProductDetail>().Property(p => p.Deposit).HasColumnType("decimal(7,2)");
            builder.Entity<ProductDetail>().Property(p => p.Withdrawal).HasColumnType("decimal(7,2)");
            builder.Entity<ProductDetail>().Property(p => p.Price).HasColumnType("money");
            #endregion

            #region Invoice
            builder.Entity<Invoice>().Property(p => p.Amount).HasColumnType("money");
            builder.Entity<Invoice>().Property(p => p.PaidAmount).HasColumnType("money");
            builder.Entity<Invoice>().Property(p => p.Type)
                .HasConversion(type => type.Value, value => InvoiceTypeEnum.FromValue(value));
            builder.Entity<Invoice>().HasQueryFilter(filter => !filter.IsDeleted);
            builder.Entity<Invoice>().HasQueryFilter(filter => !filter.Customer!.IsDeleted);
            #endregion

            #region InvoiceDetail
            builder.Entity<InvoiceDetail>().Property(p => p.Quantity).HasColumnType("decimal(7,2)");
            builder.Entity<InvoiceDetail>().Property(p => p.Price).HasColumnType("money");
            builder.Entity<InvoiceDetail>().HasQueryFilter(filter => !filter.Product!.IsDeleted);
            #endregion

            #region Employee
            builder.Entity<EmployeeDetails>().Property(p => p.Salary).HasColumnType("decimal(18,2)");
            builder.Entity<EmployeeDetails>().HasQueryFilter(filter => !filter.IsDeleted);
            #endregion

            #region EmployeeDetails
            builder.Entity<EmployeeDetail>(builder =>
            {
                builder.Property(p => p.Salary)
                       .HasPrecision(18, 2);
            });
            builder.Entity<EmployeeDetail>().HasQueryFilter(filter => !filter.IsDeleted);
            #endregion

            #region Gider
            builder.Entity<Gider>()
                    .Property(p => p.CategoryType)
                    .HasConversion(type => type.Value, value => GiderCategoryTypeEnum.FromValue(value));
            builder.Entity<Gider>().Property(p => p.Price).HasColumnType("money");
            // Add PaidAmount configuration to prevent silent truncation
            builder.Entity<Gider>().Property(p => p.PaidAmount).HasColumnType("money");
            builder.Entity<Gider>().HasQueryFilter(filter => !filter.IsDeleted);
            #endregion

            #region SalaryPayment
            builder.Entity<SalaryPayment>().Property(p => p.Amount).HasColumnType("money");
            builder.Entity<SalaryPayment>().Property(p => p.BaseSalary).HasColumnType("money");
            builder.Entity<SalaryPayment>().Property(p => p.Overtime).HasColumnType("money");
            builder.Entity<SalaryPayment>().Property(p => p.Bonus).HasColumnType("money");
            builder.Entity<SalaryPayment>().Property(p => p.Allowances).HasColumnType("money");
            builder.Entity<SalaryPayment>().Property(p => p.TaxDeduction).HasColumnType("money");
            builder.Entity<SalaryPayment>().Property(p => p.SocialSecurityDeduction).HasColumnType("money");
            builder.Entity<SalaryPayment>().Property(p => p.HealthInsuranceDeduction).HasColumnType("money");
            builder.Entity<SalaryPayment>().Property(p => p.OtherDeductions).HasColumnType("money");
            builder.Entity<SalaryPayment>().Property(p => p.GrossSalary).HasColumnType("money");
            builder.Entity<SalaryPayment>().Property(p => p.TotalDeductions).HasColumnType("money");
            builder.Entity<SalaryPayment>().Property(p => p.NetSalary).HasColumnType("money");
            builder.Entity<SalaryPayment>().Property(p => p.OvertimeHours).HasColumnType("decimal(7,2)");
            builder.Entity<SalaryPayment>().HasQueryFilter(filter => !filter.IsDeleted);
            #endregion
        }
    }
}